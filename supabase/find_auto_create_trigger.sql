-- Check what's creating these broken profiles
-- The profiles have NULL user_type which means they're being created somewhere else

-- 1. Check for triggers on auth.users that might auto-create profiles
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 2. Check for functions that might be called on user creation
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_definition ILIKE '%insert%profile%';

-- 3. Look for any function with "new_user" or "handle_user"
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (proname ILIKE '%user%' OR proname ILIKE '%profile%')
AND prosrc ILIKE '%insert%';

-- 4. Check for webhook or edge function triggers
SELECT * FROM pg_trigger WHERE tgname ILIKE '%user%' OR tgname ILIKE '%profile%';
