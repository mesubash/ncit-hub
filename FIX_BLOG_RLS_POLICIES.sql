-- Fix Row-Level Security (RLS) Policies for Blogs Table
-- Run this in Supabase SQL Editor

-- 1. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'blogs';

-- 2. Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can insert their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can view published blogs" ON blogs;
DROP POLICY IF EXISTS "Users can update their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can delete their own blogs" ON blogs;

-- 3. Create new permissive policies

-- Allow authenticated users to INSERT their own blogs
CREATE POLICY "Authenticated users can create blogs"
ON blogs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Allow everyone to SELECT published blogs
CREATE POLICY "Anyone can view published blogs"
ON blogs FOR SELECT
TO public
USING (status = 'published');

-- Allow users to SELECT their own blogs (any status)
CREATE POLICY "Users can view their own blogs"
ON blogs FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- Allow admins to SELECT all blogs
CREATE POLICY "Admins can view all blogs"
ON blogs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to UPDATE their own blogs
CREATE POLICY "Users can update their own blogs"
ON blogs FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Allow admins to UPDATE any blog (for approval/rejection)
CREATE POLICY "Admins can update any blog"
ON blogs FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to DELETE their own blogs
CREATE POLICY "Users can delete their own blogs"
ON blogs FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Allow admins to DELETE any blog
CREATE POLICY "Admins can delete any blog"
ON blogs FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Ensure RLS is enabled
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- 5. Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'blogs'
ORDER BY policyname;

-- 6. Test query to check if authenticated user can insert
-- Replace 'YOUR_USER_ID' with actual user ID from auth.users
-- SELECT auth.uid(), * FROM profiles WHERE id = auth.uid();
