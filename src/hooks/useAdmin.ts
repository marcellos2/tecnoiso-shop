import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async (userId: string, requestId: number) => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (!isMounted || requestIdRef.current !== requestId) return;

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        if (!isMounted || requestIdRef.current !== requestId) return;
        console.error("Error in checkAdminStatus:", err);
        setIsAdmin(false);
      }
    };

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          const requestId = ++requestIdRef.current;
          await checkAdminStatus(sessionUser.id, requestId);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Listener for auth changes - does NOT control loading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('useAdmin auth event:', event);
        
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          const requestId = ++requestIdRef.current;
          // Defer to avoid Supabase deadlock
          setTimeout(() => {
            if (isMounted) {
              checkAdminStatus(sessionUser.id, requestId);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
};
