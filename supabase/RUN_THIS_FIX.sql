-- ⚡ FINAL FIX - Run these 2 commands in Supabase SQL Editor

-- Command 1: Fix all broken profiles (copies data from auth.users metadata)
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
AND p.user_type IS NULL
AND u.raw_user_meta_data->>'user_type' IS NOT NULL;

-- Command 2: Remove DEFAULT 'student' from role column
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- ✅ DONE! Now verify:
SELECT 
    p.email,
    p.role,
    p.user_type,
    p.department
FROM public.profiles p
WHERE p.email IN ('roro@ncit.edu.np', 'waa@ncit.edu.np', 'gff@ncit.edu.np')
ORDER BY p.created_at DESC;

-- Expected: All should show role='faculty', user_type='faculty'
