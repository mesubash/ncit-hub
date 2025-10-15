"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { type AuthState, getCurrentUser, signOut as authSignOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast();
  const isInitialLoad = useRef(true);
  const hasSeenInitialSession = useRef(false);

  // Load cached user from localStorage
  const loadCachedUser = (authUserId: string): any | null => {
    try {
      const cached = localStorage.getItem(`user_profile_${authUserId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 24 hours old
        const cacheAge = Date.now() - parsed.cachedAt;
        if (cacheAge < 24 * 60 * 60 * 1000) {
          console.log("AuthProvider: Using cached profile");
          return parsed.user;
        }
      }
    } catch (error) {
      console.warn("AuthProvider: Error loading cached user:", error);
    }
    return null;
  };

  // Save user to localStorage
  const cacheUser = (authUserId: string, user: any) => {
    try {
      localStorage.setItem(`user_profile_${authUserId}`, JSON.stringify({
        user,
        cachedAt: Date.now(),
      }));
    } catch (error) {
      console.warn("AuthProvider: Error caching user:", error);
    }
  };

  const loadUser = async (authUserId: string, sessionEmail: string) => {
    console.log("AuthProvider: Loading user profile for:", authUserId);
    
    // Try to load from cache first
    const cachedUser = loadCachedUser(authUserId);
    
    if (cachedUser) {
      // Use cached user immediately for instant UI
      console.log("AuthProvider: Setting cached user immediately");
      setAuthState({
        user: cachedUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      // No cache, create fallback user immediately
      const fallbackUser = {
        id: authUserId,
        email: sessionEmail,
        full_name: sessionEmail.split('@')[0],
        role: "student" as const,
        user_type: null,
        department: null,
        program_type: null,
        semester: null,
        year: null,
        specialization: null,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setAuthState({
        user: fallbackUser,
        isLoading: false,
        isAuthenticated: true,
      });
    }
    
    // Then load fresh profile in the background with a 2-second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile query timeout after 2 seconds')), 2000);
    });
    
    try {
      const supabase = createClient();
      console.log("AuthProvider: Loading fresh profile in background...");
      
      // Race between the query and timeout
      const result = await Promise.race([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", authUserId)
          .single(),
        timeoutPromise
      ]) as any;

      const { data: profile, error: profileError } = result;

      if (profileError) {
        console.warn("AuthProvider: Profile query failed, keeping current user:", profileError.message);
        return;
      }

      if (profile) {
        console.log("AuthProvider: Fresh profile loaded, updating state and cache");
        const user = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role as "student" | "faculty" | "admin",
          user_type: profile.user_type as "bachelor_student" | "master_student" | "faculty" | null,
          department: profile.department,
          program_type: profile.program_type as "bachelor" | "master" | null,
          semester: profile.semester,
          year: profile.year,
          specialization: profile.specialization,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
        
        // Update state
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        
        // Update cache
        cacheUser(authUserId, user);
      }
    } catch (error) {
      console.warn("AuthProvider: Background profile load failed, keeping current user:", error);
    }
  };

  const refreshUser = async () => {
    console.log("AuthProvider: Starting refreshUser...");
    try {
      const user = await getCurrentUser();
      console.log("AuthProvider: getCurrentUser result:", { 
        hasUser: !!user,
        email: user?.email,
        role: user?.role,
      });
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
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
      
      // Clear all cached user profiles from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_profile_')) {
          localStorage.removeItem(key);
        }
      });
      
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
    console.log("AuthProvider: Initializing...");
    const supabase = createClient();

    // Listen for auth changes FIRST, then get initial session
    const {
      data: { subscription },
    } =    supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      // Check if we're in registration mode - if so, ignore ALL auth events
      const isRegistering = typeof window !== 'undefined' && sessionStorage.getItem('isRegistering') === 'true';
      
      console.log("AuthProvider: Auth state change:", event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        isInitialLoad: isInitialLoad.current,
        isRegistering,
      });
      
      if (isRegistering) {
        console.log("AuthProvider: Ignoring ALL auth events during registration");
        return;
      }
      
      if (event === "INITIAL_SESSION") {
        // Initial session on page load - no toast notification
        hasSeenInitialSession.current = true;
        if (session?.user) {
          await loadUser(session.user.id, session.user.email || '');
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
        // Mark initial load as complete
        isInitialLoad.current = false;
      } else if (event === "SIGNED_IN" && session?.user) {
        // Only show toast if:
        // 1. This is NOT the initial load AND
        // 2. We haven't seen INITIAL_SESSION (means this is a real login, not page refresh)
        await loadUser(session.user.id, session.user.email || '');
        
        if (!isInitialLoad.current && !hasSeenInitialSession.current) {
          toast({
            title: "Welcome!",
            description: "You have successfully signed in.",
          });
        }
        isInitialLoad.current = false;
      } else if (event === "SIGNED_OUT") {
        // User signed out
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        
        // Only show toast if NOT during registration
        if (!isRegistering) {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        } else {
          console.log("AuthProvider: Ignoring SIGNED_OUT event during registration");
        }
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Token was refreshed, reload user data
        await loadUser(session.user.id, session.user.email || '');
      } else if (event === "USER_UPDATED" && session?.user) {
        // User data was updated
        await loadUser(session.user.id, session.user.email || '');
      }
    });

    return () => {
      console.log("AuthProvider: Cleaning up subscription");
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
