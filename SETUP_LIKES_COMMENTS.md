# Quick Setup Guide - Likes & Comments System

## 🚀 Setup Steps

### 1. Apply Database Migration

Run the migration to add the `comment_likes` table and `likes_count` column:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20231016_add_comment_likes.sql`
4. Paste and run the SQL

**Option B: Using Supabase CLI** (if you have it installed)
```bash
supabase db push
```

**Option C: Run SQL directly**
Copy and paste this into Supabase SQL Editor:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Comment likes are viewable by everyone"
ON public.comment_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comment likes"
ON public.comment_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes"
ON public.comment_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Helper functions
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
```

### 2. Verify Migration

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'comment_likes';

-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'comments' 
AND column_name = 'likes_count';
```

### 3. Test the System

1. **Restart your dev server** (if running)
   ```bash
   pnpm dev
   ```

2. **Navigate to any blog post**
   - Go to `/blogs` and click on a blog

3. **Test Blog Likes**
   - Click the heart button (must be logged in)
   - Count should increment
   - Click again to unlike

4. **Test Comments**
   - Scroll to comments section
   - Post a comment
   - Reply to a comment
   - Edit your comment
   - Delete your comment

5. **Test Comment Likes**
   - Click heart button on any comment
   - Count should increment

6. **Test Real-time**
   - Open the same blog in two browser tabs
   - Like/comment in one tab
   - See updates in the other tab

## 📦 Files Created

```
lib/
  ✅ comments.ts                    # Core functions for likes & comments

components/
  ✅ like-button.tsx                # Reusable like button
  ✅ comments-section.tsx           # Comments UI with nested replies
  ✅ blog-interactions.tsx          # Wrapper component

supabase/
  ✅ migrations/
      20231016_add_comment_likes.sql

docs/
  ✅ LIKES_COMMENTS_SYSTEM.md      # Full documentation
  ✅ SETUP_LIKES_COMMENTS.md       # This file
```

## ✅ Features Implemented

### Blog Likes
- ✅ Like/unlike blogs
- ✅ Real-time like count updates
- ✅ Optimistic UI updates
- ✅ Authentication required
- ✅ Duplicate prevention

### Comments
- ✅ Create comments
- ✅ Nested replies (3 levels deep)
- ✅ Edit own comments
- ✅ Delete own comments
- ✅ Real-time updates
- ✅ Author badges (Admin)
- ✅ Edit history tracking
- ✅ Timestamps with relative time

### Comment Likes
- ✅ Like/unlike comments
- ✅ Real-time like count
- ✅ Optimistic UI updates
- ✅ Duplicate prevention

### Additional Features
- ✅ Social sharing (Twitter, Facebook, LinkedIn, WhatsApp)
- ✅ Copy link to clipboard
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Loading states
- ✅ Error handling

## 🧪 Testing Checklist

- [ ] Blog likes increment/decrement correctly
- [ ] Comments post successfully
- [ ] Nested replies work (up to 3 levels)
- [ ] Comment editing saves changes
- [ ] Comment deletion removes comment
- [ ] Comment likes increment/decrement
- [ ] Real-time updates work (test with 2 tabs)
- [ ] Social sharing buttons work
- [ ] Copy link works
- [ ] Authentication gates work (logged out users see disabled buttons)
- [ ] Mobile responsive design works

## 🐛 Troubleshooting

### Comments not showing
```sql
-- Check if comments table has data
SELECT * FROM public.comments LIMIT 5;
```

### Likes not incrementing
```sql
-- Check if helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%_likes%';
```

### RLS Policy Issues
```sql
-- Check if policies are enabled
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('likes', 'comments', 'comment_likes');
```

### Real-time not working
1. Check if Supabase Realtime is enabled in your project settings
2. Check browser console for WebSocket errors
3. Verify you're subscribed to the correct channel

## 📚 Documentation

For detailed information, see:
- **Full System Docs**: `LIKES_COMMENTS_SYSTEM.md`
- **API Reference**: Check `lib/comments.ts` for all available functions
- **Component Props**: Check component files for prop interfaces

## 🎉 You're Done!

The likes and comments system is now fully implemented and ready to use!

**Next Steps:**
- Test all features thoroughly
- Customize styling if needed
- Monitor performance with large datasets
- Consider adding features from "Future Enhancements" in the docs

## 📞 Need Help?

Common issues:
1. **Migration failed**: Make sure you have admin access to Supabase
2. **RLS blocking**: Check policies are created correctly
3. **Real-time not working**: Enable Realtime in Supabase project settings
4. **TypeScript errors**: Run `pnpm run build` to check for issues
