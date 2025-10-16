-- Add organizer_name field to events table
-- This allows specifying a custom organizer name instead of always using the admin's name

ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_name TEXT;

-- Add comment
COMMENT ON COLUMN events.organizer_name IS 'Custom organizer name (e.g., "NCIT Computer Club", "Student Council")';

-- Update existing events to use the profile's full name if organizer_name is null
UPDATE events e
SET organizer_name = p.full_name
FROM profiles p
WHERE e.organizer_id = p.id AND e.organizer_name IS NULL;
