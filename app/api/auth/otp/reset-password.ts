import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { createClient } from "@/lib/supabase/server";

const isDev = process.env.NODE_ENV !== "production";
const devError = (...args: any[]) => { if (isDev) console.error(...args); };

/**
 * POST /api/auth/otp/reset-password
 * Reset password after OTP verification
 *
 * Body:
 * - email: string (required)
 * - otp: string (required)
 * - newPassword: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    // Validate required fields
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Verify OTP
    const verificationResult = await verifyOTP(email, otp, "password_reset");

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      );
    }

    // Get user ID from the OTP verification result
    if (!verificationResult.user_id) {
      return NextResponse.json(
        { error: "Could not identify user for password reset" },
        { status: 400 }
      );
    }

    // Update user password using Supabase admin API
    const supabase = await createClient();

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      verificationResult.user_id,
      { password: newPassword }
    );

    if (updateError) {
      devError("Error resetting password:", updateError);
      return NextResponse.json(
        { error: "Failed to reset password. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully. You can now login with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    devError("Error resetting password:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting password" },
      { status: 500 }
    );
  }
}
