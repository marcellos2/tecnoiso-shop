-- Remove hardcoded admin email from handle_new_user trigger
-- All new users will now be assigned 'customer' role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- All new users get customer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Create secure admin promotion function (only existing admins can promote users)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing admins can promote users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can promote users';
  END IF;
  
  -- Update existing customer role to admin or insert if not exists
  UPDATE public.user_roles 
  SET role = 'admin'
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
  END IF;
END;
$$;

-- Create function to demote admin to customer (only admins can demote)
CREATE OR REPLACE FUNCTION public.demote_to_customer(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing admins can demote users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can demote users';
  END IF;
  
  -- Prevent self-demotion to avoid locking out all admins
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  UPDATE public.user_roles 
  SET role = 'customer'
  WHERE user_id = target_user_id;
END;
$$;