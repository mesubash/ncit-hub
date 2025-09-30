import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  department: string | null;
  year: number | null;
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

// Validate NCIT email format
export function isValidCollegeEmail(email: string): boolean {
  return email.endsWith("@ncit.edu.np");
}

// Convert Supabase profile to User format
export function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name,
    role: profile.role,
    department: profile.department,
    year: profile.year,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

// Sign in with Supabase
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  if (!isValidCollegeEmail(email)) {
    return {
      user: null,
      error: "Please use your college email (@ncit.edu.np)",
    };
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

  if (profileError || !profile) {
    return { user: null, error: "Failed to load user profile" };
  }

  return { user: profileToUser(profile), error: null };
}

// Sign up with Supabase
export async function signUp(
  email: string,
  password: string,
  name: string,
  department?: string,
  year?: number
): Promise<{ user: User | null; error: string | null }> {
  if (!isValidCollegeEmail(email)) {
    return {
      user: null,
      error: "Please use your college email (@ncit.edu.np)",
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${window.location.origin}/auth/callback`,
    },
  });

  if (authError) {
    return { user: null, error: authError.message };
  }

  if (!authData.user) {
    return { user: null, error: "Registration failed" };
  }

  // Create user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      email,
      full_name: name,
      department,
      year,
      role: "user",
    })
    .select()
    .single();

  if (profileError) {
    return { user: null, error: "Failed to create user profile" };
  }

  return { user: profileToUser(profile), error: null };
}

// Sign out with Supabase
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Get current user from Supabase session
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) {
    return null;
  }

  return profileToUser(profile);
}

// Update user profile
export async function updateProfile(
  updates: Partial<Profile>
): Promise<{ user: User | null; error: string | null }> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { user: null, error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", authUser.id)
    .select()
    .single();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: profileToUser(profile), error: null };
}
