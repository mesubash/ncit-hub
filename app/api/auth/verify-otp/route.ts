import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyOTP } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, purpose } = await request.json();

    // Validate inputs
    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { success: false, message: "Email, OTP, and purpose are required" },
        { status: 400 }
      );
    }

    if (!["email_verification", "password_reset", "account_recovery"].includes(purpose)) {
      return NextResponse.json(
        { success: false, message: "Invalid purpose" },
        { status: 400 }
      );
    }

    // Verify OTP using the otp service
    const result = await verifyOTP(email, otp, purpose);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // For email verification, the profile is already updated in the RPC function
    // For password reset and account recovery, we just confirm the OTP is valid

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        userId: result.user_id,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
