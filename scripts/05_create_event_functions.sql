-- Function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = current_participants + 1 
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement event participants
CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = GREATEST(current_participants - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;
