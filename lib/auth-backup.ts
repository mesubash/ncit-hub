import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "student" | "admin";
  department: string | null;
  semester: number | null; // Changed from year to semester
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
    semester: profile.semester, // Changed from year to semester
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
  console.log("Starting signIn process for email:", email);

  try {
    if (!isValidCollegeEmail(email)) {
      console.log("Invalid college email format");
      return {
        user: null,
        error: "Please use your college email (@ncit.edu.np)",
      };
    }

    const supabase = createClient();
    console.log("Attempting Supabase authentication...");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log("Raw auth response:", {
        hasUser: !!authData?.user,
        error: authError?.message,
        userId: authData?.user?.id,
      });

      if (authError) {
        console.error("Authentication error:", authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.log("No user data returned from authentication");
        return { user: null, error: "Authentication failed" };
      }

      console.log(
        "Auth successful, fetching profile for user:",
        authData.user.id
      );

      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        console.log("Profile fetch result:", {
          hasProfile: !!profile,
          error: profileError?.message,
          profileId: profile?.id,
        });

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
          return { user: null, error: "Failed to load user profile" };
        }

        if (!profile) {
          console.log(
            "No profile found, creating one for user:",
            authData.user.id
          );
          // Create a profile for the user if it doesn't exist
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
            console.error("Profile creation error:", createError);
            return { user: null, error: "Failed to create user profile" };
          }

          console.log("Profile created successfully:", newProfile.id);
          const user = profileToUser(newProfile);
          console.log("Login successful with new profile, returning user:", {
            id: user.id,
            email: user.email,
            role: user.role,
          });
          return { user, error: null };
        }

        const user = profileToUser(profile);
        console.log("Login successful, returning user:", {
          id: user.id,
          email: user.email,
          role: user.role,
        });

        return { user, error: null };
      } catch (profileErr) {
        console.error("Profile operation error:", profileErr);
        return { user: null, error: "Failed to process user profile" };
      }
    } catch (authErr) {
      console.error("Supabase auth error:", authErr);
      return { user: null, error: "Authentication request failed" };
    }
  } catch (err) {
    console.error("Unexpected error in signIn:", err);
    return { user: null, error: "An unexpected error occurred" };
  }
}

// Sign up with Supabase
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
      error:
        "Registration successful! Please check your email to verify your account before signing in.",
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
    error:
      "Registration successful! Please check your email to verify your account before signing in.",
  };
}

// Sign out with Supabase
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// Get current user from Supabase session
export async function getCurrentUser(): Promise<User | null> {
  console.log("getCurrentUser: Fetching current user...");
  const supabase = createClient();

  try {
    // Add timeout to prevent hanging
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth getUser timeout")), 5000)
    );

    const {
      data: { user: authUser },
      error: authError,
    } = (await Promise.race([authPromise, timeoutPromise])) as any;

    console.log("getCurrentUser: Auth user check:", {
      hasUser: !!authUser,
      error: authError?.message,
      userId: authUser?.id,
    });

    if (authError) {
      console.error("getCurrentUser: Auth error:", authError);
      return null;
    }

    if (!authUser) {
      console.log("getCurrentUser: No authenticated user");
      return null;
    }

    console.log("getCurrentUser: Fetching profile for user:", authUser.id);

    // Add timeout to profile fetch as well
    const profilePromise = supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    const profileTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
    );

    const { data: profile, error: profileError } = (await Promise.race([
      profilePromise,
      profileTimeoutPromise,
    ])) as any;

    console.log("getCurrentUser: Profile fetch result:", {
      hasProfile: !!profile,
      error: profileError?.message,
    });

    if (profileError && profileError.code !== "PGRST116") {
      console.error("getCurrentUser: Profile error:", profileError);
      return null;
    }

    if (!profile) {
      console.log(
        "getCurrentUser: No profile found, creating one for user:",
        authUser.id
      );
      // Create a profile for the user if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || null,
            department: authUser.user_metadata?.department || null,
            semester: authUser.user_metadata?.semester || null,
            role: "student",
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("getCurrentUser: Profile creation error:", createError);
        return null;
      }

      console.log("getCurrentUser: Profile created successfully");
      return profileToUser(newProfile);
    }

    const user = profileToUser(profile);
    console.log("getCurrentUser: Returning user:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return user;
  } catch (error) {
    console.error("getCurrentUser: Unexpected error:", error);

    // If getCurrentUser fails, try a direct approach
    console.log("getCurrentUser: Trying direct session approach...");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        console.log(
          "getCurrentUser: Found session user, fetching profile directly..."
        );
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          console.log("getCurrentUser: Direct profile fetch successful");
          return profileToUser(profile);
        }
      }
    } catch (sessionError) {
      console.error(
        "getCurrentUser: Session fallback also failed:",
        sessionError
      );
    }

    return null;
  }
}

// Update user profile
export async function updateProfile(
  updates: Partial<Profile>
): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient();
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
