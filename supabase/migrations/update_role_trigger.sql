-- Script to update the new user registration trigger in Supabase
-- This function is called by a trigger on the auth.users table.
-- It ensures that any new user starts with the role 'usuario'.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (new.id, new.email, 'usuario') -- Correctly assigned to 'usuario'
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
