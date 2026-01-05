"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { AvatarUpload } from "@/components/avatar-upload"
import { useAuth } from "@/contexts/auth-context"
import { getBlogsByAuthor, type Blog } from "@/lib/blog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, Plus, Edit, Eye, Clock, CheckCircle, XCircle, User, Settings, 
  Loader2, GraduationCap, Briefcase, BookOpen, Calendar, Github, Linkedin, 
  Twitter, Globe, Instagram, Facebook, X as XIcon 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userBlogs, setUserBlogs] = useState<Blog[]>([])
  const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [blogsToShow, setBlogsToShow] = useState(5) // Initial: 5 blogs
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    bio: "",
    department: "",
    user_type: "",
    program_type: "",
    semester: "",
    year: "",
    specialization: "",
    social_links: {
      github: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      website: "",
    },
  })

  useEffect(() => {
    // Only redirect if we're sure the auth state has loaded and user is not authenticated
    if (!isLoading && !isAuthenticated && !user) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, user, router])

  useEffect(() => {
    if (user) {
      // Parse social_links if it's a string
      let parsedSocialLinks = (user as any).social_links || {};
      if (typeof parsedSocialLinks === 'string') {
        try {
          parsedSocialLinks = JSON.parse(parsedSocialLinks);
        } catch (e) {
          console.error("Failed to parse social_links:", e);
          parsedSocialLinks = {
            github: "",
            linkedin: "",
            twitter: "",
            facebook: "",
            instagram: "",
            website: "",
          };
        }
      }
      
      setProfileData({
        full_name: user.full_name || "",
        email: user.email,
        bio: (user as any).bio || "",
        department: (user as any).department || "",
        user_type: (user as any).user_type || "",
        program_type: (user as any).program_type || "",
        semester: (user as any).semester?.toString() || "",
        year: (user as any).year?.toString() || "",
        specialization: (user as any).specialization || "",
        social_links: parsedSocialLinks,
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
        setDisplayedBlogs(result.blogs.slice(0, blogsToShow))
      }
    } catch (error) {
      console.error("Failed to load user blogs:", error)
    } finally {
      setBlogsLoading(false)
    }
  }

  // Update displayed blogs when blogsToShow changes
  useEffect(() => {
    setDisplayedBlogs(userBlogs.slice(0, blogsToShow))
  }, [blogsToShow, userBlogs])

  const loadMoreBlogs = () => {
    setBlogsToShow(prev => prev + 5)
  }

  const hasMoreBlogs = blogsToShow < userBlogs.length

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      
      // Prepare update data
      const updateData: any = {
        full_name: profileData.full_name,
        bio: profileData.bio,
        department: profileData.department,
        social_links: profileData.social_links,
        updated_at: new Date().toISOString(),
      }

      // Add role-specific fields
      if (user.role === "student") {
        updateData.user_type = profileData.user_type
        updateData.program_type = profileData.program_type
        
        if (profileData.program_type === "bachelor") {
          updateData.semester = profileData.semester ? parseInt(profileData.semester) : null
          updateData.year = null
        } else if (profileData.program_type === "master") {
          updateData.year = profileData.year ? parseInt(profileData.year) : null
          updateData.semester = null
        }
        
        if (profileData.program_type === "master") {
          updateData.specialization = profileData.specialization
        }
      } else if (user.role === "faculty") {
        updateData.specialization = profileData.specialization
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      
      setIsEditingProfile(false)
      
      // Refresh user data
      if (refreshUser) {
        await refreshUser()
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                <AvatarFallback className="text-2xl">
                  {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your NCIT account details</CardDescription>
              </div>
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Customize your profile to showcase who you are to the NCIT community. Upload a photo, update your bio, add social links, and more.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <AvatarUpload
                    currentAvatarUrl={user.avatar_url}
                    userId={user.id}
                    userName={user.full_name || user.email}
                    onAvatarChange={(url) => {
                      // Refresh user data to update avatar everywhere
                      if (refreshUser) {
                        refreshUser()
                      }
                    }}
                  />

                  {/* Basic Information */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-semibold">Basic Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Full Name *</Label>
                      <Input
                        id="profile-name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-email">Email</Label>
                      <Input
                        id="profile-email"
                        value={profileData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email changes require admin approval
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-bio">Bio</Label>
                      <Textarea
                        id="profile-bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-department">Department</Label>
                      <Input
                        id="profile-department"
                        value={profileData.department}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g., Computer Science, Information Technology"
                      />
                    </div>
                  </div>

                  {/* Student-specific fields */}
                  {user.role === "student" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-semibold">Academic Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="user-type">Student Type</Label>
                        <Select
                          value={profileData.user_type}
                          onValueChange={(value) => setProfileData((prev) => ({ ...prev, user_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select student type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bachelor_student">Bachelor Student</SelectItem>
                            <SelectItem value="master_student">Master Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {profileData.user_type && (
                        <div className="space-y-2">
                          <Label htmlFor="program-type">Program Type</Label>
                          <Select
                            value={profileData.program_type}
                            onValueChange={(value) => setProfileData((prev) => ({ ...prev, program_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bachelor">Bachelor</SelectItem>
                              <SelectItem value="master">Master</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {profileData.program_type === "bachelor" && (
                        <div className="space-y-2">
                          <Label htmlFor="semester">Semester (1-8)</Label>
                          <Input
                            id="semester"
                            type="number"
                            min="1"
                            max="8"
                            value={profileData.semester}
                            onChange={(e) => setProfileData((prev) => ({ ...prev, semester: e.target.value }))}
                            placeholder="Enter semester"
                          />
                        </div>
                      )}

                      {profileData.program_type === "master" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="year">Year (1-2)</Label>
                            <Input
                              id="year"
                              type="number"
                              min="1"
                              max="2"
                              value={profileData.year}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, year: e.target.value }))}
                              placeholder="Enter year"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input
                              id="specialization"
                              value={profileData.specialization}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, specialization: e.target.value }))}
                              placeholder="e.g., Data Science, AI/ML"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Faculty-specific fields */}
                  {user.role === "faculty" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-semibold">Faculty Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Area of Expertise</Label>
                        <Input
                          id="specialization"
                          value={profileData.specialization}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, specialization: e.target.value }))}
                          placeholder="e.g., Machine Learning, Software Engineering"
                        />
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-semibold">Social Links</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="github" className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          GitHub
                        </Label>
                        <Input
                          id="github"
                          value={profileData.social_links.github}
                          onChange={(e) => setProfileData((prev) => ({ 
                            ...prev, 
                            social_links: { ...prev.social_links, github: e.target.value }
                          }))}
                          placeholder="https://github.com/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={profileData.social_links.linkedin}
                          onChange={(e) => setProfileData((prev) => ({ 
                            ...prev, 
                            social_links: { ...prev.social_links, linkedin: e.target.value }
                          }))}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter/X
                        </Label>
                        <Input
                          id="twitter"
                          value={profileData.social_links.twitter}
                          onChange={(e) => setProfileData((prev) => ({ 
                            ...prev, 
                            social_links: { ...prev.social_links, twitter: e.target.value }
                          }))}
                          placeholder="https://twitter.com/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="flex items-center gap-2">
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </Label>
                        <Input
                          id="facebook"
                          value={profileData.social_links.facebook}
                          onChange={(e) => setProfileData((prev) => ({ 
                            ...prev, 
                            social_links: { ...prev.social_links, facebook: e.target.value }
                          }))}
                          placeholder="https://facebook.com/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={profileData.social_links.instagram}
                          onChange={(e) => setProfileData((prev) => ({ 
                            ...prev, 
                            social_links: { ...prev.social_links, instagram: e.target.value }
                          }))}
                          placeholder="https://instagram.com/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={profileData.social_links.website}
                          onChange={(e) => setProfileData((prev) => ({ 
                            ...prev, 
                            social_links: { ...prev.social_links, website: e.target.value }
                          }))}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Edit Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Customize your profile to showcase who you are to the NCIT community.
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>What you can update:</strong>
                    </p>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-300 ml-4 list-disc">
                      <li><strong>Profile Picture:</strong> Upload a professional photo (max 2MB)</li>
                      <li><strong>Basic Info:</strong> Name, bio, and department</li>
                      <li><strong>Academic Details:</strong> Program type, semester/year, specialization</li>
                      <li><strong>Social Links:</strong> Connect your GitHub, LinkedIn, Twitter, and more</li>
                    </ul>
                  </div>
                </div>
              </div>

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

              {/* Bio */}
              {(user as any).bio && (
                <div className="border-t pt-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">About</p>
                    <p className="text-base leading-relaxed text-foreground">{(user as any).bio}</p>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(() => {
                let socialLinks = (user as any).social_links;
                
                // Parse if it's a string
                if (typeof socialLinks === 'string') {
                  try {
                    socialLinks = JSON.parse(socialLinks);
                  } catch (e) {
                    console.error("Failed to parse social_links for display:", e);
                    socialLinks = null;
                  }
                }
                
                // Check if any links exist
                const hasLinks = socialLinks && Object.values(socialLinks).some((link: any) => link);
                
                if (!hasLinks) return null;
                
                return (
                  <div className="border-t pt-6">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Connect With Me</p>
                      <div className="flex flex-wrap gap-3">
                        {socialLinks.github && (
                          <a
                            href={socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Github className="h-4 w-4" />
                            <span className="text-sm font-medium">GitHub</span>
                          </a>
                        )}
                        {socialLinks.linkedin && (
                          <a
                            href={socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span className="text-sm font-medium">LinkedIn</span>
                          </a>
                        )}
                        {socialLinks.twitter && (
                          <a
                            href={socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg transition-colors"
                          >
                            <Twitter className="h-4 w-4" />
                            <span className="text-sm font-medium">Twitter</span>
                          </a>
                        )}
                        {socialLinks.facebook && (
                          <a
                            href={socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                          >
                            <Facebook className="h-4 w-4" />
                            <span className="text-sm font-medium">Facebook</span>
                          </a>
                        )}
                        {socialLinks.instagram && (
                          <a
                            href={socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg transition-colors"
                          >
                            <Instagram className="h-4 w-4" />
                            <span className="text-sm font-medium">Instagram</span>
                          </a>
                        )}
                        {socialLinks.website && (
                          <a
                            href={socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                            <span className="text-sm font-medium">Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
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
                {displayedBlogs.map((blog) => (
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
                
                {/* Load More Button */}
                {hasMoreBlogs && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMoreBlogs}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Load More Blogs ({userBlogs.length - blogsToShow} remaining)
                    </Button>
                  </div>
                )}
                
                {/* Showing count */}
                <div className="text-center text-sm text-muted-foreground pt-2">
                  Showing {displayedBlogs.length} of {userBlogs.length} blogs
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
