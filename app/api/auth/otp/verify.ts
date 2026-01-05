import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { createClient } from "@/lib/supabase/server";

const isDev = process.env.NODE_ENV !== "production";
const devError = (...args: any[]) => { if (isDev) console.error(...args); };

/**
 * POST /api/auth/otp/verify
 * Verify OTP code and mark email as verified if email_verification
 *
 * Body:
 * - email: string (required)
 * - otp: string (required)
 * - purpose: 'email_verification' | 'password_reset' | 'account_recovery' (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, purpose } = body;

    // Validate required fields
    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { success: false, message: "Email, OTP, and purpose are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Verify OTP
    const verificationResult = await verifyOTP(email, otp, purpose);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, message: verificationResult.message },
        { status: 400 }
      );
    }

    // If email verification, mark email as verified in profiles table
    if (purpose === "email_verification" && verificationResult.user_id) {
      const supabase = await createClient();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          email_verified: true,
          email_verified_at: new Date().toISOString(),
        })
        .eq("id", verificationResult.user_id);

      if (updateError) {
        devError("Error updating email verification status:", updateError);
        // Don't fail the request, OTP was still verified correctly
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: verificationResult.message,
        userId: verificationResult.user_id,
      },
      { status: 200 }
    );
  } catch (error) {
    devError("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while verifying OTP" },
      { status: 500 }
    );
  }
}
