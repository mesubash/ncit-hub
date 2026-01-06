"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Enable logs only on localhost or when explicitly toggled
const isDev =
  process.env.NEXT_PUBLIC_ENABLE_LOGS === "true" ||
  (typeof window !== "undefined" && window.location.hostname === "localhost")
const devLog = (...args: any[]) => { if (isDev) console.log(...args) }

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    devLog("AdminGuard auth check:", { isLoading, isAuthenticated, userRole: user?.role });
    
    // Add a delay to prevent immediate redirect during auth state updates
    const redirectTimer = setTimeout(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          devLog("AdminGuard: Redirecting to login");
          router.push("/login")
        } else if (user?.role !== "admin") {
          devLog("AdminGuard: Redirecting to home - not admin");
          router.push("/")
        }
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(redirectTimer);
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

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
