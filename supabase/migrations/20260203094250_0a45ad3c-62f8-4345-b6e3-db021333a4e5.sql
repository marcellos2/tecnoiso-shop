-- Drop the existing overly permissive INSERT policy for orders
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

-- Create a more secure INSERT policy that allows authenticated users to create orders
-- but only with their own user_id OR null (for edge function with service role)
CREATE POLICY "Users can create orders with own user_id"
  ON public.orders FOR INSERT
  WITH CHECK (
    -- Allow if user_id matches the authenticated user
    (user_id = auth.uid())
    OR 
    -- Allow if user_id is NULL (edge function with service role will set it)
    (user_id IS NULL)
  );

-- Create a function to automatically set user_id on order insert if authenticated
CREATE OR REPLACE FUNCTION public.set_order_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is null and there's an authenticated user, set it
  IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-set user_id
DROP TRIGGER IF EXISTS set_order_user_id_trigger ON public.orders;
CREATE TRIGGER set_order_user_id_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_user_id();