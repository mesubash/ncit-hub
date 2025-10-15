"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { getPendingBlogs, updateBlog, type Blog } from "@/lib/blog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Eye, CheckCircle, XCircle, Clock, User, Calendar, Tag, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminReviewPage() {
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadPendingBlogs()
  }, [])

  const loadPendingBlogs = async () => {
    try {
      const blogs = await getPendingBlogs()
      setPendingBlogs(Array.isArray(blogs) ? blogs : [])
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load pending blogs",
        variant: "destructive",
      })
      setPendingBlogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (blogId: string) => {
    setActionLoading(blogId)

    try {
      await updateBlog(blogId, {
        status: "published",
      })

      setPendingBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
      toast({
        title: "Success",
        description: "Blog approved and published successfully!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve blog",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (blogId: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      })
      return
    }

    setActionLoading(blogId)

    try {
      await updateBlog(blogId, {
        status: "archived", // Use archived instead of rejected
      })

      setPendingBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
      toast({
        title: "Success",
        description: "Blog rejected with feedback sent to author!",
      })
      setRejectionReason("")
      setSelectedBlog(null)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject blog",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pending blogs...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Blog Review Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Review and moderate student blog submissions ({pendingBlogs.length} pending)
            </p>
          </div>

          {pendingBlogs.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">All blog submissions have been reviewed!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingBlogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{blog.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {blog.author?.full_name || blog.author?.email || 'Unknown Author'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(blog.created_at).toLocaleDateString()}
                          </div>
                          {blog.category && (
                            <Badge variant="secondary">{blog.category.name}</Badge>
                          )}
                        </div>
                        {blog.tags.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <div className="flex flex-wrap gap-1">
                              {blog.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">Excerpt:</h4>
                      <p className="text-muted-foreground">{blog.excerpt}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-2">Full Content:</h4>
                      <div className="bg-muted/30 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <div className="whitespace-pre-wrap text-sm">{blog.content}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => handleApprove(blog.id)}
                        disabled={actionLoading === blog.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === blog.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve & Publish
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="flex-1" onClick={() => setSelectedBlog(blog)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Blog Submission</DialogTitle>
                            <DialogDescription>
                              Please provide feedback to help the author improve their submission.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                              <Textarea
                                id="rejection-reason"
                                placeholder="Explain why this blog is being rejected and provide constructive feedback..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedBlog(null)
                                  setRejectionReason("")
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => selectedBlog && handleReject(selectedBlog.id, rejectionReason)}
                                disabled={!rejectionReason.trim() || actionLoading === selectedBlog?.id}
                              >
                                {actionLoading === selectedBlog?.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Reject Blog
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" asChild>
                        <Link href={`/blogs/${blog.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
