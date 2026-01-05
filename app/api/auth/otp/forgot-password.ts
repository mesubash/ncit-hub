import { NextRequest, NextResponse } from "next/server";
import { createOTPToken } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/otp/forgot-password
 * Initiate password reset by sending OTP to email
 *
 * Body:
 * - email: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Check if user exists with this email
    const supabase = await createClient();
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("email", email.toLowerCase())
      .single();

    if (profileError || !profile) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link",
        },
        { status: 200 }
      );
    }

    // Create OTP token for password reset
    const otpToken = await createOTPToken(email, "password_reset", profile.id);

    if (!otpToken) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link",
        },
        { status: 200 }
      );
    }

    // Build reset link with OTP
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otpToken.otp_code}`;

    // Send password reset email
    const emailSent = await sendPasswordResetEmail({
      to: email,
      subject: "Reset Your Password - NCIT Hub",
      resetLink: resetLink,
      userName: profile.full_name || undefined,
    });

    if (!emailSent) {
      // Still return success to not reveal if email sending failed
      console.error(`Failed to send password reset email to ${email}`);
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link",
        },
        { status: 200 }
      );
    }

    console.log(`Password reset OTP sent to ${email}: ${otpToken.otp_code}`);

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link",
        // In development, return the reset link for testing. Remove in production!
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            resetLink,
            otp: otpToken.otp_code,
            expiresAt: otpToken.expires_at,
          },
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link",
      },
      { status: 200 }
    );
  }
}
