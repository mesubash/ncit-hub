# 🔒 Fix Blog Creation - RLS Permission Error

## The Error
```
new row violates row-level security policy for table "blogs"
POST .../rest/v1/blogs 403 (Forbidden)
```

## What Happened?
Supabase's **Row-Level Security (RLS)** is blocking blog creation because there are no policies allowing authenticated users to INSERT blogs.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Run This SQL
Copy and paste this entire script:

```sql
-- Allow authenticated users to create blogs
CREATE POLICY "Authenticated users can create blogs"
ON blogs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Allow users to view their own blogs
CREATE POLICY "Users can view their own blogs"
ON blogs FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- Allow everyone to view published blogs
CREATE POLICY "Anyone can view published blogs"
ON blogs FOR SELECT
TO public
USING (status = 'published');

-- Allow admins to view all blogs
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

-- Allow users to update their own blogs
CREATE POLICY "Users can update their own blogs"
ON blogs FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

-- Allow admins to update any blog
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
```

### Step 3: Click "RUN" ▶️

### Step 4: Test Blog Creation
1. Go back to your app: http://localhost:3000
2. Login as student/faculty
3. Go to "Write Blog"
4. Fill in title, category, content (100+ characters)
5. Click "Submit for Review"
6. ✅ Should work now!

## What These Policies Do

| Policy | Who | Action | Condition |
|--------|-----|--------|-----------|
| Create blogs | Authenticated users | INSERT | Only if they're the author |
| View own blogs | Authenticated users | SELECT | Only their own blogs |
| View published | Everyone (public) | SELECT | Only published blogs |
| View all blogs | Admins | SELECT | All statuses |
| Update own | Authenticated users | UPDATE | Only their own blogs |
| Update any | Admins | UPDATE | Any blog (for approval) |

## Complete Setup (Optional)

If you want to set up RLS for all tables (categories, events, etc.), run the script in:
- `FIX_BLOG_RLS_POLICIES.sql` (blogs only)
- `COMPLETE_RLS_SETUP.sql` (all tables)

## Verify It Worked

After running the SQL, check in Supabase:
1. Go to **Database** → **Policies**
2. Select `blogs` table
3. You should see policies like:
   - "Authenticated users can create blogs"
   - "Users can view their own blogs"
   - "Anyone can view published blogs"
   - etc.

## Why Did This Happen?

Supabase has RLS **enabled by default** for security. Without policies, no one can read/write data. This is GOOD for security, but we need to explicitly allow:
- Students/faculty to create their own blogs
- Everyone to read published blogs
- Admins to manage all blogs

## Common Issues

### "Policy already exists"
If you see this error, policies were already created. Drop them first:
```sql
DROP POLICY IF EXISTS "Authenticated users can create blogs" ON blogs;
-- then recreate
```

### Still getting 403 error
1. Check if user is authenticated: `SELECT auth.uid();` should return a UUID
2. Check if RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'blogs';`
3. Check policies: `SELECT * FROM pg_policies WHERE tablename = 'blogs';`

## Test Again
After applying the SQL:
1. Refresh your browser (hard refresh: Cmd+Shift+R)
2. Try creating a blog
3. Check browser console for errors
4. Check Supabase logs: **Logs** → **API Logs**

✅ Blog creation should now work!
