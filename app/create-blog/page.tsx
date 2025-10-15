"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { createBlog, blogCategories, generateExcerpt } from "@/lib/blog"
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react"

export default function CreateBlogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    images: [] as string[], // Added images to form data
  })

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

    if (!user) {
      setError("User not authenticated")
      return
    }

    setIsLoading(true)

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const blogData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: generateExcerpt(formData.content.trim()),
        author_id: user.id,
        category_id: formData.category,
        tags,
        images: formData.images, // Include images in blog data
        status: isDraft ? ("draft" as const) : ("pending" as const),
      }

      await createBlog(blogData)

      if (isDraft) {
        setSuccess("Blog saved as draft successfully!")
      } else {
        setSuccess("Blog submitted for review successfully!")
        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      }
    } catch (err) {
      setError("Failed to create blog. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Create New Blog</h1>
            <p className="text-xl text-muted-foreground">Share your thoughts and experiences with the NCIT community</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blog Details</CardTitle>
              <CardDescription>
                Fill in the details below. Your blog will be submitted for admin review before publication.
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
                    placeholder="Enter your blog title (e.g., My Experience at NCIT Tech Fest 2024)"
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
                    placeholder="Enter tags separated by commas (e.g., technology, ncit, student-life)"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Add relevant tags to help others discover your blog</p>
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
                    placeholder="Write your blog content here... Share your experiences, insights, or knowledge with the NCIT community."
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    className="min-h-[300px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Write engaging content that will be valuable to your fellow students and faculty
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Review
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

                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Submission Guidelines:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Your blog will be reviewed by admin before publication</li>
                    <li>• Ensure content is relevant to NCIT community</li>
                    <li>• Use proper grammar and formatting</li>
                    <li>• Avoid plagiarism and cite sources when necessary</li>
                    <li>• Be respectful and maintain academic integrity</li>
                    <li>• Images should be appropriate and relevant to your content</li>
                  </ul>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentGuard>
  )
}
