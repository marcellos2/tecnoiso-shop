import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
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
      } finally {
        if (!isMounted || requestIdRef.current !== requestId) return;
        setRoleLoading(false);
      }
    };

    const loadForSession = async (sessionUser: User | null) => {
      const requestId = ++requestIdRef.current;

      setUser(sessionUser);

      if (!sessionUser) {
        setIsAdmin(false);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      await checkAdminStatus(sessionUser.id, requestId);
    };

    // IMPORTANT: listener first, then getSession.
    // Also: never make the auth-state callback async or call Supabase inside it.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setAuthLoading(false);
      const sessionUser = session?.user ?? null;
      setTimeout(() => {
        if (!isMounted) return;
        void loadForSession(sessionUser);
      }, 0);
    });

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setAuthLoading(false);
      void loadForSession(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading: authLoading || roleLoading };
};
