import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyOTP } from "@/lib/otp";
import { isValidCollegeEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword, confirmPassword } = await request.json();

    // Validate inputs
    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!isValidCollegeEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please use your college email (@ncit.edu.np)" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpResult = await verifyOTP(email, otp, "password_reset");

    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, message: otpResult.message },
        { status: 400 }
      );
    }

    // Get Supabase admin client to update password
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get the user by email to update their password
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update the password via Supabase Auth using admin client
    console.log("Service role key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log("Service role key length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
    
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      console.error("Service role key valid?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      return NextResponse.json(
        { success: false, message: "Failed to update password: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
