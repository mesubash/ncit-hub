"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { type AuthState, getCurrentUser, signOut as authSignOut } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = async () => {
    console.log("AuthProvider: Starting refreshUser...");
    try {
      console.log("AuthProvider: About to call getCurrentUser...");
      const user = await getCurrentUser();
      console.log("AuthProvider: getCurrentUser completed");
      console.log("AuthProvider: User result:", { 
        hasUser: !!user,
        email: user?.email,
        role: user?.role,
        id: user?.id
      });
      
      console.log("AuthProvider: Setting auth state...");
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
      console.log("AuthProvider: Auth state set successfully");
    } catch (error) {
      console.error("AuthProvider: Error in refreshUser:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const signOut = async () => {
    console.log("AuthProvider: Signing out...");
    try {
      await authSignOut();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("AuthProvider: Error signing out:", error);
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up...");
    const supabase = createClient();

    // Get initial session
    refreshUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string) => {
      console.log("AuthProvider: Auth event:", event);
      
      if (event === "SIGNED_IN") {
        await refreshUser();
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      console.log("AuthProvider: Cleanup");
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ ...authState, signOut, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
