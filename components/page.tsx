"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { signIn, formatCollegeEmail } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { refreshUser, user, isAuthenticated } = useAuth()

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Already authenticated, redirecting to appropriate page");
      const redirectPath = user.role === "admin" ? "/admin" : "/profile";
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt started for email:", email)
    setError("")
    setIsLoading(true)

    try {
      // First attempt at sign in
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
        return
      }

      if (!signInUser) {
        console.log("No user returned from signIn")
        setError("Authentication failed. Please try again.")
        return
      }

      // Wait for auth state to be updated
      console.log("Waiting for auth state update...")
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force refresh of auth state
      console.log("Refreshing user state...")
      await refreshUser()
      
      // Force Next.js to revalidate
      console.log("Forcing router refresh...")
      router.refresh()

      // Wait for router refresh
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect based on role
      const redirectPath = signInUser.role === "admin" ? "/admin" : "/profile"
      console.log("Attempting navigation to:", redirectPath)
      
      // Try multiple navigation approaches
      try {
        console.log("Trying router.replace...")
        await router.replace(redirectPath)
        console.log("Router.replace completed")
        
        // If that doesn't work, try window.location
        setTimeout(() => {
          console.log("Fallback: Using window.location.href")
          window.location.href = redirectPath
        }, 1000)
      } catch (navError) {
        console.error("Navigation error:", navError)
        // Final fallback
        console.log("Final fallback: Direct window navigation")
        window.location.href = redirectPath
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
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
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
