"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, User, LogOut, Plus, LayoutDashboard, FileEdit, Calendar, Shield, Sparkles } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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
  const { user, isAuthenticated, signOut } = useAuth()

  // Combine navigation items based on role
  const getNavItems = () => {
    const items = [...publicNavItems]
    
    if (isAuthenticated && user) {
      if (user.role === "student") {
        // Students can write blogs
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
                const isNewForUser = 
                  (item.href === "/create-blog" && user?.role === "student") ||
                  (item.href === "/admin" && user?.role === "admin")
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 transition-all duration-200 rounded-md group ${
                      isActive 
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <span className="relative inline-flex items-center gap-1.5">
                      {item.label}
                      {isNewForUser && (
                        <span className="relative">
                          <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
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

                  {user.role === "student" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Student Actions</DropdownMenuLabel>
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
                      <DropdownMenuItem asChild>
                        <Link href="/admin/events" className="flex items-center cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" />
                          Manage Events
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/review" className="flex items-center cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Review Content
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                const isNewForUser = 
                  (item.href === "/create-blog" && user?.role === "student") ||
                  (item.href === "/admin" && user?.role === "admin")
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between ${
                      isActive 
                        ? "bg-primary/10 text-foreground font-medium border-l-4 border-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {isNewForUser && (
                        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 text-xs">
                          New
                        </Badge>
                      )}
                    </span>
                    {isNewForUser && (
                      <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    )}
                  </Link>
                )
              })}

              {/* Authenticated User Menu */}
              {isAuthenticated && user ? (
                <>
                  <div className="border-t pt-2 mt-2">
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      {user.full_name || user.email.split('@')[0]} 
                      <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="ml-2">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>

                  {user.role === "student" && (
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
                      <Link
                        href="/admin/events"
                        className="px-2 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Events
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
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
    </nav>
  )
}
