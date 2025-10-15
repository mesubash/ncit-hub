-- Manual Profile Creation for Admin User
-- Run this in Supabase Dashboard > SQL Editor

-- First, check if profile exists
SELECT * FROM public.profiles WHERE email = 'admin@ncit.edu.np';

-- If no profile exists, insert it manually
-- Replace the UUID with the auth user ID: f4863228-136f-46f9-aa90-f5fff5888360
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    created_at,
    updated_at
) VALUES (
    'f4863228-136f-46f9-aa90-f5fff5888360',
    'admin@ncit.edu.np',
    'Admin User',
    'admin',
    'Administration',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    department = 'Administration',
    full_name = 'Admin User',
    updated_at = NOW();

-- Verify it worked
SELECT id, email, full_name, role, department 
FROM public.profiles 
WHERE email = 'admin@ncit.edu.np';
