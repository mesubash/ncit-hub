-- Insert default categories
INSERT INTO public.categories (name, description, color) VALUES
    ('Academic', 'Academic events and announcements', '#3B82F6'),
    ('Sports', 'Sports events and competitions', '#EF4444'),
    ('Cultural', 'Cultural programs and festivals', '#8B5CF6'),
    ('Technical', 'Technical workshops and seminars', '#10B981'),
    ('General', 'General announcements and news', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Insert sample admin profile (you'll need to sign up first to get the UUID)
-- This will be updated after authentication is set up
