"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { Calendar, Clock, User, ArrowRight, Plus, LayoutDashboard, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const recentBlogs = [
  {
    id: 1,
    title: "Welcome to NCIT Academic Year 2024",
    excerpt:
      "As we begin another exciting year at NCIT, we're thrilled to welcome new students and returning scholars to our vibrant campus in Balkumari, Lalitpur...",
    author: "Dr. Shashidhar Ram Joshi",
    date: "2024-01-15",
    category: "Announcements",
  },
  {
    id: 2,
    title: "Research Opportunities in AI at NCIT",
    excerpt:
      "Our Computer Science department is offering exciting research opportunities for undergraduate students this semester, focusing on AI applications in Nepal...",
    author: "Prof. Binod Vaidya",
    date: "2024-01-12",
    category: "Academics",
  },
  {
    id: 3,
    title: "Student Life at NCIT: A Comprehensive Guide",
    excerpt:
      "College is more than just academics. Here's how to get involved in campus life at NCIT and build lasting connections with fellow Nepalese students...",
    author: "Rajesh Sharma",
    date: "2024-01-10",
    category: "Student Life",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "NCIT Tech Fest 2024",
    description:
      "Annual technology festival featuring student projects, competitions, and industry speakers from Nepal's growing tech sector.",
    date: "2024-02-15",
    time: "10:00 AM - 6:00 PM",
    location: "NCIT Campus, Balkumari",
    category: "Technology",
  },
  {
    id: 2,
    title: "Computer Science Symposium",
    description:
      "Academic symposium featuring student research presentations and guest speakers from Nepal's IT industry.",
    date: "2024-02-20",
    time: "9:00 AM - 5:00 PM",
    location: "Main Auditorium, NCIT",
    category: "Academic",
  },
  {
    id: 3,
    title: "Cultural Night - Nepali Heritage",
    description:
      "Celebrate Nepal's rich cultural diversity with traditional performances, food, and cultural exhibitions.",
    date: "2024-02-25",
    time: "6:00 PM - 10:00 PM",
    location: "Student Center, NCIT",
    category: "Cultural",
  },
]

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - Different content based on auth state */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {isAuthenticated && user ? (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Welcome back, {user.name || user.email.split('@')[0]}!
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
                {user.role === "admin" 
                  ? "Manage content, review submissions, and oversee NCIT Hub's operations."
                  : "Share your thoughts, explore campus news, and connect with the NCIT community."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user.role === "student" && (
                  <>
                    <Button size="lg" asChild>
                      <Link href="/create-blog">
                        <Plus className="mr-2 h-5 w-5" />
                        Write a Blog Post
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/blogs">Explore Blogs</Link>
                    </Button>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <Button size="lg" asChild>
                      <Link href="/admin">
                        <LayoutDashboard className="mr-2 h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/admin/review">
                        <Shield className="mr-2 h-5 w-5" />
                        Review Content
                      </Link>
                    </Button>
                  </>
                )}
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/events">View Events</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Welcome to NCIT Hub
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
                Your central destination for NCIT college news, events, and community updates. Stay connected with campus
                life and never miss what matters most in Nepal's premier technology institute.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Join NCIT Hub <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/blogs">Explore Blogs</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/events">View Events</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quick Access Section - Only for authenticated users */}
      {isAuthenticated && user && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Quick Access</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.role === "student" && (
                <>
                  <Link href="/create-blog">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Plus className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Write Blog</CardTitle>
                            <CardDescription>Share your thoughts</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link href="/blogs?author=me">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">My Posts</CardTitle>
                            <CardDescription>View your blogs</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link href="/admin">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Dashboard</CardTitle>
                            <CardDescription>Admin overview</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link href="/admin/review">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Shield className="h-6 w-6 text-orange-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Review</CardTitle>
                            <CardDescription>Pending content</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link href="/admin/blogs">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <Calendar className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Manage Blogs</CardTitle>
                            <CardDescription>Edit & publish</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              )}
              <Link href="/profile">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <User className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Profile</CardTitle>
                        <CardDescription>Edit your info</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Blogs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Recent Blogs</h2>
            <Button variant="ghost" asChild>
              <Link href="/blogs">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBlogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{blog.category}</Badge>
                    <span className="text-sm text-muted-foreground">{blog.date}</span>
                  </div>
                  <CardTitle className="text-xl hover:text-primary transition-colors">
                    <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">{blog.excerpt}</CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    {blog.author}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
            <Button variant="ghost" asChild>
              <Link href="/events">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{event.category}</Badge>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {event.time}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-xl hover:text-primary transition-colors">
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{event.description}</CardDescription>
                  <div className="text-sm text-muted-foreground">📍 {event.location}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">NCIT Hub</h3>
              <p className="text-muted-foreground text-sm">
                Your central hub for NCIT college news, events, and community updates.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blogs" className="text-muted-foreground hover:text-primary">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-muted-foreground hover:text-primary">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blogs?category=academics" className="text-muted-foreground hover:text-primary">
                    Academics
                  </Link>
                </li>
                <li>
                  <Link href="/blogs?category=student-life" className="text-muted-foreground hover:text-primary">
                    Student Life
                  </Link>
                </li>
                <li>
                  <Link href="/blogs?category=technology" className="text-muted-foreground hover:text-primary">
                    Technology
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Info</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>📧 info@ncit.edu.np</p>
                <p>📞 +977-1-5201003</p>
                <p>📍 Balkumari, Lalitpur, Nepal</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 NCIT Hub. All rights reserved.</p>
            <p className="mt-2">
              Developed by{" "}
              <Link href="/about#developer" className="text-primary hover:underline">
                Nepal Tech Community
              </Link>{" "}
              | Managed by{" "}
              <Link href="/about#community" className="text-primary hover:underline">
                NCIT Students & Faculty
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
