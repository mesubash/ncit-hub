-- Add RPC functions for event participant management
-- These functions ensure atomic updates to participant counts

-- Function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET current_participants = COALESCE(current_participants, 0) + 1
  WHERE id = event_id;
END;
$$;

-- Function to decrement event participants
CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
  WHERE id = event_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_event_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_event_participants(UUID) TO authenticated;

-- Grant execute permissions to anon users (for public event pages)
GRANT EXECUTE ON FUNCTION increment_event_participants(UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_event_participants(UUID) TO anon;

-- Add comments
COMMENT ON FUNCTION increment_event_participants(UUID) IS 'Atomically increment event participant count';
COMMENT ON FUNCTION decrement_event_participants(UUID) IS 'Atomically decrement event participant count (minimum 0)';
