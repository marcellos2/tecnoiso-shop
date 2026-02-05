 // Re-export from centralized auth hook for backwards compatibility
 import { useAuth } from "./useAuth";
 
 export const useAdmin = () => {
   const { user, isAdmin, isLoading } = useAuth();
   return { user, isAdmin, loading: isLoading };
 };
