 import { useEffect, useState, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import type { User, Session } from "@supabase/supabase-js";
 
 interface AuthState {
   user: User | null;
   session: Session | null;
   isAdmin: boolean;
   isLoading: boolean;
   userName: string;
 }
 
 export const useAuth = () => {
   const [state, setState] = useState<AuthState>({
     user: null,
     session: null,
     isAdmin: false,
     isLoading: true,
     userName: "",
   });
   const requestIdRef = useRef(0);
 
   useEffect(() => {
     let isMounted = true;
 
     const extractUserName = (user: User): string => {
       if (user.user_metadata?.full_name) {
         return user.user_metadata.full_name.split(" ")[0];
       }
       if (user.email) {
         const emailName = user.email.split("@")[0];
         return emailName.charAt(0).toUpperCase() + emailName.slice(1);
       }
       return "Usuário";
     };
 
     const checkAdminRole = async (userId: string, requestId: number): Promise<boolean> => {
       try {
         const { data, error } = await supabase
           .from("user_roles")
           .select("role")
           .eq("user_id", userId)
           .eq("role", "admin")
           .maybeSingle();
 
         if (!isMounted || requestIdRef.current !== requestId) return false;
         if (error) {
           console.error("Error checking admin status:", error);
           return false;
         }
         return !!data;
       } catch (err) {
         if (!isMounted || requestIdRef.current !== requestId) return false;
         console.error("Error in checkAdminRole:", err);
         return false;
       }
     };
 
     // INITIAL SESSION CHECK - controls isLoading
     const initializeAuth = async () => {
       try {
         const { data: { session } } = await supabase.auth.getSession();
         
         if (!isMounted) return;
 
         if (session?.user) {
           const requestId = ++requestIdRef.current;
           const isAdmin = await checkAdminRole(session.user.id, requestId);
           
           if (!isMounted) return;
           
           setState({
             user: session.user,
             session,
             isAdmin,
             isLoading: false,
             userName: extractUserName(session.user),
           });
         } else {
           setState({
             user: null,
             session: null,
             isAdmin: false,
             isLoading: false,
             userName: "",
           });
         }
       } catch (error) {
         console.error("Error initializing auth:", error);
         if (isMounted) {
           setState(prev => ({ ...prev, isLoading: false }));
         }
       }
     };
 
     // AUTH STATE LISTENER - does NOT control isLoading after init
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         if (!isMounted) return;
 
         console.log("Auth event:", event);
 
         if (event === "SIGNED_OUT") {
           setState({
             user: null,
             session: null,
             isAdmin: false,
             isLoading: false,
             userName: "",
           });
           return;
         }
 
         if (session?.user) {
           const userName = extractUserName(session.user);
           
           // Update user immediately, check admin in background
           setState(prev => ({
             ...prev,
             user: session.user,
             session,
             userName,
           }));
 
           // Defer admin check to avoid Supabase deadlock
           const requestId = ++requestIdRef.current;
           setTimeout(async () => {
             if (!isMounted || requestIdRef.current !== requestId) return;
             const isAdmin = await checkAdminRole(session.user.id, requestId);
             if (isMounted && requestIdRef.current === requestId) {
               setState(prev => ({ ...prev, isAdmin }));
             }
           }, 0);
         }
       }
     );
 
     initializeAuth();
 
     return () => {
       isMounted = false;
       subscription.unsubscribe();
     };
   }, []);
 
  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      // Limpar estado local primeiro
      setState({
        user: null,
        session: null,
        isAdmin: false,
        isLoading: false,
        userName: "",
      });
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      
      // Reload completo para limpar todos os estados
      window.location.href = '/';
      
      return { error: null };
    } catch (error) {
      console.error("Error signing out:", error);
      // Mesmo com erro, forçar reload para limpar estado
      window.location.href = '/';
      return { error: error as Error };
    }
  };
 
   return {
     ...state,
     signOut,
   };
 };