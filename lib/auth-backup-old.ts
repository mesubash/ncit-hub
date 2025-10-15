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
  console.log("signOut: Starting...");
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("signOut error:", error);
  } else {
    console.log("signOut success");
  }
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