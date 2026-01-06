"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { type AuthState, getCurrentUser, signOut as authSignOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

// Enable logs only on localhost or when explicitly toggled
const isDev =
  process.env.NEXT_PUBLIC_ENABLE_LOGS === "true" ||
  (typeof window !== "undefined" && window.location.hostname === "localhost")
const devLog = (...args: any[]) => { if (isDev) console.log(...args) }
const devWarn = (...args: any[]) => { if (isDev) console.warn(...args) }
const devError = (...args: any[]) => { if (isDev) console.error(...args) }

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
          devLog("AuthProvider: Using cached profile");
          return parsed.user;
        }
      }
    } catch (error) {
      devWarn("AuthProvider: Error loading cached user:", error);
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
      devWarn("AuthProvider: Error caching user:", error);
    }
  };

  const loadUser = async (authUserId: string, sessionEmail: string) => {
    devLog("AuthProvider: Loading user profile for:", authUserId);
    const supabase = createClient();

    const handleUnverified = async (email: string | undefined) => {
      devLog("AuthProvider: User email not verified, signing out", email);
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        devWarn("AuthProvider: Error signing out unverified user:", signOutError);
      }

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      toast({
        title: "Email verification required",
        description: "Please verify your email to continue.",
        variant: "destructive",
      });
    };
    
    // Try to load from cache first
    const cachedUser = loadCachedUser(authUserId);
    
    if (cachedUser) {
      // If cached user is not verified, sign out immediately
      if (!cachedUser.email_verified) {
        await handleUnverified(cachedUser.email);
        return;
      }

      // Use cached user immediately for instant UI
      devLog("AuthProvider: Setting cached user immediately");
      setAuthState({
        user: cachedUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      // No cache, stay unauthenticated until we confirm verification
      setAuthState({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });
    }
    
    // Then load fresh profile in the background with a 2-second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile query timeout after 2 seconds')), 2000);
    });
    
    try {
      devLog("AuthProvider: Loading fresh profile in background...");
      
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
        devWarn("AuthProvider: Profile query failed, keeping current user:", profileError.message);
        return;
      }

      if (profile) {
        if (!profile.email_verified) {
          await handleUnverified(profile.email);
          return;
        }

        devLog("AuthProvider: Fresh profile loaded, updating state and cache");
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
          email_verified: profile.email_verified,
          email_verified_at: profile.email_verified_at,
          google_id: profile.google_id,
          google_account_verified: profile.google_account_verified,
          social_links: profile.social_links || {},
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
      devWarn("AuthProvider: Background profile load failed, keeping current user:", error);
    }
  };

  const refreshUser = async () => {
    devLog("AuthProvider: Starting refreshUser...");
    try {
      const user = await getCurrentUser();
      devLog("AuthProvider: getCurrentUser result:", { 
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
      devError("AuthProvider: Error in refreshUser:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const signOut = async () => {
    devLog("AuthProvider: Signing out...");
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
      devError("AuthProvider: Error signing out:", error);
    }
  };

  useEffect(() => {
    devLog("AuthProvider: Initializing...");
    const supabase = createClient();

    // Listen for auth changes FIRST, then get initial session
    const {
      data: { subscription },
    } =    supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      // Check if we're in registration mode - if so, ignore ALL auth events
      const isRegistering = typeof window !== 'undefined' && sessionStorage.getItem('isRegistering') === 'true';
      
      devLog("AuthProvider: Auth state change:", event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        isInitialLoad: isInitialLoad.current,
        isRegistering,
      });
      
      if (isRegistering) {
        devLog("AuthProvider: Ignoring ALL auth events during registration");
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
          devLog("AuthProvider: Ignoring SIGNED_OUT event during registration");
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
      devLog("AuthProvider: Cleaning up subscription");
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
