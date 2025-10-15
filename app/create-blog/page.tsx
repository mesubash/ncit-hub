"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { createBlog, getCategories, generateExcerpt, generateSlug, type CategoryRow } from "@/lib/blog"
import { ArrowLeft, Save, Send, Loader2, Eye, FileText, Calendar, Type, Hash, BookOpen, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CreateBlogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("write")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    images: [] as string[],
  })

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        const { categories: cats, error: catError } = await getCategories()
        
        if (catError) {
          console.error("Failed to load categories:", catError)
          toast({
            title: "Warning",
            description: "Failed to load categories. Please refresh the page.",
            variant: "destructive",
          })
          return
        }
        
        if (!cats || cats.length === 0) {
          console.warn("No categories found in database")
          toast({
            title: "Warning",
            description: "No blog categories available. Please contact admin.",
            variant: "destructive",
          })
          return
        }
        
        setCategories(cats)
        console.log("Loaded categories:", cats)
      } catch (err) {
        console.error("Error loading categories:", err)
        toast({
          title: "Error",
          description: "Failed to load categories.",
          variant: "destructive",
        })
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('blog-draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setFormData(draft)
        setLastSaved(new Date(draft.savedAt))
        toast({
          title: "Draft Recovered",
          description: "Your previous draft has been restored.",
        })
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
  }, [toast])

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.content) {
        const draft = { ...formData, savedAt: new Date().toISOString() }
        localStorage.setItem('blog-draft', JSON.stringify(draft))
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const clearDraft = useCallback(() => {
    localStorage.removeItem('blog-draft')
    setLastSaved(null)
  }, [])

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
        images: formData.images,
        status: isDraft ? ("draft" as const) : ("pending" as const),
      }

      console.log("Creating blog with data:", blogData)
      
      // Show submitting toast
      toast({
        title: isDraft ? "Saving draft..." : "Submitting for review...",
        description: "Please wait while we process your blog.",
      })

      const result = await createBlog(blogData)
      
      console.log("Create blog result:", result)

      if (result.error) {
        console.error("Blog creation error:", result.error)
        setError(result.error)
        toast({
          title: "❌ Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Clear draft after successful submission
      clearDraft()

      if (isDraft) {
        setSuccess("✅ Blog saved as draft successfully!")
        toast({
          title: "✅ Draft Saved",
          description: "Your blog has been saved as a draft. You can edit it anytime.",
        })
      } else {
        setSuccess("✅ Blog submitted for review successfully!")
        toast({
          title: "✅ Blog Submitted!",
          description: "Your blog has been submitted to admin for review. You'll be notified once it's published.",
        })
        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      }
    } catch (err) {
      console.error("Error creating blog:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create blog. Please try again."
      setError(errorMessage)
      toast({
        title: "❌ Error",
        description: errorMessage,
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
            
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Save className="h-4 w-4" />
                <span>Last saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Create New Blog</h1>
            <p className="text-xl text-muted-foreground">Share your thoughts and experiences with the NCIT community</p>
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
                  <CardTitle>Blog Details</CardTitle>
                  <CardDescription>
                    Fill in the details below. Your blog will be submitted for admin review before publication.
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
                        placeholder="Enter your blog title (e.g., My Experience at NCIT Tech Fest 2024)"
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
                              : categories.length === 0 
                              ? "No categories available" 
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
                      {categories.length === 0 && !categoriesLoading && (
                        <p className="text-xs text-destructive">
                          No categories found. Please contact admin to set up blog categories.
                        </p>
                      )}
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
                        placeholder="Enter tags separated by commas (e.g., technology, ncit, student-life)"
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
                      <p className="text-xs text-muted-foreground">Add relevant tags to help others discover your blog</p>
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
                        placeholder="Write your blog content here... 

Tips for great content:
• Use clear paragraphs to organize your thoughts
• Break up long text with headings and bullet points
• Share personal experiences and insights
• Include examples and practical advice
• Be authentic and engaging"
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
                      <Button 
                        type="submit" 
                        disabled={
                          isLoading || 
                          contentLength < minContentLength || 
                          !formData.title.trim() || 
                          !formData.category ||
                          categoriesLoading
                        } 
                        className="flex-1"
                      >
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
                        disabled={isLoading || categoriesLoading}
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                      </Button>
                    </div>
                    
                    {/* Validation Messages */}
                    {(contentLength < minContentLength || !formData.title.trim() || !formData.category) && (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-semibold">Please complete the following to submit:</p>
                            <ul className="text-xs space-y-1 ml-4">
                              {!formData.title.trim() && <li>• Add a title</li>}
                              {!formData.category && <li>• Select a category</li>}
                              {contentLength < minContentLength && (
                                <li>• Write at least {minContentLength - contentLength} more characters ({minContentLength} minimum)</li>
                              )}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Guidelines */}
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
                          // Basic markdown rendering
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
                          
                          // Bold and italic (simple regex)
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit for Review
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
