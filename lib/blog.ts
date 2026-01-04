import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type BlogRow = Database["public"]["Tables"]["blogs"]["Row"];
export type BlogInsert = Database["public"]["Tables"]["blogs"]["Insert"];
export type BlogUpdate = Database["public"]["Tables"]["blogs"]["Update"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

// Enhanced Blog interface with author details
export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  tags: string[];
  images: string[];
  featured_image: string | null;
  status: "draft" | "published" | "archived" | "pending";
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  rejection_reason: string | null;
}

export const blogCategories = [
  "Academic",
  "Sports",
  "Cultural",
  "Technical",
  "General",
];

// Utility function to strip markdown formatting from text
export function stripMarkdown(text: string): string {
  return text
    .replace(/#+\s/g, "") // Remove headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/_(.+?)_/g, "$1") // Remove italic (underscore)
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links but keep text
    .replace(/!\[.*?\]\(.+?\)/g, "") // Remove images
    .replace(/>\s/g, "") // Remove blockquotes
    .replace(/[-*+]\s/g, "") // Remove list markers
    .replace(/\d+\.\s/g, "") // Remove numbered list markers
    .replace(/~~(.+?)~~/g, "$1") // Remove strikethrough
    .replace(/\n{2,}/g, " ") // Replace multiple newlines with space
    .replace(/\n/g, " ") // Replace single newlines with space
    .trim();
}

// Create a new blog
export async function createBlog(blogData: {
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  category_id?: string;
  tags?: string[];
  images?: string[];
  featured_image?: string;
  status?: "draft" | "published" | "archived" | "pending";
}): Promise<{ blog: Blog | null; error: string | null }> {
  const supabase = createClient();

  // Generate slug from title
  const baseSlug = generateSlug(blogData.title);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists and make it unique
  while (true) {
    const { data: existing } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data, error } = await supabase
    .from("blogs")
    .insert({
      title: blogData.title,
      slug: slug, // Add generated slug
      content: blogData.content,
      excerpt: blogData.excerpt || generateExcerpt(blogData.content),
      author_id: blogData.author_id,
      category_id: blogData.category_id,
      tags: blogData.tags || [],
      images: blogData.images || [],
      featured_image: blogData.featured_image,
      status: blogData.status || "draft",
    })
    .select(
      `
      *,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .single();

  if (error) {
    console.error("Supabase blog creation error:", error);
    return { blog: null, error: error.message };
  }

  return { blog: transformBlogData(data), error: null };
}

// Update a blog
export async function updateBlog(
  id: string,
  updates: Partial<BlogUpdate>
): Promise<{ blog: Blog | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blogs")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      `
      *,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .single();

  if (error) {
    return { blog: null, error: error.message };
  }

  return { blog: transformBlogData(data), error: null };
}

// Get blog by ID
export async function getBlogById(
  id: string
): Promise<{ blog: Blog | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return { blog: null, error: error.message };
  }

  return { blog: transformBlogData(data), error: null };
}

// Get blogs by author
export async function getBlogsByAuthor(
  authorId: string
): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    return { blogs: [], error: error.message };
  }

  return { blogs: data.map(transformBlogData), error: null };
}

// Get blog metadata only (for generateStaticParams) - lightweight version
export async function getBlogsMetadata(
  status?: "published" | "draft" | "pending" | "archived"
): Promise<{
  blogs: Array<{ id: string }>;
  error: string | null;
}> {
  const supabase = createClient();

  let query = supabase
    .from("blogs")
    .select("id", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { blogs: [], error: error.message };
  }

  return { blogs: data || [], error: null };
}

// Get all blogs with optional status filter
export async function getAllBlogs(
  status?: "published" | "draft" | "pending" | "archived",
  limit?: number
): Promise<{
  blogs: Blog[];
  error: string | null;
}> {
  const supabase = createClient();

  let query = supabase
    .from("blogs")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      author_id,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      category_id,
      categories:category_id (
        id,
        name,
        color
      ),
      tags,
      featured_image,
      status,
      views,
      likes,
      created_at,
      updated_at,
      published_at
    `
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return { blogs: [], error: error.message };
  }

  // Transform to Blog objects, but without content
  const blogs = data?.map((blog: any) => ({
    ...transformBlogData({ ...blog, content: "", images: [] }),
    content: "", // Exclude content to reduce cache size
    images: [],  // Exclude images to reduce cache size
  })) || [];

  return { blogs, error: null };
}

// Get blogs by category
export async function getBlogsByCategory(
  categoryId: string
): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("category_id", categoryId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return { blogs: [], error: error.message };
  }

  return { blogs: data.map(transformBlogData), error: null };
}

// Search blogs
export async function searchBlogs(
  query: string
): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("status", "published")
    .or(
      `title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { blogs: [], error: error.message };
  }

  return { blogs: data.map(transformBlogData), error: null };
}

// Increment blog views
export async function incrementBlogViews(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.rpc("increment_blog_views", { blog_id: id });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Like/unlike blog
export async function toggleBlogLike(
  blogId: string,
  userId: string
): Promise<{ liked: boolean; error: string | null }> {
  const supabase = createClient();

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("blog_id", blogId)
    .eq("user_id", userId)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("blog_id", blogId)
      .eq("user_id", userId);

    if (error) {
      return { liked: false, error: error.message };
    }

    // Decrement likes count
    await supabase.rpc("decrement_blog_likes", { blog_id: blogId });

    return { liked: false, error: null };
  } else {
    // Like
    const { error } = await supabase
      .from("likes")
      .insert({ blog_id: blogId, user_id: userId });

    if (error) {
      return { liked: false, error: error.message };
    }

    // Increment likes count
    await supabase.rpc("increment_blog_likes", { blog_id: blogId });

    return { liked: true, error: null };
  }
}

// Get user's liked blogs
export async function getUserLikedBlogs(
  userId: string
): Promise<{ blogIds: string[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("likes")
    .select("blog_id")
    .eq("user_id", userId);

  if (error) {
    return { blogIds: [], error: error.message };
  }

  return {
    blogIds: data.map((like: { blog_id: any }) => like.blog_id),
    error: null,
  };
}

// Get all categories
export async function getCategories(): Promise<{
  categories: CategoryRow[];
  error: string | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    return { categories: [], error: error.message };
  }

  return { categories: data, error: null };
}

// Delete blog
export async function deleteBlog(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("blogs").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Get all pending blogs for admin review
export async function getPendingBlogs(): Promise<{
  blogs: Blog[];
  error: string | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      profiles:author_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("status", "pending") // Only fetch pending blogs for review
    .order("created_at", { ascending: false });

  if (error) {
    return { blogs: [], error: error.message };
  }

  return { blogs: data.map(transformBlogData), error: null };
}

// Get pending blogs (moved to getAllBlogs with status parameter)
async function getPendingBlogsLegacy(): Promise<Blog[]> {
  const { blogs } = await getAllBlogs("pending");
  return blogs;
}

// Helper function to transform database data to Blog interface
export function transformBlogData(data: any): Blog {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt ? stripMarkdown(data.excerpt) : null, // Strip markdown from excerpt
    author_id: data.author_id,
    author: data.profiles
      ? {
          id: data.profiles.id,
          full_name: data.profiles.full_name,
          email: data.profiles.email,
          avatar_url: data.profiles.avatar_url,
        }
      : undefined,
    category_id: data.category_id,
    category: data.categories
      ? {
          id: data.categories.id,
          name: data.categories.name,
          color: data.categories.color,
        }
      : undefined,
    tags: data.tags || [],
    images: data.images || [],
    featured_image: data.featured_image,
    status: data.status,
    views: data.views,
    likes: data.likes,
    created_at: data.created_at,
    updated_at: data.updated_at,
    published_at: data.published_at,
    rejection_reason: data.rejection_reason,
  };
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength = 150): string {
  // First strip all markdown formatting
  const plainText = stripMarkdown(content);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + "...";
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .substring(0, 100); // Limit length
}

// Increment blog view count
export async function incrementBlogView(
  blogId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  // Increment the view count atomically
  const { error } = await supabase.rpc("increment_blog_views", {
    blog_id: blogId,
  });

  if (error) {
    console.error("Error incrementing blog view:", error);
    // Fallback: try manual increment if RPC doesn't exist
    const { data: blog, error: fetchError } = await supabase
      .from("blogs")
      .select("views")
      .eq("id", blogId)
      .single();

    if (fetchError || !blog) {
      return { success: false, error: fetchError?.message || "Blog not found" };
    }

    const { error: updateError } = await supabase
      .from("blogs")
      .update({ views: (blog.views || 0) + 1 })
      .eq("id", blogId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  }

  return { success: true, error: null };
}
