/**
 * Comments and Likes Library
 * Handles all comment and like operations with real-time updates
 */

import { createClient } from "@/lib/supabase/client";

// Types
export interface Comment {
  id: string;
  content: string;
  author_id: string;
  blog_id: string;
  parent_id: string | null;
  is_edited: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    role: string;
  };
  replies?: Comment[];
  is_liked?: boolean;
}

export interface BlogLike {
  id: string;
  user_id: string;
  blog_id: string;
  created_at: string;
}

export interface CommentLike {
  id: string;
  user_id: string;
  comment_id: string;
  created_at: string;
}

// ============================================
// BLOG LIKES
// ============================================

/**
 * Check if user has liked a blog
 */
export async function hasUserLikedBlog(blogId: string, userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("blog_id", blogId)
    .eq("user_id", userId)
    .single();

  return { isLiked: !!data, error };
}

/**
 * Like a blog
 */
export async function likeBlog(blogId: string, userId: string) {
  const supabase = createClient();

  try {
    // Insert like
    const { data: like, error: likeError } = await supabase
      .from("likes")
      .insert({ blog_id: blogId, user_id: userId })
      .select()
      .single();

    if (likeError) throw likeError;

    // Increment blog likes count
    const { error: incrementError } = await supabase.rpc(
      "increment_blog_likes",
      {
        blog_id: blogId,
      }
    );

    if (incrementError) throw incrementError;

    return { like, error: null };
  } catch (error: any) {
    console.error("Error liking blog:", error);
    return { like: null, error: error.message };
  }
}

/**
 * Unlike a blog
 */
export async function unlikeBlog(blogId: string, userId: string) {
  const supabase = createClient();

  try {
    // Delete like
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("blog_id", blogId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Decrement blog likes count
    const { error: decrementError } = await supabase.rpc(
      "decrement_blog_likes",
      {
        blog_id: blogId,
      }
    );

    if (decrementError) throw decrementError;

    return { error: null };
  } catch (error: any) {
    console.error("Error unliking blog:", error);
    return { error: error.message };
  }
}

/**
 * Get blog likes count
 */
export async function getBlogLikesCount(blogId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select("likes")
    .eq("id", blogId)
    .single();

  return { count: data?.likes || 0, error };
}

// ============================================
// COMMENTS
// ============================================

/**
 * Get comments for a blog with nested replies
 */
export async function getComments(blogId: string, userId?: string) {
  const supabase = createClient();

  try {
    // Get all comments for the blog
    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:profiles(id, full_name, email, avatar_url, role)
      `
      )
      .eq("blog_id", blogId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!comments) return { comments: [], error: null };

    // If user is authenticated, check which comments they've liked
    let likedCommentIds: string[] = [];
    if (userId) {
      const { data: likes } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", userId)
        .in(
          "comment_id",
          comments.map((c) => c.id)
        );

      likedCommentIds = likes?.map((l) => l.comment_id) || [];
    }

    // Build nested structure
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create comment objects
    comments.forEach((comment) => {
      const commentWithLike: Comment = {
        ...comment,
        replies: [],
        is_liked: likedCommentIds.includes(comment.id),
      };
      commentMap.set(comment.id, commentWithLike);
    });

    // Second pass: build hierarchy
    comments.forEach((comment) => {
      const commentObj = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });

    return { comments: rootComments, error: null };
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return { comments: [], error: error.message };
  }
}

/**
 * Get comment count for a blog
 */
export async function getCommentCount(blogId: string) {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("blog_id", blogId);

  return { count: count || 0, error };
}

/**
 * Create a new comment
 */
export async function createComment(
  blogId: string,
  content: string,
  authorId: string,
  parentId?: string | null
) {
  const supabase = createClient();

  try {
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        blog_id: blogId,
        content: content.trim(),
        author_id: authorId,
        parent_id: parentId || null,
      })
      .select(
        `
        *,
        author:profiles(id, full_name, email, avatar_url, role)
      `
      )
      .single();

    if (error) throw error;

    return { comment, error: null };
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return { comment: null, error: error.message };
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  content: string,
  userId: string
) {
  const supabase = createClient();

  try {
    const { data: comment, error } = await supabase
      .from("comments")
      .update({
        content: content.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .eq("author_id", userId) // Ensure user owns the comment
      .select(
        `
        *,
        author:profiles(id, full_name, email, avatar_url, role)
      `
      )
      .single();

    if (error) throw error;

    return { comment, error: null };
  } catch (error: any) {
    console.error("Error updating comment:", error);
    return { comment: null, error: error.message };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string, userId: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("author_id", userId); // Ensure user owns the comment

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return { error: error.message };
  }
}

// ============================================
// COMMENT LIKES
// ============================================

/**
 * Check if user has liked a comment
 */
export async function hasUserLikedComment(commentId: string, userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .single();

  return { isLiked: !!data, error };
}

/**
 * Like a comment
 */
export async function likeComment(commentId: string, userId: string) {
  const supabase = createClient();

  try {
    // Insert like
    const { data: like, error: likeError } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_id: userId })
      .select()
      .single();

    if (likeError) throw likeError;

    // Increment comment likes count
    const { error: incrementError } = await supabase.rpc(
      "increment_comment_likes",
      {
        comment_id: commentId,
      }
    );

    if (incrementError) throw incrementError;

    return { like, error: null };
  } catch (error: any) {
    console.error("Error liking comment:", error);
    return { like: null, error: error.message };
  }
}

/**
 * Unlike a comment
 */
export async function unlikeComment(commentId: string, userId: string) {
  const supabase = createClient();

  try {
    // Delete like
    const { error: deleteError } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Decrement comment likes count
    const { error: decrementError } = await supabase.rpc(
      "decrement_comment_likes",
      {
        comment_id: commentId,
      }
    );

    if (decrementError) throw decrementError;

    return { error: null };
  } catch (error: any) {
    console.error("Error unliking comment:", error);
    return { error: error.message };
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to blog likes updates
 */
export function subscribeToBlogLikes(
  blogId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`blog-likes-${blogId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "likes",
        filter: `blog_id=eq.${blogId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to comments updates
 */
export function subscribeToComments(
  blogId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`comments-${blogId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
        filter: `blog_id=eq.${blogId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to comment likes updates
 */
export function subscribeToCommentLikes(callback: (payload: any) => void) {
  const supabase = createClient();

  const channel = supabase
    .channel("comment-likes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comment_likes",
      },
      callback
    )
    .subscribe();

  return channel;
}
