import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/profile"

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Exchange error:", error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      if (!data.user) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      const user = data.user
      const email = user.email
      const provider = user.app_metadata?.provider

      // Handle OAuth provider (Google, GitHub, etc.)
      if (provider === "google") {
        const googleId = user.id
        const googleMetadata = user.user_metadata
        const googleName = googleMetadata?.full_name || googleMetadata?.name || ""

        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("email", email)
          .single()

        if (existingProfile) {
          // Update profile with Google info and mark email as verified
          await supabase
            .from("profiles")
            .update({
              google_id: googleId,
              google_account_verified: true,
              email_verified: true,
              email_verified_at: new Date().toISOString(),
              // Update name from Google only if profile doesn't have a name
              full_name: existingProfile.full_name || googleName,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProfile.id)

          // Redirect based on role
          const redirectUrl = existingProfile.role === "admin" ? "/admin" : "/profile"
          return NextResponse.redirect(`${origin}${redirectUrl}`)
        } else {
          // No account exists - delete the auth user and redirect to login with error
          // User must register manually first
          const userId = user.id
          
          console.log(`Attempting to delete unauthorized Google user: ${userId} (${email})`)
          
          // Delete the auth user that was just created using admin client
          const adminClient = createAdminClient()
          const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
          
          if (deleteError) {
            console.error("Failed to delete unauthorized user:", deleteError)
            // Still continue to sign out and redirect
          } else {
            console.log(`Successfully deleted unauthorized user: ${userId}`)
          }
          
          // Sign out the current session
          await supabase.auth.signOut()
          
          return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent("No account found. Please register first using the registration form.")}`
          )
        }
      }

      // For regular email/password authentication
      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"
        
        // Determine redirect URL
        let redirectUrl = next
        
        // Check if user email is verified
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_verified, role")
          .eq("email", email)
          .single()

        if (profile && !profile.email_verified) {
          redirectUrl = `/verify-email?email=${encodeURIComponent(email)}`
        } else if (profile) {
          redirectUrl = profile.role === "admin" ? "/admin" : "/profile"
        }

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectUrl}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
        } else {
          return NextResponse.redirect(`${origin}${redirectUrl}`)
        }
      }
    } catch (err) {
      console.error("Callback error:", err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
