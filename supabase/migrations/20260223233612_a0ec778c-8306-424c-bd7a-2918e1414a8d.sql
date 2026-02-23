
-- Fix: Drop ALL existing restrictive policies on products and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

-- Recreate ALL as PERMISSIVE (default)
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
