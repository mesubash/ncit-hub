-- Fix all broken profiles in one go
-- These profiles have user_type=NULL but should have user_type from auth metadata

-- Step 1: Update profiles to match their auth.users metadata
UPDATE public.profiles p
SET 
    role = CASE 
        WHEN u.raw_user_meta_data->>'user_type' = 'faculty' THEN 'faculty'
        ELSE 'student'
    END,
    user_type = u.raw_user_meta_data->>'user_type',
    program_type = NULLIF(u.raw_user_meta_data->>'program_type', ''),
    semester = CASE 
        WHEN u.raw_user_meta_data->>'semester' IS NOT NULL 
        AND u.raw_user_meta_data->>'semester' != '' 
        THEN (u.raw_user_meta_data->>'semester')::INTEGER 
        ELSE NULL 
    END,
    year = CASE 
        WHEN u.raw_user_meta_data->>'year' IS NOT NULL 
        AND u.raw_user_meta_data->>'year' != '' 
        THEN (u.raw_user_meta_data->>'year')::INTEGER 
        ELSE NULL 
    END,
    specialization = NULLIF(u.raw_user_meta_data->>'specialization', ''),
    updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
AND p.user_type IS NULL  -- Only update broken profiles
AND u.raw_user_meta_data->>'user_type' IS NOT NULL;  -- Only if metadata exists

-- Step 2: Verify the fix
SELECT 
    'AFTER UPDATE' as status,
    p.email,
    p.full_name,
    p.role,
    p.user_type,
    p.department,
    u.raw_user_meta_data->>'user_type' as metadata_user_type,
    u.raw_user_meta_data->>'role' as metadata_role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('roro@ncit.edu.np', 'waa@ncit.edu.np', 'gff@ncit.edu.np')
ORDER BY p.created_at DESC;

-- Expected result: role and user_type should now match the metadata
