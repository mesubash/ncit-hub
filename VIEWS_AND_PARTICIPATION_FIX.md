# Blog Views & Event Participation Issues - Analysis & Fix

## Problems Identified

### 1. Blog Views Not Working Properly

**Issue**: View count doesn't increment or show correctly

**Root Causes**:
1. Session-based tracking prevents views from incrementing on refresh (by design)
2. View count on page doesn't update dynamically after tracking
3. Need to verify database function is properly deployed

**How It Currently Works**:
```
User visits blog page
  ↓
BlogViewTracker component mounts
  ↓
Check sessionStorage for "viewed_blogs"
  ↓
If blog ID not in array:
  - Call incrementBlogView(blogId)
  - Uses RPC: increment_blog_views (atomic increment)
  - Fallback: Manual UPDATE if RPC fails
  - Add blog ID to sessionStorage
  ↓
View tracked (won't increment again in same session)
```

**Session Storage Behavior**:
- Key: `"viewed_blogs"`
- Value: `["blog-uuid-1", "blog-uuid-2", ...]`
- Lifetime: Until browser tab/window closes
- Purpose: Prevent multiple views from same user in one session

### 2. Event Participation Count Not Updating

**Issue**: Clicking "I Will Participate" doesn't update participant count properly

**Root Causes**:
1. Local state update works but doesn't persist on page navigation
2. Event data needs to be reloaded from database after registration
3. Race condition between registration and UI update

**How It Currently Works**:
```
User clicks "I Will Participate"
  ↓
Call registerForEvent(eventId, userId)
  ↓
Insert into event_registrations table
  ↓
Call RPC: increment_event_participants(event_id)
  ↓
Update local state: current_participants + 1
  ↓
UI updates immediately (optimistic update)
```

**Problem**: If you navigate away and come back, the count might not reflect the actual database value.

---

## Solutions

### Solution 1: Blog Views - Add Dynamic Refresh

**Option A: Reload blog data after tracking (Recommended)**
- After successful view tracking, reload the blog data
- Show updated view count immediately

**Option B: Optimistic UI update**
- Increment displayed view count immediately
- Don't wait for database confirmation

**Option C: Real-time subscription**
- Subscribe to blog changes
- Update view count when database changes

### Solution 2: Event Participation - Reload Event Data

**Fix: Reload events after registration**
- After successful registration/cancellation
- Fetch latest event data from database
- Update entire events list with fresh data

---

## Implementation

### Fix 1: Blog Views - Reload After Tracking

Update `BlogViewTracker` to notify parent component and reload blog data.

### Fix 2: Event Participation - Reload Events

Update events page to reload data after each registration.

---

## Testing Checklist

### Blog Views
- [ ] Open blog in normal browser
- [ ] Check console for "View tracked" message
- [ ] Verify view count incremented by 1
- [ ] Refresh page - count should NOT increase
- [ ] Open in incognito - count should increase by 1
- [ ] Close tab and reopen - count should increase by 1

### Event Participation
- [ ] Click "I Will Participate"
- [ ] Verify count increases immediately
- [ ] Refresh page - count should still show increased value
- [ ] Navigate to another page and back - count persists
- [ ] Check database: event_registrations table has entry
- [ ] Check events table: current_participants updated

---

## Database Functions to Verify

Run these in Supabase SQL Editor to ensure functions exist:

```sql
-- Check if blog views function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'increment_blog_views';

-- Check if event participants functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('increment_event_participants', 'decrement_event_participants');

-- Test blog views function
SELECT increment_blog_views('your-blog-uuid-here');

-- Test event participants function
SELECT increment_event_participants('your-event-uuid-here');

-- Check current counts
SELECT id, title, views FROM blogs WHERE views > 0;
SELECT id, title, current_participants FROM events WHERE current_participants > 0;
```

---

## Quick Fixes to Apply

### 1. Make Blog Views More Visible

Add console logging to track what's happening:

```typescript
// In BlogViewTracker component
console.log("Tracking view for blog:", blogId);
console.log("Session storage:", sessionStorage.getItem("viewed_blogs"));
```

### 2. Force Event Data Reload

After registration, reload all events from database instead of just updating local state.

### 3. Show Real-time Feedback

Add toast notifications when:
- Blog view is tracked
- Event registration succeeds
- Event registration fails

---

## Why Views Seem "Not Working"

**By Design**:
- Views only increment once per session
- This is intentional to prevent spam
- If you keep refreshing, you won't see views increase

**To Test Properly**:
1. Open blog in incognito window → View +1
2. Close incognito window
3. Open again in new incognito → View +1
4. OR clear sessionStorage: `sessionStorage.clear()`

**Alternative**: Check database directly:
```sql
SELECT title, views FROM blogs ORDER BY views DESC;
```

---

## Migration Check

Ensure these migrations are applied:

1. `20231019_increment_blog_views.sql` - Blog views RPC function
2. Check `final_schema.sql` has:
   - `increment_event_participants` function
   - `decrement_event_participants` function

If functions don't exist, views/participants won't update!
