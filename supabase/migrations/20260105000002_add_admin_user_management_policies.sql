-- Add RLS policies for admin user management
-- This allows admins to delete and update other users' profiles

-- Update the existing "Users can update own profile" policy to include WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add policy for admins to delete any user profile
CREATE POLICY IF NOT EXISTS "Admins can delete any user profile"
ON public.profiles FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

-- Add policy for admins to update any user profile  
CREATE POLICY IF NOT EXISTS "Admins can update any user profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));
