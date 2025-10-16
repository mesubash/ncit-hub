# Quick Setup Guide - Avatar & Views Features

## ✅ What's Been Implemented

### 1. Avatar in Navigation
- Desktop navbar dropdown shows user avatar
- Mobile menu shows user avatar
- Fallback to initials if no avatar uploaded

### 2. Blog Views Tracking
- Automatic view counting per blog post
- One count per session per user
- View count displayed on blog detail and listing pages

---

## 🚀 Setup Instructions

### Step 1: Apply Database Migration

You need to run the SQL migration to create the view increment function.

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `/supabase/migrations/20231019_increment_blog_views.sql`
4. Click **Run**

**Option B: Via Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push
```

**The SQL to run:**
```sql
-- Create function to atomically increment blog views
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_blog_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_blog_views(UUID) TO anon;
```

### Step 2: Verify Database Function

Run this in SQL Editor to verify:
```sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'increment_blog_views';

-- Should return: increment_blog_views
```

### Step 3: Test the Application

```bash
# Start the development server
npm run dev
# or
pnpm dev
```

---

## 🧪 Testing Guide

### Test Avatar Display
1. **Login** to your account
2. **Check navbar** (top right) - should see avatar or initials
3. **Go to Profile** → Upload an avatar
4. **Refresh page** - avatar should appear in navbar
5. **Test mobile view** - toggle mobile menu, avatar should show

### Test Blog Views
1. **Visit any blog post**
2. Note the view count in the header (e.g., "1,234 views")
3. **Refresh the page** - view count should NOT increase
4. **Open in incognito/private window** - view count should increase by 1
5. **Check blog listing page** - view count should match
6. **Close browser and reopen** - view should increment again

### Verify Session Storage
1. Open blog post
2. Open **DevTools** (F12)
3. Go to **Application** → **Session Storage**
4. Should see `viewed_blogs` with array of blog IDs

---

## 🐛 Troubleshooting

### Avatar not showing?
```bash
# Check browser console for errors
# Verify avatar_url exists in your profile
# Check Supabase storage "avatars" bucket exists
```

### Views not incrementing?
```bash
# Clear session storage
sessionStorage.clear()

# Check if function exists in database (see Step 2 above)
# Check browser console for errors
```

### Build errors?
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install
# or
pnpm install
```

---

## 📁 Files Changed

**New Files:**
- `/components/blog-view-tracker.tsx`
- `/supabase/migrations/20231019_increment_blog_views.sql`
- `/AVATAR_AND_VIEWS_IMPLEMENTATION.md` (full docs)

**Modified Files:**
- `/components/navigation.tsx`
- `/lib/blog.ts`
- `/app/blogs/[id]/page.tsx`
- `/app/blogs/page.tsx`

---

## ✨ Features Summary

### Avatar in Navbar
- ✅ Shows in desktop dropdown menu
- ✅ Shows in mobile menu
- ✅ Auto-updates when avatar uploaded
- ✅ Fallback to initials
- ✅ Consistent with profile page

### Blog Views
- ✅ Automatic tracking per blog
- ✅ One count per session
- ✅ Works for anonymous users
- ✅ Formatted with thousand separators
- ✅ Eye icon for visual clarity
- ✅ Atomic database operations

---

## 🎉 You're Done!

Both features are fully implemented. Just apply the database migration and test!

**Need help?** Check the full documentation in `AVATAR_AND_VIEWS_IMPLEMENTATION.md`
