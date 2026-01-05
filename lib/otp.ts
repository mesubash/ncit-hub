import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export interface OTPToken {
  id: string;
  user_id: string | null;
  email: string;
  otp_code: string;
  purpose: "email_verification" | "password_reset" | "account_recovery";
  attempts: number;
  max_attempts: number;
  is_used: boolean;
  verified_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface OTPVerificationResult {
  success: boolean;
  message: string;
  user_id?: string;
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a new OTP token in the database
 */
export async function createOTPToken(
  email: string,
  purpose: "email_verification" | "password_reset" | "account_recovery",
  userId?: string
): Promise<OTPToken | null> {
  try {
    const supabase = createClient();
    const otpCode = generateOTPCode();

    const { data, error } = await supabase
      .from("otp_tokens")
      .insert({
        user_id: userId || null,
        email: email.toLowerCase(),
        otp_code: otpCode,
        purpose,
        attempts: 0,
        max_attempts: 3,
        is_used: false,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating OTP token:", error);
      return null;
    }

    return data as OTPToken;
  } catch (error) {
    console.error("Error creating OTP token:", error);
    return null;
  }
}

/**
 * Verify OTP code using Supabase RPC function
 */
export async function verifyOTP(
  email: string,
  otpCode: string,
  purpose: "email_verification" | "password_reset" | "account_recovery"
): Promise<OTPVerificationResult> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.rpc("verify_otp", {
      p_email: email.toLowerCase(),
      p_otp_code: otpCode,
      p_purpose: purpose,
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        message: error.message || "Failed to verify OTP",
      };
    }

    if (!data || !data[0]) {
      return {
        success: false,
        message: "Invalid OTP response",
      };
    }

    return {
      success: data[0].success,
      message: data[0].message,
      user_id: data[0].user_id,
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "An error occurred while verifying OTP",
    };
  }
}

/**
 * Get OTP token by email and purpose
 */
export async function getOTPToken(
  email: string,
  purpose: "email_verification" | "password_reset" | "account_recovery"
): Promise<OTPToken | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("otp_tokens")
      .select()
      .eq("email", email.toLowerCase())
      .eq("purpose", purpose)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error getting OTP token:", error);
      return null;
    }

    return (data as OTPToken) || null;
  } catch (error) {
    console.error("Error getting OTP token:", error);
    return null;
  }
}

/**
 * Check if OTP still valid (not expired)
 */
export function isOTPValid(otp: OTPToken): boolean {
  const expiresAt = new Date(otp.expires_at);
  return expiresAt > new Date() && !otp.is_used && otp.attempts < otp.max_attempts;
}

/**
 * Resend OTP to email (creates new OTP token)
 */
export async function resendOTP(
  email: string,
  purpose: "email_verification" | "password_reset" | "account_recovery",
  userId?: string
): Promise<OTPToken | null> {
  try {
    const supabase = createClient();

    // Mark previous OTPs as used if they exist
    await supabase
      .from("otp_tokens")
      .update({ is_used: true })
      .eq("email", email.toLowerCase())
      .eq("purpose", purpose)
      .eq("is_used", false);

    // Create new OTP
    return await createOTPToken(email, purpose, userId);
  } catch (error) {
    console.error("Error resending OTP:", error);
    return null;
  }
}

/**
 * Clean up expired OTP tokens (should be called periodically)
 */
export async function cleanupExpiredOTPs(): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase.rpc("cleanup_expired_otps");

    if (error) {
      console.error("Error cleaning up expired OTPs:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error cleaning up expired OTPs:", error);
    return false;
  }
}

/**
 * Mark OTP as used
 */
export async function markOTPAsUsed(otpId: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("otp_tokens")
      .update({
        is_used: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", otpId);

    if (error) {
      console.error("Error marking OTP as used:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking OTP as used:", error);
    return false;
  }
}
