-- Add comment likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- Add likes_count to comments table
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

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

-- Helper functions for comment likes
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

-- Grant permissions
GRANT SELECT ON public.comment_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.comment_likes TO authenticated;
