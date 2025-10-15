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
import { Navigation } from "@/components/navigation"
import { signIn, formatCollegeEmail } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Get success message from URL
  const successMessage = searchParams.get('message')

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  // Auto-redirect if already authenticated (but not during login process)
  useEffect(() => {
    if (isAuthenticated && user && !isLoading && !isSigningIn) {
      console.log("Already authenticated, redirecting to appropriate page");
      const redirectPath = user.role === "admin" ? "/admin" : "/profile";
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, isLoading, isSigningIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt started for email:", email)
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
      console.log("Calling signIn function...")
      const { user: signInUser, error: signInError } = await signIn(email, password)

      console.log("Sign in result:", {
        success: !!signInUser,
        error: signInError,
        userEmail: signInUser?.email,
        userRole: signInUser?.role
      });

      if (signInError) {
        console.log("Sign in error:", signInError)
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
        console.log("No user returned from signIn")
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

      console.log("Login successful! Redirecting immediately...")
      
      // Determine redirect path
      const redirectPath = signInUser.role === "admin" ? "/admin" : "/profile"
      console.log("Navigating to:", redirectPath)
      
      // Show success toast
      toast({
        title: "Welcome back!",
        description: `Logged in as ${signInUser.full_name || signInUser.email}`,
      })
      
      // Use window.location for instant redirect (no async routing delays)
      window.location.href = redirectPath

    } catch (err) {
      console.error("Login error:", err)
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
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
