-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";  -- For case-insensitive email comparisons

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('student', 'faculty', 'admin')),
    user_type TEXT CHECK (user_type IN ('bachelor_student', 'master_student', 'faculty')),
    department TEXT,
    program_type TEXT CHECK (program_type IN ('bachelor', 'master')), -- Bachelor or Master's program
    semester INTEGER CHECK (semester BETWEEN 1 AND 8), -- For bachelor students (1-8)
    year INTEGER CHECK (year BETWEEN 1 AND 2), -- For master students (1-2)
    specialization TEXT, -- For master's students or faculty's expertise
    bio TEXT,
    social_links JSONB DEFAULT '{}',  -- Store social media links
    email_verified BOOLEAN DEFAULT FALSE,  -- Email verification status
    email_verified_at TIMESTAMP WITH TIME ZONE,  -- When email was verified
    google_id TEXT UNIQUE,  -- Google OAuth ID
    google_account_verified BOOLEAN DEFAULT FALSE,  -- Google OAuth verification status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create OTP tokens table for email verification and password reset
CREATE TABLE IF NOT EXISTS public.otp_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email CITEXT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('email_verification', 'password_reset', 'account_recovery')),
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    is_used BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for OTP tokens
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON public.otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON public.otp_tokens(email);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_code ON public.otp_tokens(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires_at ON public.otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_purpose ON public.otp_tokens(purpose);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,  -- Store icon name or URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table for better tag management
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    featured_image TEXT,
    read_time INTEGER DEFAULT 0,
    meta_description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    rejection_reason TEXT,  -- Feedback from admin when a blog is rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    last_autosave_at TIMESTAMP WITH TIME ZONE,  -- For draft autosave
    autosave_content TEXT,  -- Store autosaved content
    share_count INTEGER DEFAULT 0  -- Track social shares
);

-- Blog tags relation table
CREATE TABLE IF NOT EXISTS public.blog_tags (
    blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (blog_id, tag_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organizer_name TEXT,  -- Custom organizer name (e.g., "NCIT Computer Club", "Student Council")
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,  -- Added end date for multi-day events
    location TEXT NOT NULL,
    venue_details JSONB,  -- Store detailed venue information
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    images TEXT[] DEFAULT '{}',
    featured_image TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    is_featured BOOLEAN DEFAULT false,  -- For featuring special events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE
);

-- Create likes table (for blog likes)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, blog_id)
);

-- Create comment likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, blog_id)
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    UNIQUE(user_id, event_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('blog_comment', 'blog_like', 'event_reminder', 'registration_confirmation', 'blog_published', 'blog_approved', 'blog_rejected', 'blog_submitted')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature toggles table to manage optional modules
CREATE TABLE IF NOT EXISTS public.feature_toggles (
    feature TEXT PRIMARY KEY,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default event management toggle (enabled by default)
INSERT INTO public.feature_toggles (feature, description, is_enabled)
VALUES (
    'event_management',
    'Controls the visibility of the event management experience across NCIT Hub.',
    TRUE
)
ON CONFLICT (feature) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_category_id ON public.blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON public.comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_likes_blog_id ON public.likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_blog_id ON public.bookmarks(blog_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_tokens ENABLE ROW LEVEL SECURITY;

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_blogs
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_events
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_feature_toggles
    BEFORE UPDATE ON public.feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_comments
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_otp_tokens
    BEFORE UPDATE ON public.otp_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can delete any user profile"
ON public.profiles FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "Admins can update any user profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify categories"
ON public.categories
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

-- Blogs policies
CREATE POLICY "Published blogs are viewable by everyone"
ON public.blogs FOR SELECT
USING (status = 'published');

CREATE POLICY "Draft blogs are viewable by author"
ON public.blogs FOR SELECT
USING (auth.uid() = author_id AND status = 'draft');

CREATE POLICY "Users can create blogs"
ON public.blogs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their blogs"
ON public.blogs FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their blogs"
ON public.blogs FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Only admins can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "Only admins can update events"
ON public.events FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
ON public.likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create likes"
ON public.likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Comment likes are viewable by everyone"
ON public.comment_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comment likes"
ON public.comment_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes"
ON public.comment_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Event registrations policies
CREATE POLICY "Event registrations are viewable by registrant and admin"
ON public.event_registrations FOR SELECT
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Authenticated users can register for events"
ON public.event_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own event registrations"
ON public.event_registrations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Feature toggles policies
CREATE POLICY "Feature toggles are readable by everyone"
ON public.feature_toggles FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert feature toggles"
ON public.feature_toggles FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "Only admins can update feature toggles"
ON public.feature_toggles FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "Only admins can delete feature toggles"
ON public.feature_toggles FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

-- OTP tokens policies
CREATE POLICY "Users can view their own OTP tokens"
ON public.otp_tokens FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service can create OTP tokens (no auth required)"
ON public.otp_tokens FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own OTP tokens"
ON public.otp_tokens FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OTP tokens"
ON public.otp_tokens FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Helper functions
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs 
  SET views = views + 1 
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_blog_likes(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs 
  SET likes = likes + 1 
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_blog_likes(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs 
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.comments 
  SET likes_count = likes_count + 1 
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.comments 
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = COALESCE(current_participants, 0) + 1 
  WHERE id = event_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
  WHERE id = event_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_notification(
  user_id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  link TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (user_id, type, title, message, link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- OTP Helper Functions
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS VARCHAR(6) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_tokens 
  WHERE expires_at < NOW() 
  AND is_used = FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_otp(
  p_email CITEXT,
  p_otp_code VARCHAR(6),
  p_purpose TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID
) AS $$
DECLARE
  v_otp_record RECORD;
  v_user_id UUID;
BEGIN
  -- Find the OTP token
  SELECT * INTO v_otp_record
  FROM public.otp_tokens
  WHERE email = p_email
  AND otp_code = p_otp_code
  AND purpose = p_purpose
  AND is_used = FALSE
  AND expires_at > NOW()
  AND attempts < max_attempts
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_otp_record IS NULL THEN
    -- Try to find the user for the error response
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE email = p_email
    LIMIT 1;

    RETURN QUERY SELECT FALSE, 'Invalid or expired OTP'::TEXT, v_user_id;
    RETURN;
  END IF;

  -- Mark OTP as used
  UPDATE public.otp_tokens
  SET is_used = TRUE,
      verified_at = NOW(),
      updated_at = NOW()
  WHERE id = v_otp_record.id;

  -- Mark email as verified if this was an email verification OTP
  IF p_purpose = 'email_verification' THEN
    UPDATE public.profiles
    SET email_verified = TRUE,
        email_verified_at = NOW(),
        updated_at = NOW()
    WHERE email = p_email;
  END IF;

  RETURN QUERY SELECT TRUE, 'OTP verified successfully'::TEXT, v_otp_record.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant execute permissions for RPC functions
GRANT EXECUTE ON FUNCTION increment_event_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_event_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_event_participants(UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_event_participants(UUID) TO anon;
GRANT EXECUTE ON FUNCTION generate_otp_code() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_otps() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_otp(CITEXT, VARCHAR, TEXT) TO authenticated, anon;
