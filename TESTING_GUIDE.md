# NCIT Hub - Testing Guide

## 🧪 Complete Testing Checklist

This guide helps you test all the newly implemented features systematically.

---

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Ensure database is running** (Supabase)

3. **Have test accounts ready:**
   - Student account
   - Faculty account
   - Admin account
   - Guest (not logged in)

---

## 1. Likes & Comments System

### Blog Likes Testing
- [ ] Navigate to any blog detail page
- [ ] Click the heart icon to like the blog
- [ ] Verify the like count increases
- [ ] Click again to unlike
- [ ] Verify the like count decreases
- [ ] Check that the heart icon fills/unfills appropriately
- [ ] Try liking without logging in (should prompt to log in)

### Comments Testing
- [ ] Navigate to a blog detail page
- [ ] Scroll to the comments section
- [ ] Add a new comment
- [ ] Verify the comment appears instantly
- [ ] Click "Reply" on your comment
- [ ] Add a reply (nested comment)
- [ ] Verify the reply is indented properly
- [ ] Add a reply to the reply (3rd level)
- [ ] Verify 3-level nesting works
- [ ] Click "Edit" on your comment
- [ ] Modify the comment text
- [ ] Save and verify changes appear
- [ ] Click "Delete" on a comment
- [ ] Confirm deletion
- [ ] Verify comment is removed

### Comment Likes Testing
- [ ] Like a comment (click heart icon)
- [ ] Verify the like count increases
- [ ] Unlike the comment
- [ ] Verify the like count decreases
- [ ] Try on nested comments (replies)
- [ ] Verify all comment likes work independently

### Real-time Updates
- [ ] Open the same blog in two browser windows
- [ ] Add a comment in one window
- [ ] Verify it appears in the other window (may take a few seconds)
- [ ] Like a comment in one window
- [ ] Verify the like count updates in the other window

---

## 2. Bookmarks Feature

### Bookmark from Blog Listing
- [ ] Navigate to `/blogs`
- [ ] Click the bookmark icon on any blog card
- [ ] Verify the icon fills (becomes solid)
- [ ] Click again to unbookmark
- [ ] Verify the icon unfills (becomes outline)
- [ ] Try bookmarking without logging in (should prompt)

### Bookmark Filter
- [ ] Bookmark 2-3 blogs
- [ ] Click "Bookmarked (X)" button at the top
- [ ] Verify only bookmarked blogs are shown
- [ ] Click "All Blogs" to see all blogs again
- [ ] Verify the filter count matches your bookmarks

### Bookmarks Page
- [ ] Navigate to `/bookmarks` (or click "Bookmarks" in nav)
- [ ] Verify all your bookmarked blogs are displayed
- [ ] Click the bookmark icon to remove a bookmark
- [ ] Verify the blog is removed from the list
- [ ] Unbookmark all blogs
- [ ] Verify the empty state message appears

### Bookmark from Blog Detail
- [ ] Navigate to any blog detail page
- [ ] Click the bookmark icon in the interactions section
- [ ] Verify it bookmarks/unbookmarks
- [ ] Navigate to `/bookmarks` to confirm it's saved

---

## 3. Change Password

### Access Dialog
- [ ] Navigate to `/profile`
- [ ] Click "Change Password" button
- [ ] Verify dialog opens

### Password Strength Indicator
- [ ] Type a short password (e.g., "abc")
- [ ] Verify strength shows as "Weak" (red)
- [ ] Type a medium password (e.g., "Abcd1234")
- [ ] Verify strength shows as "Medium" (yellow)
- [ ] Type a strong password (e.g., "Abcd1234!@#$")
- [ ] Verify strength shows as "Strong" (green)

### Validation Testing
- [ ] Try a password with less than 8 characters
- [ ] Verify error message appears
- [ ] Try a password without uppercase letters
- [ ] Verify error message appears
- [ ] Try a password without lowercase letters
- [ ] Verify error message appears
- [ ] Try a password without numbers
- [ ] Verify error message appears
- [ ] Enter different passwords in "New" and "Confirm" fields
- [ ] Verify error message appears

### Show/Hide Password
- [ ] Click the eye icon on each password field
- [ ] Verify password becomes visible
- [ ] Click again to hide

### Successful Change
- [ ] Enter a valid current password
- [ ] Enter a valid new password (meets all requirements)
- [ ] Enter the same password in confirm field
- [ ] Click "Change Password"
- [ ] Verify success message appears
- [ ] Note: You should be logged out and redirected to login

---

## 4. Email Validation (Registration)

### Access Registration
- [ ] Navigate to `/register`
- [ ] Click on the email input field

### Invalid Email Testing
- [ ] Enter "a@example.com" (only 1 char before @)
- [ ] Verify red border appears
- [ ] Verify error message shows below input
- [ ] Enter "ab@example.com" (only 2 chars before @)
- [ ] Verify error persists

### Valid Email Testing
- [ ] Enter "abc@example.com" (3 chars before @)
- [ ] Verify red border disappears
- [ ] Verify error message is cleared
- [ ] Enter "john.doe@ncit.edu.np" (longer valid email)
- [ ] Verify no errors

### Form Submission
- [ ] Try to submit with invalid email (less than 3 chars)
- [ ] Verify form doesn't submit
- [ ] Verify error message appears
- [ ] Fix the email to be valid
- [ ] Verify form can now be submitted

---

## 5. Profile Page Pagination

### Access Profile
- [ ] Navigate to `/profile`
- [ ] Ensure you have at least 6 blogs published

### Initial Load
- [ ] Verify only 5 blogs are shown initially
- [ ] Verify "Showing X of Y blogs" indicator appears
- [ ] Verify it shows "5 of Y" (where Y is your total)

### Load More
- [ ] Click "Load More Blogs" button
- [ ] Verify 5 more blogs appear (now showing 10 total)
- [ ] Verify the indicator updates to "Showing 10 of Y"
- [ ] Verify the remaining count decreases
- [ ] Keep clicking until all blogs are shown

### Button Disappears
- [ ] Once all blogs are shown
- [ ] Verify "Load More" button disappears
- [ ] Verify "Showing Y of Y blogs" is displayed

### Edge Cases
- [ ] Test with exactly 5 blogs (should show no button)
- [ ] Test with 0 blogs (should show empty state)
- [ ] Test with 1 blog (should show 1 blog, no button)

---

## 6. Blogs Page Pagination

### Access Blogs Page
- [ ] Navigate to `/blogs`
- [ ] Ensure there are at least 11 published blogs

### Initial Load
- [ ] Verify only 10 blogs are shown initially
- [ ] Verify "Showing 10 of X blog posts" indicator
- [ ] Verify "Load More Blogs" button appears

### Load More
- [ ] Click "Load More Blogs" button
- [ ] Verify 10 more blogs appear (now showing 20 total)
- [ ] Verify the indicator updates to "Showing 20 of X"
- [ ] Verify the remaining count is accurate
- [ ] Keep loading until all blogs are shown

### Filter + Pagination
- [ ] Apply a category filter
- [ ] Verify pagination resets to 10 blogs
- [ ] Verify results count updates correctly
- [ ] Load more blogs
- [ ] Change category again
- [ ] Verify pagination resets back to 10

### Search + Pagination
- [ ] Enter a search term
- [ ] Verify pagination resets to 10
- [ ] Verify results show "matching [term]"
- [ ] Load more if available
- [ ] Clear search
- [ ] Verify pagination resets

### Bookmark Filter + Pagination
- [ ] Click "Bookmarked" filter
- [ ] Verify pagination resets to 10
- [ ] Verify only bookmarked blogs shown
- [ ] Verify results show "(bookmarked)"
- [ ] Load more if you have more than 10 bookmarks

### Combined Filters
- [ ] Apply category filter + search + bookmark filter
- [ ] Verify pagination works with all filters
- [ ] Verify results count is accurate
- [ ] Change any filter
- [ ] Verify pagination resets to 10

---

## Cross-Feature Testing

### Authentication Flow
- [ ] Test all features as a guest (should see prompts to log in)
- [ ] Test all features as a student
- [ ] Test all features as faculty
- [ ] Test all features as admin

### Responsive Design
- [ ] Test on desktop (wide screen)
- [ ] Test on tablet (medium screen)
- [ ] Test on mobile (small screen)
- [ ] Verify all buttons and interactions work on touch screens

### Performance
- [ ] Open browser dev tools (Network tab)
- [ ] Navigate to blogs page
- [ ] Verify initial load is fast
- [ ] Load more blogs
- [ ] Verify incremental loading is smooth
- [ ] Check that images load progressively
- [ ] Verify no console errors

### Error Handling
- [ ] Disconnect from internet
- [ ] Try to like a blog
- [ ] Verify error message appears
- [ ] Reconnect to internet
- [ ] Verify operation works again

---

## Database Verification

### Check Data Persistence
- [ ] Like a blog
- [ ] Close browser completely
- [ ] Open browser again and navigate to the blog
- [ ] Verify your like is still there

- [ ] Add a comment
- [ ] Refresh the page
- [ ] Verify the comment persists

- [ ] Bookmark a blog
- [ ] Log out and log back in
- [ ] Verify the bookmark is still there

- [ ] Change your password
- [ ] Log in with new password
- [ ] Verify you can log in successfully

---

## Known Issues to Check

- [ ] Verify nested comments don't break layout on mobile
- [ ] Verify long blog titles wrap properly in cards
- [ ] Verify password strength indicator works on all browsers
- [ ] Verify real-time updates don't cause memory leaks (check after 5+ minutes)
- [ ] Verify bookmark filter shows correct count
- [ ] Verify pagination resets correctly on all filter changes

---

## Success Criteria

All features are considered working correctly if:

1. ✅ All likes, comments, and bookmarks persist in the database
2. ✅ Real-time updates work within 3-5 seconds
3. ✅ Pagination loads smoothly without lag
4. ✅ No console errors during normal operation
5. ✅ All authentication checks work properly
6. ✅ Email validation prevents invalid submissions
7. ✅ Password change logs user out and requires new password
8. ✅ UI is responsive on all screen sizes
9. ✅ Error messages are clear and helpful
10. ✅ Loading states appear when appropriate

---

## Reporting Issues

If you find any bugs:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check network tab for failed requests
4. Note your browser and OS version
5. Take screenshots if applicable

---

## Final Verification Commands

```bash
# Check for TypeScript errors
npm run type-check
# or
pnpm type-check

# Check for lint errors
npm run lint
# or
pnpm lint

# Build the project (should complete without errors)
npm run build
# or
pnpm build
```

---

## 🎉 Testing Complete!

If all tests pass, congratulations! All 6 features are fully functional:

1. ✅ Likes & Comments System
2. ✅ Bookmarks Feature
3. ✅ Change Password
4. ✅ Email Validation
5. ✅ Profile Page Pagination
6. ✅ Blogs Page Pagination

Happy testing! 🚀
