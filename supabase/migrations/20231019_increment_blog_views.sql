-- Create function to atomically increment blog views
-- This prevents race conditions when multiple users view a blog simultaneously

CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blogs
  SET views = views + 1
  WHERE id = blog_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_blog_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_blog_views(UUID) TO anon;
