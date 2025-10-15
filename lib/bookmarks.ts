/**
 * Bookmarks Library
 * Handles all bookmark operations
 */

import { createClient } from "@/lib/supabase/client";
import type { Blog } from "@/lib/blog";

export interface Bookmark {
  id: string;
  user_id: string;
  blog_id: string;
  created_at: string;
}

// ============================================
// BOOKMARKS
// ============================================

/**
 * Check if user has bookmarked a blog
 */
export async function hasUserBookmarkedBlog(blogId: string, userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("blog_id", blogId)
    .eq("user_id", userId)
    .single();

  return { isBookmarked: !!data, error };
}

/**
 * Bookmark a blog
 */
export async function bookmarkBlog(blogId: string, userId: string) {
  const supabase = createClient();

  try {
    const { data: bookmark, error } = await supabase
      .from("bookmarks")
      .insert({ blog_id: blogId, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    return { bookmark, error: null };
  } catch (error: any) {
    console.error("Error bookmarking blog:", error);
    return { bookmark: null, error: error.message };
  }
}

/**
 * Unbookmark a blog
 */
export async function unbookmarkBlog(blogId: string, userId: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("blog_id", blogId)
      .eq("user_id", userId);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error("Error unbookmarking blog:", error);
    return { error: error.message };
  }
}

/**
 * Toggle bookmark (bookmark if not bookmarked, unbookmark if bookmarked)
 */
export async function toggleBookmark(blogId: string, userId: string) {
  const { isBookmarked } = await hasUserBookmarkedBlog(blogId, userId);

  if (isBookmarked) {
    return await unbookmarkBlog(blogId, userId);
  } else {
    return await bookmarkBlog(blogId, userId);
  }
}

/**
 * Get all user's bookmarked blog IDs
 */
export async function getUserBookmarkedBlogIds(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("blog_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { blogIds: data?.map((b) => b.blog_id) || [], error };
}

/**
 * Get all user's bookmarked blogs with full blog details
 */
export async function getUserBookmarkedBlogs(
  userId: string
): Promise<{ blogs: Blog[]; error: any }> {
  const supabase = createClient();

  // First, get all bookmarked blog IDs
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("blog_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (bookmarksError || !bookmarks || bookmarks.length === 0) {
    return { blogs: [], error: bookmarksError };
  }

  // Then, fetch the full blog details
  const blogIds = bookmarks.map((b) => b.blog_id);

  const { data: blogs, error } = await supabase
    .from("blogs")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      images,
      tags,
      status,
      views,
      likes,
      created_at,
      published_at,
      author:profiles!blogs_author_id_fkey (
        id,
        full_name,
        email,
        avatar_url,
        role
      ),
      category:categories (
        id,
        name,
        slug,
        color
      )
    `
    )
    .in("id", blogIds)
    .eq("status", "published");

  return { blogs: (blogs as unknown as Blog[]) || [], error };
}

/**
 * Get bookmark count for a blog
 */
export async function getBookmarkCount(blogId: string) {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("blog_id", blogId);

  return { count: count || 0, error };
}

/**
 * Delete all bookmarks for a blog (when blog is deleted)
 */
export async function deleteAllBookmarksForBlog(blogId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("blog_id", blogId);

  return { error };
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to bookmark changes for a specific blog
 */
export function subscribeToBookmarks(
  blogId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`bookmarks-${blogId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookmarks",
        filter: `blog_id=eq.${blogId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to user's bookmark changes
 */
export function subscribeToUserBookmarks(
  userId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`user-bookmarks-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookmarks",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}
