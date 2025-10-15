import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "student" | "admin";
  department: string | null;
  semester: number | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Format and validate NCIT email
export function formatCollegeEmail(username: string): string {
  return `${username.toLowerCase()}@ncit.edu.np`;
}

// Validate NCIT email format
export function isValidCollegeEmail(email: string): boolean {
  return email.endsWith("@ncit.edu.np") && email.length > "@ncit.edu.np".length;
}

// Convert Supabase profile to User format
export function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name,
    role: profile.role as "student" | "admin",
    department: profile.department,
    semester: profile.semester,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

// Simple sign in function
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  console.log("Starting signIn process for email:", email);

  if (!isValidCollegeEmail(email)) {
    return {
      user: null,
      error: "Please use your college email (@ncit.edu.np)",
    };
  }

  const supabase = createClient();

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Auth response:", { hasUser: !!authData?.user, error: authError?.message });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: "Authentication failed" };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    console.log("Profile fetch:", { hasProfile: !!profile, error: profileError?.message });

    if (profileError && profileError.code !== "PGRST116") {
      return { user: null, error: "Failed to load user profile" };
    }

    if (!profile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email!,
            full_name: authData.user.user_metadata?.full_name || null,
            department: authData.user.user_metadata?.department || null,
            semester: authData.user.user_metadata?.semester || null,
            role: "student",
          },
        ])
        .select()
        .single();

      if (createError) {
        return { user: null, error: "Failed to create user profile" };
      }

      return { user: profileToUser(newProfile), error: null };
    }

    return { user: profileToUser(profile), error: null };
  } catch (err) {
    console.error("SignIn error:", err);
    return { user: null, error: "An unexpected error occurred" };
  }
}

// Simple getCurrentUser function using session
export async function getCurrentUser(): Promise<User | null> {
  console.log("getCurrentUser: Starting...");
  const supabase = createClient();

  try {
    // Use getSession instead of getUser
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log("Session check:", { hasSession: !!session, hasUser: !!session?.user });

    if (!session?.user) {
      console.log("No session or user");
      return null;
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    console.log("Profile result:", { hasProfile: !!profile });

    if (!profile) {
      console.log("No profile found");
      return null;
    }

    const user = profileToUser(profile);
    console.log("Returning user:", user.email);
    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// Sign up function
export async function signUp(
  email: string,
  password: string,
  name: string,
  department?: string,
  semester?: number
): Promise<{ user: User | null; error: string | null }> {
  if (!isValidCollegeEmail(email)) {
    return {
      user: null,
      error: "Please use your college email (@ncit.edu.np)",
    };
  }

  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        department,
        semester,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (authError) {
    return { user: null, error: authError.message };
  }

  if (!authData.user) {
    return { user: null, error: "Registration failed" };
  }

  // Check if email confirmation is required
  if (!authData.session) {
    return {
      user: null,
      error: "Registration successful! Please check your email to verify your account before signing in.",
    };
  }

  // Create user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      email,
      full_name: name,
      department,
      semester,
      role: "student",
    })
    .select()
    .single();

  if (profileError) {
    return { user: null, error: "Failed to create user profile" };
  }

  return {
    user: profileToUser(profile),
    error: "Registration successful! Please check your email to verify your account before signing in.",
  };
}

// Sign out function
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// Update user profile
export async function updateProfile(
  updates: Partial<Profile>
): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { user: null, error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", session.user.id)
    .select()
    .single();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: profileToUser(profile), error: null };
}
