"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { getAllBlogs, deleteBlog, type Blog } from "@/lib/blog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Eye, Search, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "pending" | "archived">("all")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadBlogs()
  }, [])

  const loadBlogs = async () => {
    try {
      setIsLoading(true)
      const { blogs: allBlogs, error } = await getAllBlogs()
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load blogs",
          variant: "destructive",
        })
        return
      }

      setBlogs(allBlogs)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load blogs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (blogId: string) => {
    setDeleteLoading(blogId)

    try {
      const { error } = await deleteBlog(blogId)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete blog",
          variant: "destructive",
        })
        return
      }

      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
      toast({
        title: "Success",
        description: "Blog deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      published: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
      draft: { variant: "outline" },
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
      archived: { variant: "destructive" },
    }

    const config = variants[status] || { variant: "outline" }
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blogs...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Manage Blogs</h1>
                <p className="text-xl text-muted-foreground">Create, edit, and manage all blog posts.</p>
              </div>
              <Button asChild>
                <Link href="/create-blog">
                  <Plus className="h-4 w-4 mr-2" />
                  New Blog Post
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Blogs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {blogs.filter((b) => b.status === "published").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {blogs.filter((b) => b.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {blogs.filter((b) => b.status === "draft").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blogs by title or author..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>All</Button>
                  <Button variant={statusFilter === "published" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("published")}>Published</Button>
                  <Button variant={statusFilter === "pending" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("pending")}>Pending</Button>
                  <Button variant={statusFilter === "draft" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("draft")}>Drafts</Button>
                  <Button variant={statusFilter === "archived" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("archived")}>Archived</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Blog Posts ({filteredBlogs.length})</CardTitle>
              <CardDescription>Manage and organize your blog content</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBlogs.length === 0 ? (
                <div className="py-16 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Blogs Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first blog post to get started"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-xs truncate">{blog.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{blog.author?.full_name || "Unknown"}</div>
                            <div className="text-muted-foreground text-xs">{blog.author?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {blog.category ? <Badge variant="outline">{blog.category.name}</Badge> : <span className="text-muted-foreground text-sm">N/A</span>}
                        </TableCell>
                        <TableCell>{getStatusBadge(blog.status)}</TableCell>
                        <TableCell>{blog.views.toLocaleString()}</TableCell>
                        <TableCell>{blog.likes.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(blog.created_at).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/blogs/${blog.id}`}><Eye className="h-4 w-4" /></Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" disabled={deleteLoading === blog.id}>
                                  {deleteLoading === blog.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the blog post &quot;{blog.title}&quot;.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(blog.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
