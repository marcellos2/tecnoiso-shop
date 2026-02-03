-- Add explicit deny policies for anonymous access on profiles table
CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Add explicit deny policies for anonymous access on orders table  
CREATE POLICY "Deny anonymous access to orders"
  ON public.orders
  FOR ALL
  USING (auth.uid() IS NOT NULL);