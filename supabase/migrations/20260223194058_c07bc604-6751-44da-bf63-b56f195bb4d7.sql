-- Drop the RESTRICTIVE SELECT policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- Also fix the other product policies to be PERMISSIVE (they are currently RESTRICTIVE)
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
CREATE POLICY "Only admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
CREATE POLICY "Only admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
CREATE POLICY "Only admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));