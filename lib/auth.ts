import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

const isDev = process.env.NODE_ENV !== "production";
const devLog = (...args: any[]) => { if (isDev) console.log(...args); };
const devWarn = (...args: any[]) => { if (isDev) console.warn(...args); };
const devError = (...args: any[]) => { if (isDev) console.error(...args); };

// Extend the database Profile type with OAuth and verification fields
export type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  email_verified?: boolean;
  email_verified_at?: string | null;
  google_id?: string | null;
  google_account_verified?: boolean;
};

export type UserType = "bachelor_student" | "master_student" | "faculty";
export type ProgramType = "bachelor" | "master";
export type UserRole = "student" | "faculty" | "admin";
export type OTPPurpose = "email_verification" | "password_reset" | "account_recovery";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  user_type: UserType | null;
  department: string | null;
  program_type: ProgramType | null;
  semester: number | null; // For bachelor students (1-8)
  year: number | null; // For master students (1-2)
  specialization: string | null; // For master students or faculty
  bio: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  google_id: string | null;
  google_account_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface OTPRequest {
  email: string;
  purpose: OTPPurpose;
  userName?: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
  purpose: OTPPurpose;
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
    full_name: profile.full_name,
    role: profile.role as UserRole,
    user_type: profile.user_type as UserType | null,
    department: profile.department,
    program_type: profile.program_type as ProgramType | null,
    semester: profile.semester,
    year: profile.year,
    specialization: profile.specialization,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    email_verified: profile.email_verified ?? false,
    email_verified_at: profile.email_verified_at ?? null,
    google_id: profile.google_id ?? null,
    google_account_verified: profile.google_account_verified ?? false,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

// Clean auth system - check current session
export async function getCurrentUser(): Promise<User | null> {
  devLog("getCurrentUser: Starting session check...");

  try {
    const supabase = createClient();
    devLog("getCurrentUser: Created Supabase client");

    // Check if we're on the client side
    if (typeof window === "undefined") {
      devLog("getCurrentUser: Running on server side, skipping");
      return null;
    }

    devLog("getCurrentUser: About to call getUser()...");

    // Use getUser() instead of getSession() - it validates the JWT and refreshes if needed
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    devLog("getCurrentUser: getUser() returned!", {
      hasUser: !!authUser,
      userId: authUser?.id,
      userEmail: authUser?.email,
      error: userError?.message,
    });

    if (userError) {
      devError("getCurrentUser: User error:", userError);
      return null;
    }

    if (!authUser) {
      devLog("getCurrentUser: No authenticated user");
      return null;
    }

    devLog("getCurrentUser: Valid user found, fetching profile...");

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    devLog("getCurrentUser: Profile fetch result:", {
      hasProfile: !!profile,
      profileId: profile?.id,
      profileEmail: profile?.email,
      profileRole: profile?.role,
      error: profileError?.message,
      errorCode: profileError?.code,
    });

    if (profileError) {
      devError("getCurrentUser: Profile error:", profileError);
      return null;
    }

    if (!profile) {
      devLog("getCurrentUser: No profile found for user");
      return null;
    }

    const user = profileToUser(profile);
    devLog("getCurrentUser: Success! Returning user:", {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });
    return user;
  } catch (error) {
    devError("getCurrentUser error:", error);
    return null;
  }
}

// Sign in function
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  devLog("signIn: Starting for", email);

  if (!isValidCollegeEmail(email)) {
    return {
      user: null,
      error: "Please use your college email (@ncit.edu.np)",
    };
  }

  try {
    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      devError("Auth error:", authError);
      return { user: null, error: authError.message };
    }

    if (!authData.user || !authData.session) {
      return { user: null, error: "Authentication failed" };
    }

    devLog("Auth successful, fetching profile...");

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      devError("Profile error:", profileError);
      return { user: null, error: "Failed to load user profile" };
    }

    if (!profile) {
      // Create profile if it doesn't exist - use metadata from auth.users
      devLog("Creating new profile from auth metadata...");

      const metadata = authData.user.user_metadata || {};
      const userType = metadata.user_type as UserType;
      const role: UserRole = userType === "faculty" ? "faculty" : "student";

      devLog("Creating profile with metadata:", {
        full_name: metadata.full_name,
        role,
        user_type: userType,
        department: metadata.department,
        program_type: metadata.program_type,
        semester: metadata.semester,
        year: metadata.year,
        specialization: metadata.specialization,
      });

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email!,
            full_name: metadata.full_name || null,
            role: metadata.role || role, // Use metadata role or calculate from user_type
            user_type: userType || null,
            department: metadata.department || null,
            program_type: metadata.program_type || null,
            semester: metadata.semester || null,
            year: metadata.year || null,
            specialization: metadata.specialization || null,
          },
        ])
        .select()
        .single();

      if (createError) {
        devError("Profile creation error:", createError);
        return { user: null, error: "Failed to create user profile" };
      }

      const user = profileToUser(newProfile);
      devLog("signIn success with new profile:", user.email);
      return { user, error: null };
    }

    // Check if email is verified
    if (!profile.email_verified) {
      devLog("signIn: Email not verified for user:", profile.email);
      
      // Sign out the user immediately since email is not verified
      await supabase.auth.signOut();
      
      return { user: null, error: "EMAIL_NOT_VERIFIED" };
    }

    const user = profileToUser(profile);
    devLog("signIn success:", user.email);
    return { user, error: null };
  } catch (err) {
    devError("signIn error:", err);
    return { user: null, error: "An unexpected error occurred" };
  }
}

// Sign up function
export async function signUp(
  email: string,
  password: string,
  name: string,
  userType: UserType,
  department: string,
  programType?: ProgramType,
  semester?: number,
  year?: number,
  specialization?: string
): Promise<{ user: User | null; error: string | null }> {
  if (!isValidCollegeEmail(email)) {
    return {
      user: null,
      error: "Please use your college email (@ncit.edu.np)",
    };
  }

  const supabase = createClient();

  // Determine role based on user_type BEFORE signup
  const role: UserRole = userType === "faculty" ? "faculty" : "student";

  devLog("signUp: Starting registration with:", {
    email,
    name,
    userType,
    calculatedRole: role,
    department,
    programType,
    semester,
    year,
    specialization,
  });

  // Set flag to prevent auto sign-in during registration
  if (typeof window !== "undefined") {
    sessionStorage.setItem("isRegistering", "true");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role, // Add role to metadata
        user_type: userType,
        department,
        program_type: programType,
        semester,
        year,
        specialization,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (authError) {
    return { user: null, error: authError.message };
  }

  if (!authData.user) {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("isRegistering");
    }
    return { user: null, error: "Registration failed" };
  }

  // IMMEDIATELY sign out to prevent auto-login - do this BEFORE any other operations
  devLog("signUp: Immediately signing out to prevent auto-login...");
  await supabase.auth.signOut();

  // Check if email confirmation is required
  if (!authData.session) {
    // Email confirmation is enabled - profile will be created via trigger or callback
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("isRegistering");
    }
    return {
      user: null,
      error: "VERIFICATION_REQUIRED",
    };
  }

  // Email confirmation is disabled - user was logged in but we signed them out
  // Try to get existing profile first
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (existingProfile) {
    // Profile already exists (maybe from trigger)
    devLog("Profile already exists");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("isRegistering");
    }
    return {
      user: null,
      error: "REGISTRATION_SUCCESS",
    };
  }

  // Create user profile
  devLog("Creating new profile for user:", authData.user.id);

  // Log what we're about to insert
  devLog("Creating profile with data:", {
    id: authData.user.id,
    email,
    full_name: name,
    role, // Already declared at the top of the function
    user_type: userType,
    department,
    program_type: programType,
    semester,
    year,
    specialization,
  });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      email,
      full_name: name,
      role,
      user_type: userType,
      department,
      program_type: programType,
      semester,
      year,
      specialization,
    })
    .select()
    .single();

  if (profileError) {
    devError("Profile creation error:", profileError);

    // Wait a moment and try multiple times (database might need time to commit)
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
      retryCount++;

      devLog(`Retry ${retryCount}/${maxRetries}: Checking for profile...`);

      const { data: retryProfile, error: retryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (retryProfile) {
        devLog("Profile found on retry", retryCount);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("isRegistering");
        }
        // Profile created but user already signed out
        return {
          user: null,
          error: "REGISTRATION_SUCCESS",
        };
      }

      if (retryError) {
        devError(`Retry ${retryCount} error:`, retryError);
      }
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("isRegistering");
    }
    return {
      user: null,
      error: "PROFILE_CREATION_FAILED",
    };
  }

  // Success - user profile created
  devLog("Profile created successfully", {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    user_type: profile.user_type,
  });

  // Clear the registration flag
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("isRegistering");
  }

  // Return success without user - forces them to login
  // (User was already signed out immediately after signUp)
  return {
    user: null,
    error: "REGISTRATION_SUCCESS",
  };
}

// Sign out function
export async function signOut(): Promise<void> {
  devLog("signOut: Starting...");
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    devError("signOut error:", error);
  } else {
    devLog("signOut success");
  }
}

// Update user profile
export async function updateProfile(
  updates: Partial<Profile>
): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
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

// Change password function
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  // Validate inputs
  if (!currentPassword || !newPassword) {
    return {
      success: false,
      error: "Both current and new passwords are required",
    };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters long",
    };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      error: "New password must be different from current password",
    };
  }

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    devError("Change password error:", error);
    return {
      success: false,
      error: error.message || "Failed to change password",
    };
  }
}

// Sign in with Google OAuth
export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient();
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    devError("Google sign-in error:", error);
    throw error;
  }

  if (data?.url) {
    window.location.href = data.url;
  }
}

// Handle Google OAuth merge - update existing profile with Google info
export async function updateProfileWithGoogleInfo(
  googleId: string,
  googleName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const updates: any = {
      google_id: googleId,
      google_account_verified: true,
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Only update name if current profile doesn't have one
    if (googleName) {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!currentProfile?.full_name) {
        updates.full_name = googleName;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile with Google info:", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
    };
  }
}
