-- Quick verification script after fix
-- Run this to verify everything is working correctly

-- 1. Check if DEFAULT is removed from role column
SELECT 
    column_name,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('role', 'user_type');

-- Expected result for role:
-- column_default should be NULL (not 'student')

-- 2. Check all profiles to see role distribution
SELECT 
    role,
    user_type,
    COUNT(*) as count
FROM public.profiles
GROUP BY role, user_type
ORDER BY role, user_type;

-- Expected result should show:
-- student | bachelor_student | X
-- student | master_student   | Y  
-- faculty | faculty          | Z

-- 3. Check most recent registrations
SELECT 
    email,
    full_name,
    role,
    user_type,
    department,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check for any profiles where role doesn't match user_type
-- These would indicate the bug
SELECT 
    email,
    full_name,
    role,
    user_type,
    created_at
FROM public.profiles
WHERE 
    (user_type = 'faculty' AND role != 'faculty')
    OR
    (user_type IN ('bachelor_student', 'master_student') AND role != 'student');

-- Expected: Should return NO rows after fix

-- 5. Check auth.users metadata for recent users
SELECT 
    email,
    raw_user_meta_data->>'full_name' as name,
    raw_user_meta_data->>'role' as metadata_role,
    raw_user_meta_data->>'user_type' as metadata_user_type,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- This should now show 'role' in the metadata
