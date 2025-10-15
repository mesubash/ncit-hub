# Likes and Comments System Documentation

## Overview
A complete, scalable system for blog interactions including likes (for both blogs and comments) and nested comments with real-time updates.

## Features

### ✅ Blog Likes
- Like/unlike blogs
- Real-time like count updates
- Optimistic UI updates
- Prevents duplicate likes (database constraint)
- User authentication required

### ✅ Comments System
- Create, edit, and delete comments
- Nested replies (up to 3 levels deep)
- Real-time comment updates
- Author information display
- Admin badge for admin users
- Edit history tracking
- "Edited" indicator

### ✅ Comment Likes
- Like/unlike individual comments
- Real-time like count updates
- Optimistic UI updates
- Prevents duplicate likes

### ✅ Additional Features
- Social sharing (Twitter, Facebook, LinkedIn, WhatsApp)
- Copy link to clipboard
- Bookmark button (placeholder)
- Responsive design
- Dark mode support

## Database Schema

### Tables

#### `comment_likes`
```sql
CREATE TABLE public.comment_likes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    comment_id UUID REFERENCES comments(id),
    created_at TIMESTAMP,
    UNIQUE(user_id, comment_id)
);
```

#### `comments` (updated)
```sql
ALTER TABLE public.comments 
ADD COLUMN likes_count INTEGER DEFAULT 0;
```

### Helper Functions

```sql
-- Increment comment likes
CREATE FUNCTION increment_comment_likes(comment_id UUID)

-- Decrement comment likes  
CREATE FUNCTION decrement_comment_likes(comment_id UUID)

-- Increment blog likes (existing)
CREATE FUNCTION increment_blog_likes(blog_id UUID)

-- Decrement blog likes (existing)
CREATE FUNCTION decrement_blog_likes(blog_id UUID)
```

## File Structure

```
lib/
  comments.ts              # Comments & likes library (core functions)

components/
  like-button.tsx          # Reusable like button component
  comments-section.tsx     # Full comments UI with nested replies
  blog-interactions.tsx    # Wrapper for likes + comments + share

app/
  blogs/
    [id]/
      page.tsx             # Blog detail page (integrated)
```

## Usage

### In a Blog Page

```tsx
import { BlogInteractions } from "@/components/blog-interactions"

<BlogInteractions
  blogId={blog.id}
  initialLikes={blog.likes}
  blogTitle={blog.title}
  blogUrl={`/blogs/${blog.id}`}
/>
```

### Standalone Like Button

```tsx
import { LikeButton } from "@/components/like-button"

<LikeButton
  isLiked={isLiked}
  likesCount={likesCount}
  onLike={handleLike}
  onUnlike={handleUnlike}
  size="md"
  showCount={true}
/>
```

### Standalone Comments

```tsx
import { Comments } from "@/components/comments-section"

<Comments blogId={blogId} />
```

## API Functions

### Blog Likes

```typescript
// Check if user liked a blog
hasUserLikedBlog(blogId: string, userId: string)

// Like a blog
likeBlog(blogId: string, userId: string)

// Unlike a blog
unlikeBlog(blogId: string, userId: string)

// Get blog likes count
getBlogLikesCount(blogId: string)
```

### Comments

```typescript
// Get all comments for a blog (with nested replies)
getComments(blogId: string, userId?: string)

// Get comment count
getCommentCount(blogId: string)

// Create a comment
createComment(blogId: string, content: string, authorId: string, parentId?: string)

// Update a comment
updateComment(commentId: string, content: string, userId: string)

// Delete a comment
deleteComment(commentId: string, userId: string)
```

### Comment Likes

```typescript
// Check if user liked a comment
hasUserLikedComment(commentId: string, userId: string)

// Like a comment
likeComment(commentId: string, userId: string)

// Unlike a comment
unlikeComment(commentId: string, userId: string)
```

### Real-time Subscriptions

```typescript
// Subscribe to blog likes updates
subscribeToBlogLikes(blogId: string, callback: (payload: any) => void)

// Subscribe to comments updates
subscribeToComments(blogId: string, callback: (payload: any) => void)

// Subscribe to comment likes updates
subscribeToCommentLikes(callback: (payload: any) => void)
```

## Security

### Row Level Security (RLS) Policies

#### Likes Table
- ✅ Everyone can view likes
- ✅ Authenticated users can create likes (only for themselves)
- ✅ Users can delete their own likes

#### Comments Table
- ✅ Everyone can view comments
- ✅ Authenticated users can create comments (only for themselves)
- ✅ Users can update their own comments
- ✅ Users can delete their own comments

#### Comment Likes Table
- ✅ Everyone can view comment likes
- ✅ Authenticated users can create comment likes (only for themselves)
- ✅ Users can delete their own comment likes

### Database Constraints
- `UNIQUE(user_id, blog_id)` on likes table - prevents duplicate likes
- `UNIQUE(user_id, comment_id)` on comment_likes table - prevents duplicate likes
- Foreign key constraints with `ON DELETE CASCADE` - clean up orphaned records

## Features Explained

### Optimistic UI Updates
Both the like button and comment actions use optimistic updates:
- UI updates immediately when user clicks
- If API call fails, UI reverts to previous state
- Provides instant feedback and better UX

### Nested Comments
- Comments can have replies (parent_id references)
- Maximum depth: 3 levels (configurable)
- Hierarchical structure built on client-side
- Replies load with parent comment

### Real-time Updates
- Uses Supabase Realtime (Postgres changes)
- Automatic UI updates when:
  - Someone likes/unlikes a blog
  - Someone posts/edits/deletes a comment
  - Someone likes/unlikes a comment
- No page refresh needed

### Comment Actions
- **Reply**: Add a nested reply to any comment (up to depth limit)
- **Edit**: Update your own comment content (marks as edited)
- **Delete**: Remove your own comment (with confirmation dialog)
- **Like**: Like any comment (with heart animation)

### Social Sharing
- Twitter/X
- Facebook
- LinkedIn
- WhatsApp
- Copy link to clipboard

## Migration Instructions

### Apply Migration

```bash
# Using Supabase CLI
supabase db push

# Or using SQL directly in Supabase Dashboard
# Copy and paste: supabase/migrations/20231016_add_comment_likes.sql
```

### Update Existing Comments (Optional)
If you have existing comments, initialize their like counts:

```sql
UPDATE public.comments SET likes_count = 0 WHERE likes_count IS NULL;
```

## Testing Checklist

### Blog Likes
- [ ] Like a blog (count increments)
- [ ] Unlike a blog (count decrements)
- [ ] Try to like twice (should toggle)
- [ ] Real-time update (open in 2 tabs)
- [ ] Like without auth (should show error)

### Comments
- [ ] Post a comment
- [ ] Reply to a comment
- [ ] Edit your comment
- [ ] Delete your comment
- [ ] Try to edit someone else's comment (should fail)
- [ ] View nested replies (3 levels)
- [ ] Real-time updates (2 tabs)

### Comment Likes
- [ ] Like a comment (heart fills, count increments)
- [ ] Unlike a comment (heart empties, count decrements)
- [ ] Try to like twice (should toggle)
- [ ] Real-time updates (2 tabs)

### Share Features
- [ ] Share on Twitter
- [ ] Share on Facebook
- [ ] Share on LinkedIn
- [ ] Share on WhatsApp
- [ ] Copy link to clipboard

## Performance Optimizations

1. **Database Indexes**
   - `idx_comment_likes_comment_id` - fast comment like lookups
   - `idx_comment_likes_user_id` - fast user like lookups
   - `idx_comments_blog_id` - fast comment queries by blog

2. **Batch Queries**
   - Load all comments in one query
   - Check all liked comments in one query
   - Build hierarchy on client-side

3. **Optimistic Updates**
   - Instant UI feedback
   - Reduced perceived latency
   - Better user experience

4. **Real-time Subscriptions**
   - Efficient Postgres change tracking
   - Only updates when data changes
   - Automatic cleanup on unmount

## Future Enhancements

- [ ] Comment reactions (👍 😄 🎉 ❤️)
- [ ] Comment threading with "show more replies"
- [ ] Comment sorting (newest, oldest, most liked)
- [ ] Comment search
- [ ] Mention users (@username)
- [ ] Rich text comments (markdown)
- [ ] Comment notifications
- [ ] Report inappropriate comments
- [ ] Pin important comments (admin)
- [ ] Bookmarking blogs
- [ ] Email digest of new comments

## Troubleshooting

### Comments not appearing
- Check if user is authenticated
- Check browser console for errors
- Verify RLS policies in Supabase dashboard
- Check if blog status is "published"

### Likes not working
- Verify user is logged in
- Check if duplicate like constraint is causing issues
- Check browser console for API errors
- Verify helper functions exist in database

### Real-time not updating
- Check Supabase Realtime is enabled
- Verify channel subscriptions are not blocked
- Check browser console for connection errors
- Ensure cleanup functions are working (useEffect return)

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify database schema matches migration
4. Check RLS policies are correctly applied
