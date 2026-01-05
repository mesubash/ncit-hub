import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { isValidCollegeEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate inputs
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidCollegeEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please use your college email (@ncit.edu.np)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("email", email)
      .single();

    // For security, always return same message even if user doesn't exist
    if (!profile) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent",
      });
    }

    // Create OTP token for password reset
    const { data, error } = await supabase.rpc("create_otp_token", {
      p_email: email,
      p_purpose: "password_reset",
      p_user_id: profile.id,
    });

    if (error) {
      console.error("Error creating OTP token:", error);
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent",
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent",
      });
    }

    const otpToken = data[0];

    // Create reset link with token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?email=${encodeURIComponent(email)}&code=${otpToken.otp_code}`;

    // Send password reset email
    const emailSent = await sendPasswordResetEmail({
      to: email,
      subject: "Reset Your Password - NCIT Hub",
      resetLink,
      userName: profile.full_name || undefined,
    });

    if (!emailSent) {
      console.error("Failed to send password reset email");
      // Still return success for security
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent",
    });
  }
}
