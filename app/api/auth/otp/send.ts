import { NextRequest, NextResponse } from "next/server";
import { createOTPToken } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

const isDev = process.env.NODE_ENV !== "production";
const devLog = (...args: any[]) => { if (isDev) console.log(...args); };
const devError = (...args: any[]) => { if (isDev) console.error(...args); };

/**
 * POST /api/auth/otp/send
 * Send OTP to user email for verification
 *
 * Body:
 * - email: string (required)
 * - purpose: 'email_verification' | 'password_reset' | 'account_recovery' (required)
 * - userName: string (optional) - User's name for personalized email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, purpose, userName } = body;

    // Validate required fields
    if (!email || !purpose) {
      return NextResponse.json(
        { error: "Email and purpose are required" },
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

    // Validate purpose
    const validPurposes = ["email_verification", "password_reset", "account_recovery"];
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: "Invalid purpose" },
        { status: 400 }
      );
    }

    // Create OTP token
    const otpToken = await createOTPToken(email, purpose);

    if (!otpToken) {
      return NextResponse.json(
        { error: "Failed to create OTP token" },
        { status: 500 }
      );
    }

    // Send OTP email
    const emailSubjects = {
      email_verification: "Your Email Verification Code",
      password_reset: "Reset Your Password",
      account_recovery: "Account Recovery Code",
    };

    const emailSent = await sendOTPEmail({
      to: email,
      subject: emailSubjects[purpose as keyof typeof emailSubjects],
      otp: otpToken.otp_code,
      userName: userName || undefined,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    // Log for debugging (dev only)
    devLog(`OTP sent to ${email} for ${purpose}: ${otpToken.otp_code}`);

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully to your email",
        // In development, you might want to return the OTP for testing. Remove in production!
        ...(process.env.NODE_ENV === "development" && {
          debug: { otp: otpToken.otp_code, expiresAt: otpToken.expires_at },
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    devError("Error sending OTP:", error);
    return NextResponse.json(
      { error: "An error occurred while sending OTP" },
      { status: 500 }
    );
  }
}
