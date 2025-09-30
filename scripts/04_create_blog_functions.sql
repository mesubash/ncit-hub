-- Function to increment blog views
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs 
  SET views = views + 1 
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment blog likes
CREATE OR REPLACE FUNCTION increment_blog_likes(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs 
  SET likes = likes + 1 
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement blog likes
CREATE OR REPLACE FUNCTION decrement_blog_likes(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs 
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;
