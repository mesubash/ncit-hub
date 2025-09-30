"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { StudentGuard } from "@/components/student-guard"
import { ImageUpload } from "@/components/image-upload"
import { useAuth } from "@/contexts/auth-context"
import { getBlogById, updateBlog, blogCategories, generateExcerpt } from "@/lib/blog"
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react"

export default function EditBlogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBlog, setIsLoadingBlog] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    images: [] as string[], // Added images to form data
  })

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const blog = await getBlogById(blogId)
        if (!blog) {
          setError("Blog not found")
          return
        }

        if (blog.authorId !== user?.id && user?.role !== "admin") {
          setError("You don't have permission to edit this blog")
          return
        }

        setFormData({
          title: blog.title,
          content: blog.content,
          category: blog.category,
          tags: blog.tags.join(", "),
          images: blog.images || [], // Load existing images
        })
      } catch (err) {
        setError("Failed to load blog")
      } finally {
        setIsLoadingBlog(false)
      }
    }

    if (user && blogId) {
      loadBlog()
    }
  }, [user, blogId])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    if (!formData.content.trim()) {
      setError("Content is required")
      return
    }

    if (!formData.category) {
      setError("Category is required")
      return
    }

    setIsLoading(true)

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const updates = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: generateExcerpt(formData.content.trim()),
        category: formData.category,
        tags,
        images: formData.images, // Include images in updates
        status: isDraft ? ("draft" as const) : ("pending" as const),
      }

      await updateBlog(blogId, updates)

      if (isDraft) {
        setSuccess("Blog updated and saved as draft!")
      } else {
        setSuccess("Blog updated and resubmitted for review!")
        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      }
    } catch (err) {
      setError("Failed to update blog. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingBlog) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog...</p>
          </div>
        </div>
      </StudentGuard>
    )
  }

  return (
    <StudentGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Edit Blog</h1>
            <p className="text-xl text-muted-foreground">Update your blog and resubmit for review</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Edit Blog Details</CardTitle>
              <CardDescription>
                Make your changes below. The blog will be resubmitted for admin review after editing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter your blog title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    type="text"
                    placeholder="Enter tags separated by commas"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                  />
                </div>

                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => handleInputChange("images", images)}
                  maxImages={5}
                  maxSizePerImage={5}
                />

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your blog content here..."
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    className="min-h-[300px]"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Update & Resubmit
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentGuard>
  )
}
