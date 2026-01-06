"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"
import { signIn, formatCollegeEmail } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Enable logs only on localhost or when explicitly toggled
const isDev =
  process.env.NEXT_PUBLIC_ENABLE_LOGS === "true" ||
  (typeof window !== "undefined" && window.location.hostname === "localhost")
const devLog = (...args: any[]) => { if (isDev) console.log(...args) }
const devError = (...args: any[]) => { if (isDev) console.error(...args) }

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Get success message from URL
  const successMessage = searchParams.get('message')
  const errorMessage = searchParams.get('error')

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
    
    // Check for error message in URL
    if (errorMessage) {
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [errorMessage, toast])

  // Auto-redirect if already authenticated (but not during login process)
  useEffect(() => {
    if (isAuthenticated && user && !isLoading && !isSigningIn) {
      devLog("Already authenticated, redirecting to appropriate page");
      const redirectPath = user.role === "admin" ? "/admin" : "/profile";
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, isLoading, isSigningIn, router]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (signInError) {
        setError(signInError.message)
        toast({
          title: "Error",
          description: signInError.message,
          variant: "destructive",
        })
        setIsGoogleLoading(false)
      }
      // If successful, the browser will redirect to Google
    } catch (err) {
      devError("Google sign-in error:", err)
      setError("Failed to initiate Google sign-in")
      toast({
        title: "Error",
        description: "Failed to initiate Google sign-in",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    devLog("Login attempt started for email:", email)
    setError("")
    setIsLoading(true)
    setIsSigningIn(true)

    try {
      // Remember email if checkbox is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      // Sign in with email and password
      devLog("Calling signIn function...")
      const { user: signInUser, error: signInError } = await signIn(email, password)

      devLog("Sign in result:", {
        success: !!signInUser,
        error: signInError,
        userEmail: signInUser?.email,
        userRole: signInUser?.role
      });

      if (signInError) {
        devLog("Sign in error:", signInError)
        
        // Handle unverified email specifically
        if (signInError === "EMAIL_NOT_VERIFIED") {
          setIsLoading(false)
          setIsSigningIn(false)
          
          // Redirect to verification page with email
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          
          toast({
            title: "Email Not Verified",
            description: "Please verify your email to continue. Check your inbox for the verification code.",
            variant: "destructive",
          })
          return
        }
        
        setError(signInError)
        setIsLoading(false)
        setIsSigningIn(false)
        toast({
          title: "Login Failed",
          description: signInError,
          variant: "destructive",
        })
        return
      }

      if (!signInUser) {
        devLog("No user returned from signIn")
        const errorMsg = "Authentication failed. Please try again."
        setError(errorMsg)
        setIsLoading(false)
        setIsSigningIn(false)
        toast({
          title: "Login Failed",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // Check if email is verified
      if (!signInUser.email_verified) {
        devLog("Email not verified, redirecting to verification page")
        toast({
          title: "Email Verification Required",
          description: "Please verify your email before continuing.",
          variant: "default",
        })
        router.push(`/verify-email?email=${encodeURIComponent(signInUser.email)}`)
        setIsLoading(false)
        setIsSigningIn(false)
        return
      }

      devLog("Login successful! Redirecting immediately...")
      
      // Determine redirect path
      const redirectPath = signInUser.role === "admin" ? "/admin" : "/profile"
      devLog("Navigating to:", redirectPath)
      
      // Show success toast
      toast({
        title: "Welcome back!",
        description: `Logged in as ${signInUser.full_name || signInUser.email}`,
      })
      
      // Use window.location for instant redirect (no async routing delays)
      window.location.href = redirectPath

    } catch (err) {
      devError("Login error:", err)
      const errorMsg = "An unexpected error occurred. Please try again."
      setError(errorMsg)
      setIsLoading(false)
      setIsSigningIn(false)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-md mx-auto px-4 py-16">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Sign in to your NCIT account to create and manage blogs</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <div className="flex">
                  <Input
                    id="email"
                    type="text"
                    placeholder="username"
                    value={email.split("@")[0] || ""}
                    onChange={(e) => setEmail(formatCollegeEmail(e.target.value))}
                    required
                  />
                  <div className="flex items-center bg-muted px-3 text-muted-foreground">
                    @ncit.edu.np
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Enter your NCIT username</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Remember my email
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <div className="relative my-4">
                <Separator />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                  OR
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
