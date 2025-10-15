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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { ImageUpload } from "@/components/image-upload"
import { useAuth } from "@/contexts/auth-context"
import { getBlogById, updateBlog, getCategories, generateExcerpt, type CategoryRow } from "@/lib/blog"
import { ArrowLeft, Save, Send, Loader2, Eye, FileText, Type, Hash, BookOpen, Calendar, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditBlogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBlog, setIsLoadingBlog] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("write")
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    images: [] as string[],
  })

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        const { categories: cats, error: catError } = await getCategories()
        
        if (catError) {
          console.error("Failed to load categories:", catError)
          toast({
            title: "Warning",
            description: "Failed to load categories.",
            variant: "destructive",
          })
          return
        }
        
        if (cats && cats.length > 0) {
          setCategories(cats)
          console.log("Loaded categories:", cats)
        }
      } catch (err) {
        console.error("Error loading categories:", err)
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const { blog, error: blogError } = await getBlogById(blogId)
        if (blogError || !blog) {
          setError("Blog not found")
          return
        }

        if (blog.author_id !== user?.id && user?.role !== "admin") {
          setError("You don't have permission to edit this blog")
          return
        }

        setFormData({
          title: blog.title,
          content: blog.content,
          category: blog.category_id || "",
          tags: blog.tags.join(", "),
          images: blog.images || [],
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
        category_id: formData.category,
        tags,
        images: formData.images,
        status: isDraft ? "draft" : "pending",
      } as any

      const result = await updateBlog(blogId, updates)

      if (result.error) {
        setError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (isDraft) {
        setSuccess("Blog updated and saved as draft!")
        toast({
          title: "Draft Saved",
          description: "Your blog has been updated and saved as a draft.",
        })
      } else {
        setSuccess("Blog updated and resubmitted for review!")
        toast({
          title: "Blog Updated",
          description: "Your blog has been updated and resubmitted for review.",
        })
        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      }
    } catch (err) {
      setError("Failed to update blog. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update blog. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Character count helpers
  const titleLength = formData.title.length
  const contentLength = formData.content.length
  const maxTitleLength = 100
  const minContentLength = 100
  const maxContentLength = 10000

  if (isLoadingBlog) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200 mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="write" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="write" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Blog Details</CardTitle>
                  <CardDescription>
                    Make your changes below. The blog will be resubmitted for admin review after editing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                    {/* Title Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Title *
                        </Label>
                        <span className={`text-xs ${titleLength > maxTitleLength ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {titleLength}/{maxTitleLength}
                        </span>
                      </div>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter your blog title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        maxLength={maxTitleLength}
                        required
                        className="text-lg font-semibold"
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Category *
                      </Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleInputChange("category", value)}
                        disabled={categoriesLoading || categories.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            categoriesLoading 
                              ? "Loading categories..." 
                              : "Select a category"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags Input */}
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        type="text"
                        placeholder="Enter tags separated by commas"
                        value={formData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => handleInputChange("images", images)}
                      maxImages={5}
                      maxSizePerImage={5}
                    />

                    {/* Content Editor */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Content *
                        </Label>
                        <span className={`text-xs ${
                          contentLength < minContentLength 
                            ? 'text-orange-500' 
                            : contentLength > maxContentLength 
                            ? 'text-destructive' 
                            : 'text-muted-foreground'
                        }`}>
                          {contentLength} characters {contentLength < minContentLength && `(min: ${minContentLength})`}
                        </span>
                      </div>
                      <Textarea
                        id="content"
                        placeholder="Write your blog content here..."
                        value={formData.content}
                        onChange={(e) => handleInputChange("content", e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        required
                      />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                        <span className="font-semibold">Formatting Tips:</span>
                        <span>**bold**</span>
                        <span>*italic*</span>
                        <span>`code`</span>
                        <span># Heading</span>
                        <span>- List item</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button type="submit" disabled={isLoading || contentLength < minContentLength} className="flex-1">
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
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl">
                        {formData.title || "Your Blog Title"}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        {formData.category && (
                          <Badge variant="secondary">
                            {categories.find(c => c.id === formData.category)?.name || 'Unknown'}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Preview Content */}
                  <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                    {formData.content ? (
                      <div className="whitespace-pre-wrap break-words">
                        {formData.content.split('\n').map((paragraph, index) => {
                          let content = paragraph
                          
                          // Headings
                          if (content.startsWith('# ')) {
                            return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{content.substring(2)}</h1>
                          }
                          if (content.startsWith('## ')) {
                            return <h2 key={index} className="text-2xl font-bold mt-5 mb-3">{content.substring(3)}</h2>
                          }
                          if (content.startsWith('### ')) {
                            return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{content.substring(4)}</h3>
                          }
                          
                          // Lists
                          if (content.startsWith('- ') || content.startsWith('* ')) {
                            return <li key={index} className="ml-4">{content.substring(2)}</li>
                          }
                          
                          // Bold and italic
                          content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          content = content.replace(/\*(.+?)\*/g, '<em>$1</em>')
                          content = content.replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded">$1</code>')
                          
                          return paragraph ? (
                            <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: content }} />
                          ) : (
                            <br key={index} />
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">Your blog content will appear here...</p>
                    )}
                  </div>

                  {/* Preview Images */}
                  {formData.images.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-semibold">Images</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="rounded-lg w-full h-auto object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Tags */}
                  {formData.tags && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag, index) => (
                          <Badge key={index} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Actions */}
                  <div className="mt-8 pt-6 border-t flex gap-4">
                    <Button onClick={() => setActiveTab("write")} variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Back to Edit
                    </Button>
                    <Button onClick={(e) => handleSubmit(e, false)} disabled={isLoading || contentLength < minContentLength}>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
