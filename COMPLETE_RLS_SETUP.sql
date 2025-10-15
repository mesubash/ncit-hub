-- Complete RLS Setup for All Tables
-- Run this in Supabase SQL Editor after fixing blogs policies

-- ============================================
-- CATEGORIES TABLE - Public read, admin write
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Everyone can read categories
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
TO public
USING (true);

-- Only admins can insert/update/delete categories
CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- PROFILES TABLE - Users can view/update own
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- ============================================
-- LIKES TABLE - Users can like/unlike
-- ============================================

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view likes" ON likes;
DROP POLICY IF EXISTS "Users can manage their own likes" ON likes;

-- Anyone can view likes count
CREATE POLICY "Users can view likes"
ON likes FOR SELECT
TO public
USING (true);

-- Authenticated users can insert/delete their own likes
CREATE POLICY "Users can manage their own likes"
ON likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE (if exists)
-- ============================================

-- Check if comments table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'comments') THEN
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
    DROP POLICY IF EXISTS "Users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
    
    CREATE POLICY "Anyone can view comments"
    ON comments FOR SELECT
    TO public
    USING (true);
    
    CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- EVENTS TABLE
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

-- Everyone can view events
CREATE POLICY "Anyone can view events"
ON events FOR SELECT
TO public
USING (true);

-- Only admins can manage events
CREATE POLICY "Admins can manage events"
ON events FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- Verify all policies
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
