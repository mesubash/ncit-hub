"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
// TODO: Enable notifications later
// import { NotificationDropdown } from "@/components/notification-dropdown"
import { Menu, X, User, LogOut, Plus, LayoutDashboard, FileEdit, Calendar, Shield, Sparkles } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useFeatureToggle } from "@/hooks/use-feature-toggle"
import { FEATURE_TOGGLE_KEYS } from "@/lib/feature-toggles"

// Public navigation items (visible to everyone)
const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

// Student-specific navigation items
const studentNavItems = [
  { href: "/create-blog", label: "Write Blog", icon: Plus },
]

// Admin-specific navigation items
const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const { isEnabled: isEventManagementEnabled } = useFeatureToggle(
    FEATURE_TOGGLE_KEYS.EVENT_MANAGEMENT,
    { subscribe: true, defaultEnabled: false },
  )
  const showEventLinks = isEventManagementEnabled

  const handleLogout = () => {
    setShowLogoutDialog(false)
    setMobileMenuOpen(false)
    signOut()
  }

  // Combine navigation items based on role
  const getNavItems = () => {
    let items = publicNavItems.filter(
      (item) => item.href !== "/events" || showEventLinks,
    )
    
    // Hide About and Contact when user is logged in
    if (isAuthenticated && user) {
      items = items.filter(item => item.href !== '/about' && item.href !== '/contact')
    }
    
    if (isAuthenticated && user) {
      if (user.role === "student" || user.role === "faculty") {
        // Both students and faculty can write blogs
        items.push({ href: "/create-blog", label: "Write Blog" })
      } else if (user.role === "admin") {
        // Admins get dashboard link in main nav
        items.push({ href: "/admin", label: "Admin" })
      }
    }
    
    return items
  }

  const navItems = getNavItems()

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary">
              NCIT Hub
            </Link>
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const isAdminButton = item.href === "/admin" && user?.role === "admin"
                const isWriteBlogButton = item.href === "/create-blog" && (user?.role === "student" || user?.role === "faculty")
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 transition-all duration-200 rounded-md group ${
                      isActive 
                        ? "text-foreground font-medium" 
                        : isAdminButton
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 font-medium shadow-md"
                        : isWriteBlogButton
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-medium shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <span className="relative inline-flex items-center gap-1.5">
                      {item.label}
                      {(isAdminButton || isWriteBlogButton) && (
                        <span className="relative">
                          <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                          <span className="absolute inset-0 h-3.5 w-3.5">
                            <span className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
                          </span>
                        </span>
                      )}
                    </span>
                    
                    {/* Animated underline for active page */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary animate-shimmer bg-[length:200%_100%]" />
                    )}
                    
                    {/* Hover effect */}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary/50 transition-all duration-300 group-hover:w-full" />
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                {/* TODO: Enable notifications later */}
                {/* <NotificationDropdown /> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                      <AvatarFallback className="text-xs">
                        {user.full_name 
                          ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                          : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.full_name || user.email.split('@')[0]}</span>
                    <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="hidden md:inline-flex ml-1">
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" className="flex items-center cursor-pointer">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      My Bookmarks
                    </Link>
                  </DropdownMenuItem>

                  {(user.role === "student" || user.role === "faculty") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {user.role === "faculty" ? "Faculty Actions" : "Student Actions"}
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/create-blog" className="flex items-center cursor-pointer">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Blog Post
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/blogs?author=me" className="flex items-center cursor-pointer">
                          <FileEdit className="mr-2 h-4 w-4" />
                          My Blog Posts
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Admin Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/blogs" className="flex items-center cursor-pointer">
                          <FileEdit className="mr-2 h-4 w-4" />
                          Manage Blogs
                        </Link>
                      </DropdownMenuItem>
                      {showEventLinks && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/events" className="flex items-center cursor-pointer">
                            <Calendar className="mr-2 h-4 w-4" />
                            Manage Events
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/admin/review" className="flex items-center cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Review Content
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowLogoutDialog(true)} 
                    className="flex items-center text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              {/* Navigation Links */}
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const isAdminButton = item.href === "/admin" && user?.role === "admin"
                const isWriteBlogButton = item.href === "/create-blog" && (user?.role === "student" || user?.role === "faculty")
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between ${
                      isActive 
                        ? "bg-primary/10 text-foreground font-medium border-l-4 border-primary" 
                        : isAdminButton
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium shadow-md"
                        : isWriteBlogButton
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {(isAdminButton || isWriteBlogButton) && (
                        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 text-xs">
                          {isAdminButton ? "Admin" : "Featured"}
                        </Badge>
                      )}
                    </span>
                    {(isAdminButton || isWriteBlogButton) && (
                      <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                    )}
                  </Link>
                )
              })}

              {/* Authenticated User Menu */}
              {isAuthenticated && user ? (
                <>
                  <div className="border-t pt-2 mt-2">
                    <div className="px-2 py-2 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                        <AvatarFallback className="text-sm">
                          {user.full_name 
                            ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                            : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.full_name || user.email.split('@')[0]}</p>
                        <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>

                  {(user.role === "student" || user.role === "faculty") && (
                    <>
                      <Link
                        href="/create-blog"
                        className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Blog Post
                      </Link>
                      <Link
                        href="/blogs?author=me"
                        className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Blog Posts
                      </Link>
                    </>
                  )}

                  {user.role === "admin" && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Admin</div>
                      <Link
                        href="/admin"
                        className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/blogs"
                        className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Blogs
                      </Link>
                      {showEventLinks && (
                        <Link
                          href="/admin/events"
                          className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Manage Events
                        </Link>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="px-2 py-2 text-left text-destructive hover:bg-destructive/10 rounded"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-2 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}
