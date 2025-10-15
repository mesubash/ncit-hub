// Server-side blog operations for use in Server Components
import { createClient } from "@/lib/supabase/server";
import { Blog, transformBlogData } from "@/lib/blog";

// Get a single blog by ID (server-side)
export async function getBlogByIdServer(
  id: string
): Promise<{ blog: Blog | null; error: string | null }> {
  const supabase = await createClient();

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
    console.error("getBlogByIdServer error:", error);
    return { blog: null, error: error.message };
  }

  return { blog: transformBlogData(data), error: null };
}
