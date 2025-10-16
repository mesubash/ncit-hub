-- Test script to verify RPC functions exist and work correctly
-- Run this in Supabase SQL Editor

-- 1. Check if functions exist
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'increment_event_participants',
    'decrement_event_participants'
  )
ORDER BY routine_name;

-- 2. Check if functions are executable by authenticated users
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN (
    'increment_event_participants',
    'decrement_event_participants'
  )
ORDER BY routine_name, grantee;

-- 3. Test with a real event (replace with an actual event ID from your database)
-- SELECT increment_event_participants('your-event-uuid-here');
-- SELECT decrement_event_participants('your-event-uuid-here');
