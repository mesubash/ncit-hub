import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/auth";

// Alternative getCurrentUser implementation
export async function getCurrentUserAlt(): Promise<User | null> {
  console.log("getCurrentUserAlt: Starting...");

  try {
    const supabase = createClient();

    // First, try to get the session directly from localStorage
    const authData = localStorage.getItem("ncithub-auth");
    console.log("Auth data in localStorage:", !!authData);

    if (!authData) {
      console.log("No auth data in localStorage");
      return null;
    }

    // Parse and check the session
    const parsedAuth = JSON.parse(authData);
    console.log("Parsed auth data:", {
      hasAccessToken: !!parsedAuth?.access_token,
      hasUser: !!parsedAuth?.user,
    });

    if (!parsedAuth?.access_token || !parsedAuth?.user) {
      console.log("Invalid auth data structure");
      return null;
    }

    const userId = parsedAuth.user.id;
    console.log("User ID from localStorage:", userId);

    // Directly fetch the profile using the user ID
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("Profile fetch result:", {
      hasProfile: !!profile,
      error: error?.message,
    });

    if (error || !profile) {
      console.log("Failed to fetch profile");
      return null;
    }

    // Convert profile to User format
    const user: User = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role as "student" | "admin" | "faculty",
      department: profile.department,
      semester: profile.semester,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      user_type: profile.user_type,
      program_type: profile.program_type,
      year: profile.year,
      specialization: profile.specialization,
    };

    console.log("getCurrentUserAlt: Success, returning user:", user.email);
    return user;
  } catch (error) {
    console.error("getCurrentUserAlt error:", error);
    return null;
  }
}
