import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Check if the current user is authenticated and has verified email
 * Returns error response if not verified, or user data if verified
 */
export async function requireVerifiedUser() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      ),
      user: null,
    }
  }

  // Check if email is verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_verified, full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return {
      error: NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      ),
      user: null,
    }
  }

  if (!profile.email_verified) {
    return {
      error: NextResponse.json(
        { error: "Email not verified. Please verify your email before performing this action." },
        { status: 403 }
      ),
      user: null,
    }
  }

  return {
    error: null,
    user: {
      id: user.id,
      email: user.email!,
      profile,
    },
  }
}
