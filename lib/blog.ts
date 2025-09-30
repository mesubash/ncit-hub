import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export type BlogRow = Database["public"]["Tables"]["blogs"]["Row"]
export type BlogInsert = Database["public"]["Tables"]["blogs"]["Insert"]
export type BlogUpdate = Database["public"]["Tables"]["blogs"]["Update"]
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]

// Enhanced Blog interface with author details
export interface Blog {
  id: string
  title: string
  content: string
  excerpt: string | null
  author_id: string
  author?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
  category_id: string | null
  category?: {
    id: string
    name: string
    color: string
  }
  tags: string[]
  images: string[]
  featured_image: string | null
  status: "draft" | "published" | "archived" | "pending"
  views: number
  likes: number
  created_at: string
  updated_at: string
}

export const blogCategories = ["Academic", "Sports", "Cultural", "Technical", "General"]

// Create a new blog
export async function createBlog(blogData: {
  title: string
  content: string
  excerpt?: string
  author_id: string
  category_id?: string
  tags?: string[]
  images?: string[]
  featured_image?: string
  status?: "draft" | "published" | "archived" | "pending"
}): Promise<{ blog: Blog | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .insert({
      title: blogData.title,
      content: blogData.content,
      excerpt: blogData.excerpt || generateExcerpt(blogData.content),
      author_id: blogData.author_id,
      category_id: blogData.category_id,
      tags: blogData.tags || [],
      images: blogData.images || [],
      featured_image: blogData.featured_image,
      status: blogData.status || "draft",
    })
    .select(`
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
    `)
    .single()

  if (error) {
    return { blog: null, error: error.message }
  }

  return { blog: transformBlogData(data), error: null }
}

// Update a blog
export async function updateBlog(
  id: string,
  updates: Partial<BlogUpdate>,
): Promise<{ blog: Blog | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
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
    `)
    .single()

  if (error) {
    return { blog: null, error: error.message }
  }

  return { blog: transformBlogData(data), error: null }
}

// Get blog by ID
export async function getBlogById(id: string): Promise<{ blog: Blog | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select(`
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
    `)
    .eq("id", id)
    .single()

  if (error) {
    return { blog: null, error: error.message }
  }

  return { blog: transformBlogData(data), error: null }
}

// Get blogs by author
export async function getBlogsByAuthor(authorId: string): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select(`
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
    `)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })

  if (error) {
    return { blogs: [], error: error.message }
  }

  return { blogs: data.map(transformBlogData), error: null }
}

// Get all published blogs
export async function getAllBlogs(): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select(`
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
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    return { blogs: [], error: error.message }
  }

  return { blogs: data.map(transformBlogData), error: null }
}

// Get blogs by category
export async function getBlogsByCategory(categoryId: string): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select(`
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
    `)
    .eq("category_id", categoryId)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    return { blogs: [], error: error.message }
  }

  return { blogs: data.map(transformBlogData), error: null }
}

// Search blogs
export async function searchBlogs(query: string): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select(`
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
    `)
    .eq("status", "published")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    return { blogs: [], error: error.message }
  }

  return { blogs: data.map(transformBlogData), error: null }
}

// Increment blog views
export async function incrementBlogViews(id: string): Promise<{ error: string | null }> {
  const supabase = createClient()

  const { error } = await supabase.rpc("increment_blog_views", { blog_id: id })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Like/unlike blog
export async function toggleBlogLike(
  blogId: string,
  userId: string,
): Promise<{ liked: boolean; error: string | null }> {
  const supabase = createClient()

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("blog_id", blogId)
    .eq("user_id", userId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase.from("likes").delete().eq("blog_id", blogId).eq("user_id", userId)

    if (error) {
      return { liked: false, error: error.message }
    }

    // Decrement likes count
    await supabase.rpc("decrement_blog_likes", { blog_id: blogId })

    return { liked: false, error: null }
  } else {
    // Like
    const { error } = await supabase.from("likes").insert({ blog_id: blogId, user_id: userId })

    if (error) {
      return { liked: false, error: error.message }
    }

    // Increment likes count
    await supabase.rpc("increment_blog_likes", { blog_id: blogId })

    return { liked: true, error: null }
  }
}

// Get user's liked blogs
export async function getUserLikedBlogs(userId: string): Promise<{ blogIds: string[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase.from("likes").select("blog_id").eq("user_id", userId)

  if (error) {
    return { blogIds: [], error: error.message }
  }

  return { blogIds: data.map((like) => like.blog_id), error: null }
}

// Get all categories
export async function getCategories(): Promise<{ categories: CategoryRow[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    return { categories: [], error: error.message }
  }

  return { categories: data, error: null }
}

// Delete blog
export async function deleteBlog(id: string): Promise<{ error: string | null }> {
  const supabase = createClient()

  const { error } = await supabase.from("blogs").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Get all pending blogs for admin review
export async function getPendingBlogs(): Promise<{ blogs: Blog[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select(`
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
    `)
    .in("status", ["draft", "pending"])
    .order("created_at", { ascending: false })

  if (error) {
    return { blogs: [], error: error.message }
  }

  return { blogs: data.map(transformBlogData), error: null }
}

// Helper function to transform database data to Blog interface
function transformBlogData(data: any): Blog {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
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
  }
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength = 150): string {
  const plainText = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength).trim() + "..."
}
