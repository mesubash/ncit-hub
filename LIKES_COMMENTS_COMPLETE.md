# 💬 Likes & Comments System - Complete Implementation Guide

## 🎯 Overview

A complete, scalable likes and comments system for NCIT Hub with:
- ✅ Blog likes (like/unlike)
- ✅ Nested comments (up to 3 levels deep)
- ✅ Comment likes
- ✅ Real-time updates
- ✅ Optimistic UI
- ✅ Proper authentication & authorization

---

## 📊 Database Schema

### Tables Created

#### 1. `comments` table (updated)
- Added `likes_count INTEGER DEFAULT 0` column
- Tracks total likes for each comment

#### 2. `likes` table (existing)
- For blog likes
- One like per user per blog

#### 3. `comment_likes` table (new)
- For comment likes
- One like per user per comment
- Schema:
```sql
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    comment_id UUID REFERENCES comments(id),
    created_at TIMESTAMP,
    UNIQUE(user_id, comment_id)
);
```

### Indexes
- `idx_comment_likes_comment_id` - Fast comment lookup
- `idx_comment_likes_user_id` - Fast user lookup

### RLS Policies
- ✅ Everyone can view all likes
- ✅ Authenticated users can create their own likes
- ✅ Users can delete their own likes

### Helper Functions
```sql
-- Blog likes
increment_blog_likes(blog_id UUID)
decrement_blog_likes(blog_id UUID)

-- Comment likes
increment_comment_likes(comment_id UUID)
decrement_comment_likes(comment_id UUID)
```

---

## 📁 Files Created

### 1. **`/lib/comments.ts`** - Core Library
Complete API for likes and comments:

**Blog Likes:**
- `likeBlog(blogId, userId)`
- `unlikeBlog(blogId, userId)`
- `hasUserLikedBlog(blogId, userId)`
- `getBlogLikesCount(blogId)`

**Comments:**
- `getComments(blogId, userId?)` - Returns nested structure
- `getCommentCount(blogId)`
- `createComment(blogId, content, authorId, parentId?)`
- `updateComment(commentId, content, userId)`
- `deleteComment(commentId, userId)`

**Comment Likes:**
- `likeComment(commentId, userId)`
- `unlikeComment(commentId, userId)`
- `hasUserLikedComment(commentId, userId)`

**Real-time:**
- `subscribeToBlogLikes(blogId, callback)`
- `subscribeToComments(blogId, callback)`
- `subscribeToCommentLikes(callback)`

### 2. **`/components/like-button.tsx`** - Reusable Like Button
- 💚 Optimistic updates
- ❤️ Animated heart icon
- 🔢 Shows like count
- 📏 3 sizes: sm, md, lg
- 🎨 Customizable styles

### 3. **`/components/comments-section.tsx`** - Full Comments UI
- 💬 Comment form with authentication check
- 🔄 Real-time updates
- 🪺 Nested replies (max 3 levels)
- ✏️ Edit/delete own comments
- ❤️ Like comments
- 👤 Author avatars & badges
- ⏰ Relative timestamps
- ⚠️ Delete confirmation dialog

### 4. **`/components/blog-interactions.tsx`** - Blog Page Integration
- 💚 Blog like button
- 💬 Comment count
- 🔗 Share dialog (Twitter, Facebook, LinkedIn, WhatsApp, Copy)
- 🔖 Bookmark placeholder
- 📊 Real-time updates

### 5. **`/app/blogs/[id]/page.tsx`** - Updated Blog Page
- Integrated `BlogInteractions` component
- Removed old static buttons
- Clean, modern layout

---

## 🚀 Setup Instructions

### Step 1: Apply Database Migration

Run the migration to add `comment_likes` table:

```bash
# Using Supabase CLI
supabase db reset

# Or apply the SQL directly in Supabase Dashboard
# Go to: SQL Editor → New Query → Paste contents of:
# /supabase/migrations/20231016_add_comment_likes.sql
```

### Step 2: Verify Schema

The changes are already in `/supabase/final_schema.sql` ✅

To verify in your database:
```sql
-- Check if comment_likes table exists
SELECT * FROM comment_likes LIMIT 1;

-- Check if likes_count column exists in comments
SELECT likes_count FROM comments LIMIT 1;
```

### Step 3: Test the System

1. **Start your dev server:**
```bash
pnpm dev
```

2. **Open any blog post:**
```
http://localhost:3000/blogs/{blog-id}
```

3. **Test features:**
- ✅ Like the blog (heart button)
- ✅ Add a comment
- ✅ Like a comment
- ✅ Reply to a comment
- ✅ Edit your comment
- ✅ Delete your comment
- ✅ Share the blog

---

## 🎨 UI Features

### Like Button
- **Inactive:** Gray outline, empty heart
- **Active:** Red background, filled heart
- **Hover:** Smooth transition
- **Loading:** Disabled state during API call
- **Optimistic:** Updates immediately, reverts on error

### Comments
- **Nested replies:** Up to 3 levels deep
- **Edit mode:** Inline editing with save/cancel
- **Delete:** Confirmation dialog
- **Real-time:** Auto-updates when others comment
- **Avatars:** User profile pictures
- **Badges:** Admin/Student role badges
- **Timestamps:** "2 minutes ago" format

### Share Dialog
- **Social platforms:** Twitter, Facebook, LinkedIn, WhatsApp
- **Copy link:** One-click copy to clipboard
- **Toast notifications:** Feedback for all actions

---

## 🔧 Technical Details

### Optimistic Updates
The system uses optimistic updates for better UX:
1. User clicks like → UI updates immediately
2. API call happens in background
3. If error → UI reverts + shows error message
4. If success → No change needed (already updated)

### Real-time Sync
Uses Supabase Realtime:
```typescript
// Subscribe to blog likes
const channel = subscribeToBlogLikes(blogId, () => {
  // Refresh likes count
})

// Subscribe to comments
const channel = subscribeToComments(blogId, () => {
  // Reload comments
})

// Cleanup
return () => channel.unsubscribe()
```

### Nested Comments Algorithm
```typescript
// 1. Fetch all comments flat
// 2. Build a Map of comment objects
// 3. Loop through and attach children to parents
// 4. Return only root-level comments (parent_id = null)
// Result: Fully nested tree structure
```

### Security
- ✅ RLS enforces user can only modify their own likes/comments
- ✅ Authentication required for all mutations
- ✅ Server-side validation
- ✅ SQL injection protection (parameterized queries)

---

## 📊 API Usage Examples

### Like a Blog
```typescript
import { likeBlog, unlikeBlog } from "@/lib/comments"

// Like
const { like, error } = await likeBlog(blogId, userId)

// Unlike
const { error } = await unlikeBlog(blogId, userId)
```

### Add a Comment
```typescript
import { createComment } from "@/lib/comments"

const { comment, error } = await createComment(
  blogId,
  "Great article!",
  userId,
  null // or parentId for reply
)
```

### Get Comments with Nested Replies
```typescript
import { getComments } from "@/lib/comments"

const { comments, error } = await getComments(blogId, userId)
// Returns: Comment[] with nested replies in .replies property
```

### Like a Comment
```typescript
import { likeComment, unlikeComment } from "@/lib/comments"

await likeComment(commentId, userId)
await unlikeComment(commentId, userId)
```

---

## 🎯 Features Implemented

### Blog Features
- [x] Like/unlike blogs
- [x] Real-time like count updates
- [x] Authenticated-only likes
- [x] One like per user per blog
- [x] Optimistic UI updates

### Comment Features
- [x] Add comments to blogs
- [x] Nested replies (3 levels max)
- [x] Edit own comments
- [x] Delete own comments (with confirmation)
- [x] Real-time comment updates
- [x] Show author info & avatars
- [x] Admin/Student badges
- [x] Relative timestamps
- [x] "Edited" indicator

### Comment Like Features
- [x] Like/unlike comments
- [x] Real-time like count updates
- [x] One like per user per comment
- [x] Optimistic UI updates
- [x] Like count display

### Share Features
- [x] Share to Twitter
- [x] Share to Facebook
- [x] Share to LinkedIn
- [x] Share to WhatsApp
- [x] Copy link to clipboard
- [x] Toast notifications

### UX Features
- [x] Loading states
- [x] Error handling
- [x] Empty states
- [x] Responsive design
- [x] Dark mode support
- [x] Smooth animations
- [x] Keyboard accessible

---

## 🐛 Troubleshooting

### Comments not appearing?
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'comments';

-- Test direct insert
INSERT INTO comments (blog_id, content, author_id)
VALUES ('your-blog-id', 'Test', 'your-user-id');
```

### Likes not working?
```typescript
// Check authentication
const { user } = await supabase.auth.getUser()
console.log('User:', user)

// Check if already liked
const { isLiked } = await hasUserLikedBlog(blogId, userId)
console.log('Already liked:', isLiked)
```

### Real-time not updating?
```typescript
// Check channel subscription
const channel = supabase.channel('test')
  .on('postgres_changes', { ... }, (payload) => {
    console.log('Received:', payload)
  })
  .subscribe((status) => {
    console.log('Channel status:', status)
  })
```

---

## 📈 Performance Considerations

### Indexes
All performance-critical columns are indexed:
- `blog_id` on comments
- `comment_id` on comment_likes
- `user_id` on likes and comment_likes

### Pagination
For blogs with 100+ comments, consider adding pagination:
```typescript
const { comments } = await getComments(blogId, userId, { 
  limit: 20, 
  offset: 0 
})
```

### Caching
Consider caching comment counts:
```typescript
// Cache in localStorage
localStorage.setItem(`blog-${blogId}-comments`, count)
```

---

## 🎉 Success!

Your likes and comments system is now fully functional! Users can:
- ❤️ Like blogs and comments
- 💬 Write and reply to comments
- ✏️ Edit and delete their own content
- 🔄 See updates in real-time
- 🔗 Share content on social media

**Next Steps:**
1. Test all features thoroughly
2. Monitor real-time performance
3. Consider adding notifications for new comments/likes
4. Add moderation tools for admins

---

## 📚 Dependencies

Already installed:
- `@supabase/supabase-js` - Database client
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `shadcn/ui` - UI components

---

**Built with ❤️ for NCIT Hub**
