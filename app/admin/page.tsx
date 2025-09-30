"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"

// Mock data for admin dashboard with Nepal-based content
const recentBlogs = [
  {
    id: 1,
    title: "Welcome to NCIT Academic Year 2024",
    author: "Dr. Shashidhar Ram Joshi",
    date: "2024-01-15",
    status: "published",
    views: 245,
  },
  {
    id: 2,
    title: "Research Opportunities in AI at NCIT",
    author: "Prof. Binod Vaidya",
    date: "2024-01-12",
    status: "published",
    views: 189,
  },
  {
    id: 3,
    title: "Student Life at NCIT: A Comprehensive Guide",
    author: "Rajesh Sharma",
    date: "2024-01-10",
    status: "pending",
    views: 0,
  },
  {
    id: 4,
    title: "Understanding Blockchain Technology",
    author: "Priya Thapa",
    date: "2024-01-08",
    status: "pending",
    views: 0,
  },
]

const recentEvents = [
  { id: 1, title: "NCIT Tech Fest 2024", date: "2024-02-15", status: "upcoming", location: "NCIT Campus, Balkumari" },
  { id: 2, title: "Computer Science Symposium", date: "2024-02-20", status: "upcoming", location: "Main Auditorium" },
  {
    id: 3,
    title: "Cultural Night - Nepali Heritage",
    date: "2024-02-25",
    status: "upcoming",
    location: "Student Center",
  },
]

const stats = [
  { label: "Total Blogs", value: "47", icon: BookOpen },
  { label: "Pending Reviews", value: "8", icon: Clock },
  { label: "Total Events", value: "15", icon: Calendar },
  { label: "Active Students", value: "234", icon: Users },
]

export default function AdminPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
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
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Link>
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-4">Admin Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Manage NCIT college blog and events from this central dashboard.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" asChild>
                  <Link href="/admin/blogs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Blog Post
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/admin/events/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/admin/review">
                    <Clock className="h-4 w-4 mr-2" />
                    Review Pending Blogs
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/admin/blogs">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage All Blogs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Website Status</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Backup</span>
                  <span className="text-sm text-foreground">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Storage Used</span>
                  <span className="text-sm text-foreground">2.4 GB / 10 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <span className="text-sm text-foreground">234 registered</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Blogs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Blogs</CardTitle>
                  <CardDescription>Latest blog posts and pending reviews</CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link href="/admin/blogs">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(blog.status)}
                          <h4 className="font-semibold text-foreground line-clamp-1">{blog.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By {blog.author} • {blog.date}
                        </p>
                        {blog.status === "published" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <Eye className="h-3 w-3 inline mr-1" />
                            {blog.views} views
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={getStatusColor(blog.status)}>
                          {blog.status}
                        </Badge>
                        {blog.status === "pending" && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/review/${blog.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/blogs/${blog.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>Upcoming and recent events</CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link href="/admin/events">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground line-clamp-1">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{event.status}</Badge>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
