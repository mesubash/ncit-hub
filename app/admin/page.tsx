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
  Loader2,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { useEffect, useState } from "react"
import { getAllBlogs, getPendingBlogs, type Blog } from "@/lib/blog"
import { getAllEvents, type Event } from "@/lib/events"

export default function AdminPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Statistics
  const [stats, setStats] = useState({
    totalBlogs: 0,
    pendingReviews: 0,
    totalEvents: 0,
    publishedBlogs: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data in parallel
      const [blogsResult, pendingResult, eventsResult] = await Promise.all([
        getAllBlogs(),
        getPendingBlogs(),
        getAllEvents(),
      ])

      if (!blogsResult.error && blogsResult.blogs) {
        setBlogs(blogsResult.blogs.slice(0, 5)) // Latest 5 blogs
        const published = blogsResult.blogs.filter(b => b.status === 'published').length
        
        setStats(prev => ({
          ...prev,
          totalBlogs: blogsResult.blogs.length,
          publishedBlogs: published,
        }))
      }

      if (!pendingResult.error && pendingResult.blogs) {
        setPendingBlogs(pendingResult.blogs.slice(0, 5)) // Latest 5 pending
        setStats(prev => ({
          ...prev,
          pendingReviews: pendingResult.blogs.length,
        }))
      }

      if (!eventsResult.error && eventsResult.events) {
        const upcoming = eventsResult.events
          .filter(e => new Date(e.event_date) > new Date())
          .slice(0, 5)
        setEvents(upcoming)
        setStats(prev => ({
          ...prev,
          totalEvents: eventsResult.events.length,
        }))
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "archived":
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
      case "archived":
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
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Blogs</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalBlogs}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Reviews</p>
                      <p className="text-3xl font-bold text-foreground">{stats.pendingReviews}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalEvents}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Published Blogs</p>
                      <p className="text-3xl font-bold text-foreground">{stats.publishedBlogs}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" asChild>
                  <Link href="/create-blog">
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
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No blogs found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(blog.status)}
                            <h4 className="font-semibold text-foreground line-clamp-1">{blog.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            By {blog.author?.full_name || 'Unknown'} • {new Date(blog.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={getStatusColor(blog.status)}>
                            {blog.status}
                          </Badge>
                          {blog.status === "pending" && (
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/admin/review`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/blogs/${blog.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming events found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground line-clamp-1">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Upcoming
                          </Badge>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/events/${event.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
