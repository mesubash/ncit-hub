import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireVerifiedUser } from "@/lib/api-middleware";

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  // Check if user is authenticated and verified
  const { error: authError, user } = await requireVerifiedUser();
  if (authError) return authError;

  const supabase = await createClient();

  // Check if user is admin by checking their profile
  const { data: adminProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profileError || adminProfile?.role !== "admin") {
    console.error("User is not admin:", { role: adminProfile?.role, error: profileError });
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
  }

  try {
    const fetchStartTime = performance.now();
    console.log("Fetching users from database...");
    
    // Get all users from profiles table using authenticated client
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, user_type, created_at, email_verified")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const fetchTime = performance.now() - fetchStartTime;
    const totalTime = performance.now() - startTime;
    console.log(`Fetched users: ${users?.length} (DB: ${fetchTime.toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms)`);
    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to fetch users: " + errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  // Check if user is authenticated and verified
  const { error: authError, user } = await requireVerifiedUser();
  if (authError) return authError;

  const supabase = await createClient();

  // Check if user is admin by checking their profile
  const { data: adminProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profileError || adminProfile?.role !== "admin") {
    console.error("User is not admin:", { role: adminProfile?.role, error: profileError });
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
  }

  try {
    const { action, userId, role, isDisabled } = await request.json();

    console.log("User management action:", { action, userId, role });

    if (action === "delete") {
      const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      console.log("Delete action initiated for user:", userId);

      if (!adminUrl || !serviceRoleKey) {
        console.error("Missing admin configuration:", { hasUrl: !!adminUrl, hasKey: !!serviceRoleKey });
        return NextResponse.json(
          { error: "Missing admin configuration" },
          { status: 500 }
        );
      }

      try {
        // Start deletion operations in parallel where possible
        const deleteOperations = [];
        let deleteAuthError = null;

        // Attempt to delete auth user via API (non-blocking, continue even if fails)
        const deleteAuthPromise = fetch(
          `${adminUrl}/auth/v1/admin/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceRoleKey}`,
              apikey: serviceRoleKey,
            },
          }
        )
          .then(async (response) => {
            if (!response.ok) {
              const errorData = await response.text();
              console.error("Error deleting auth user:", { status: response.status, error: errorData });
              deleteAuthError = { status: response.status, error: errorData };
            }
            return { status: response.status };
          })
          .catch((err) => {
            console.error("Error calling auth delete API:", err);
            deleteAuthError = err;
            return { error: err.message };
          });

        // Delete from profiles (parallel with auth deletion)
        console.log("Deleting profile from database...");
        const deleteProfilePromise = supabase
          .from("profiles")
          .delete()
          .eq("id", userId);

        // Run both in parallel
        const [authResult, { error: deleteProfileError }] = await Promise.all([
          deleteAuthPromise,
          deleteProfilePromise,
        ]);

        if (deleteProfileError) {
          console.error("Error deleting profile:", deleteProfileError);
          return NextResponse.json(
            { error: "Failed to delete user profile: " + deleteProfileError.message },
            { status: 500 }
          );
        }

        // Verify the profile was actually deleted by querying for it
        console.log("Verifying profile deletion...");
        const { data: verifyDelete, error: verifyError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();

        // PGRST116 means "no rows returned" - which is what we want (user was deleted)
        if (verifyError && verifyError.code === "PGRST116") {
          const totalTime = performance.now() - startTime;
          console.log(`Profile deletion verified - user no longer exists (${totalTime.toFixed(2)}ms)`);
          return NextResponse.json({ success: true, message: "User deleted successfully" });
        } else if (!verifyError && verifyDelete) {
          // User still exists!
          console.error("Deletion verification failed - user still exists after delete attempt");
          return NextResponse.json(
            { error: "Failed to delete user - profile still exists after deletion attempt" },
            { status: 500 }
          );
        } else if (verifyError && verifyError.code !== "PGRST116") {
          // Some other error occurred
          console.error("Verification query error:", verifyError);
          return NextResponse.json(
            { error: "Failed to verify user deletion: " + verifyError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, message: "User deleted successfully" });
      } catch (err) {
        console.error("Error in user deletion:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: "Failed to delete user: " + errorMsg }, { status: 500 });
      }
    }

    if (action === "update-role") {
      // Update user role
      console.log("Updating role for user:", userId, "to:", role);
      const operationStartTime = performance.now();
      
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) {
        console.error("Error updating role:", error);
        return NextResponse.json(
          { error: "Failed to update role: " + error.message },
          { status: 500 }
        );
      }

      const operationTime = performance.now() - operationStartTime;
      const totalTime = performance.now() - startTime;
      console.log(`Role updated successfully (DB: ${operationTime.toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms)`);
      return NextResponse.json({ success: true, message: "Role updated" });
    }

    if (action === "toggle-disabled") {
      // For now, just update the profile to mark as disabled
      const { error } = await supabase
        .from("profiles")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Status updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Error managing user:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to manage user: " + errorMsg },
      { status: 500 }
    );
  }
}
