-- Add new notification types: blog_approved, blog_rejected, and blog_submitted
-- Migration: Add notification types for blog approval/rejection workflow and admin notifications

-- Drop the existing constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the new constraint with additional types
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'blog_comment', 
  'blog_like', 
  'event_reminder', 
  'registration_confirmation', 
  'blog_published',
  'blog_approved',
  'blog_rejected',
  'blog_submitted'
));

-- Add a policy for system to create notifications (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'System can create notifications'
  ) THEN
    CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Add a policy for users to delete their own notifications (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Users can delete their own notifications'
  ) THEN
    CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;
