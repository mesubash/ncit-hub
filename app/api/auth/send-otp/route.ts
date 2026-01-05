import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOTPToken } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";
import { isValidCollegeEmail } from "@/lib/auth";

const isDev = process.env.NODE_ENV !== "production";
const devError = (...args: any[]) => { if (isDev) console.error(...args); };

export async function POST(request: NextRequest) {
  try {
    const { email, purpose, userName } = await request.json();

    // Validate inputs
    if (!email || !purpose) {
      return NextResponse.json(
        { success: false, message: "Email and purpose are required" },
        { status: 400 }
      );
    }

    if (!["email_verification", "password_reset", "account_recovery"].includes(purpose)) {
      return NextResponse.json(
        { success: false, message: "Invalid purpose" },
        { status: 400 }
      );
    }

    if (purpose !== "password_reset" && !isValidCollegeEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please use your college email (@ncit.edu.np)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user exists (except for password reset which should not reveal if email exists)
    let userId = null;
    if (purpose !== "password_reset") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (purpose === "account_recovery" && !profile) {
        return NextResponse.json(
          { success: false, message: "No account found with this email" },
          { status: 404 }
        );
      }

      userId = profile?.id;
    } else {
      // For password reset, still check but don't reveal
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      userId = profile?.id;
    }

    // Create OTP token using the RPC function
    const { data, error } = await supabase.rpc("create_otp_token", {
      p_email: email,
      p_purpose: purpose,
      p_user_id: userId,
    });

    if (error) {
      devError("Error creating OTP token:", error);
      return NextResponse.json(
        { success: false, message: "Failed to generate OTP code" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to generate OTP code" },
        { status: 500 }
      );
    }

    const otpToken = data[0];

    // Send OTP email
    const emailSent = await sendOTPEmail({
      to: email,
      subject: `${purpose === "email_verification" ? "Email Verification" : purpose === "password_reset" ? "Password Reset" : "Account Recovery"} Code - NCIT Hub`,
      otp: otpToken.otp_code,
      userName,
    });

    if (!emailSent) {
      devError("Failed to send OTP email");
      return NextResponse.json(
        { success: false, message: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP code sent to your email",
      data: {
        expiresAt: otpToken.expires_at,
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    devError("Error in send-otp:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
