"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * AuthGuard - Protects routes that require authentication
 * Allows both students and faculty to access
 * For admin-only pages, use AdminGuard instead
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && !user.email_verified) {
        // Redirect to verification page if email not verified
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}`)
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
            <p className="text-muted-foreground">Please sign in to access this page.</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

// For backward compatibility, export as StudentGuard too
export { AuthGuard as StudentGuard }
