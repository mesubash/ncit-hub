-- Quick Admin Creation SQL
-- Run this in Supabase Dashboard > SQL Editor

-- Method 1: Update existing user to admin by email
UPDATE public.profiles 
SET 
    role = 'admin', 
    department = 'Administration',
    full_name = COALESCE(full_name, 'Admin User'),
    updated_at = NOW()
WHERE email = 'admin@ncit.edu.np';

-- OR Method 2: Update by user ID (more reliable)
UPDATE public.profiles 
SET 
    role = 'admin', 
    department = 'Administration',
    full_name = 'Admin User',
    updated_at = NOW()
WHERE id = 'f4863228-136f-46f9-aa90-f5fff5888360';

-- Verify it worked
SELECT id, email, full_name, role, department 
FROM public.profiles 
WHERE role = 'admin';
