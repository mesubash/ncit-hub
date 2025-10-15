"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { useAuth } from "@/contexts/auth-context"
import { getBlogsByAuthor, type Blog } from "@/lib/blog"
import { ArrowLeft, Plus, Edit, Eye, Clock, CheckCircle, XCircle, User, Settings, Loader2, GraduationCap, Briefcase, BookOpen, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [userBlogs, setUserBlogs] = useState<Blog[]>([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    console.log("Profile page auth check:", { isLoading, isAuthenticated, hasUser: !!user });
    
    // Only redirect if we're sure the auth state has loaded and user is not authenticated
    if (!isLoading && !isAuthenticated && !user) {
      console.log("Redirecting to login from profile page - no user found");
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, user, router])

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.full_name || "",
        email: user.email,
      })
      loadUserBlogs()
    }
  }, [user])

  const loadUserBlogs = async () => {
    if (!user) return

    try {
      const result = await getBlogsByAuthor(user.id)
      if (result.blogs) {
        setUserBlogs(result.blogs)
      }
    } catch (error) {
      console.error("Failed to load user blogs:", error)
    } finally {
      setBlogsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "archived":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "draft":
        return <Edit className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const totalViews = userBlogs.reduce((sum, blog) => sum + blog.views, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-xl text-muted-foreground">Manage your blogs and account settings</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your NCIT account details</CardDescription>
            </div>
            <div className="flex gap-2">
              <ChangePasswordDialog />
              <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information. Note: Email changes require admin approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={profileData.name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@ncit.edu.np"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email changes are currently disabled. Contact admin for email updates.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // Here you would typically update the user profile
                        setIsEditingProfile(false)
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{user.full_name || "Not set"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Role */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <div className="flex items-center gap-2">
                      {user.role === "faculty" ? (
                        <Briefcase className="h-4 w-4 text-primary" />
                      ) : (
                        <GraduationCap className="h-4 w-4 text-primary" />
                      )}
                      <Badge variant="secondary" className="capitalize text-base px-3 py-1">
                        {user.role === "faculty" ? "Faculty Member" : "Student"}
                      </Badge>
                    </div>
                  </div>

                  {/* User Type */}
                  {user.user_type && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Program Level</p>
                      <p className="text-lg capitalize">
                        {user.user_type === "bachelor_student" && "Bachelor's Student"}
                        {user.user_type === "master_student" && "Master's Student"}
                        {user.user_type === "faculty" && "Faculty Member"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Info */}
              {user.department && (
                <div className="border-t pt-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {user.role === "faculty" ? "Department(s) / Expertise" : "Department / Program"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.department.split(",").map((dept, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                          {dept.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Details */}
              {(user.semester || user.year || user.program_type) && (
                <div className="border-t pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Program Type */}
                    {user.program_type && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Program Type</p>
                        <p className="text-lg capitalize">{user.program_type}'s Program</p>
                      </div>
                    )}

                    {/* Semester for Bachelor students */}
                    {user.semester && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Current Semester
                        </p>
                        <p className="text-lg font-semibold">
                          {user.semester}
                          {user.semester === 1 ? "st" : user.semester === 2 ? "nd" : user.semester === 3 ? "rd" : "th"} Semester
                        </p>
                      </div>
                    )}

                    {/* Year for Master students */}
                    {user.year && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Current Year
                        </p>
                        <p className="text-lg font-semibold">
                          {user.year}{user.year === 1 ? "st" : "nd"} Year
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specialization */}
              {user.specialization && (
                <div className="border-t pt-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {user.role === "faculty" ? "Research / Teaching Focus" : "Specialization"}
                    </p>
                    <p className="text-lg">{user.specialization}</p>
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="border-t pt-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-lg font-semibold">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary">{userBlogs.length}</p>
              <p className="text-sm text-muted-foreground">Total Blogs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {userBlogs.filter((b) => b.status === "published").length}
              </p>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {userBlogs.filter((b) => b.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{totalViews}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
        </div>

        {/* My Blogs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Blogs</CardTitle>
              <CardDescription>All your blog posts and their current status</CardDescription>
            </div>
            <Button asChild>
              <Link href="/create-blog">
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {blogsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your blogs...</p>
              </div>
            ) : userBlogs.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't written any blogs yet.</p>
                <Button asChild>
                  <Link href="/create-blog">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Blog
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userBlogs.map((blog) => (
                  <div key={blog.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{blog.title}</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(blog.status)}
                        <Badge variant="secondary" className={getStatusColor(blog.status)}>
                          {blog.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      {blog.category && (
                        <Badge variant="outline">{blog.category.name}</Badge>
                      )}
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{blog.tags.length - 3} more</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(blog.created_at).toLocaleDateString()}</span>
                        {blog.status === "published" && (
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {blog.views} views
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {blog.status === "published" && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/blogs/${blog.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                        {(blog.status === "archived" || blog.status === "pending" || blog.status === "draft") && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/edit-blog/${blog.id}`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    {blog.status === "archived" && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Note:</strong> This blog has been archived and is no longer visible to the public.
                        </p>
                        {blog.rejection_reason && (
                          <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                            <p className="text-sm text-red-900 dark:text-red-100 font-semibold mb-1">
                              Admin Feedback:
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-200 italic">
                              {blog.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
