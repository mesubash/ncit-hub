"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Eye, Search } from "lucide-react"
import { useState } from "react"

// Extended mock blog data for admin
const allBlogs = [
  {
    id: 1,
    title: "Welcome to the New Academic Year",
    author: "Dean Johnson",
    date: "2024-01-15",
    status: "published",
    views: 1250,
    category: "Announcements",
  },
  {
    id: 2,
    title: "Research Opportunities in Computer Science",
    author: "Prof. Sarah Chen",
    date: "2024-01-12",
    status: "published",
    views: 890,
    category: "Academics",
  },
  {
    id: 3,
    title: "Student Life: Making the Most of Your College Experience",
    author: "Student Council",
    date: "2024-01-10",
    status: "published",
    views: 1420,
    category: "Student Life",
  },
  {
    id: 4,
    title: "Draft: Upcoming Changes to Curriculum",
    author: "Admin",
    date: "2024-01-08",
    status: "draft",
    views: 0,
    category: "Academics",
  },
  {
    id: 5,
    title: "New Library Resources Available",
    author: "Library Staff",
    date: "2024-01-05",
    status: "published",
    views: 567,
    category: "Resources",
  },
]

export default function AdminBlogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredBlogs = allBlogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
              <Link href="/admin/blogs/new">
                <Plus className="h-4 w-4 mr-2" />
                New Blog Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "published" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("published")}
                >
                  Published
                </Button>
                <Button
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("draft")}
                >
                  Drafts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blogs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts ({filteredBlogs.length})</CardTitle>
            <CardDescription>Manage and organize your blog content</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
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
                    <TableCell>{blog.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{blog.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.status === "published" ? "secondary" : "outline"}>{blog.status}</Badge>
                    </TableCell>
                    <TableCell>{blog.views.toLocaleString()}</TableCell>
                    <TableCell>{blog.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/blogs/${blog.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/blogs/${blog.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
