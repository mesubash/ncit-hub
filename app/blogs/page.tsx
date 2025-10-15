"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { getAllBlogs, getCategories, getUserLikedBlogs, toggleBlogLike, type Blog, type CategoryRow } from "@/lib/blog"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Search, User, Calendar, ArrowLeft, Heart, MessageCircle, Bookmark, TrendingUp, Loader2 } from "lucide-react"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([])
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserLikes()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [blogsResult, categoriesResult] = await Promise.all([
        getAllBlogs("published"), // Only fetch published blogs
        getCategories()
      ])

      if (blogsResult.error) {
        console.error("Failed to load blogs:", blogsResult.error)
      } else {
        setBlogs(blogsResult.blogs)
      }

      if (categoriesResult.error) {
        console.error("Failed to load categories:", categoriesResult.error)
      } else {
        setCategories(categoriesResult.categories)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserLikes = async () => {
    if (!user) return

    try {
      const { blogIds, error } = await getUserLikedBlogs(user.id)
      if (error) {
        console.error("Failed to load user likes:", error)
      } else {
        setLikedPosts(blogIds)
      }
    } catch (error) {
      console.error("Failed to load user likes:", error)
    }
  }

  const handleToggleLike = async (blogId: string) => {
    if (!user) return

    try {
      const { liked, error } = await toggleBlogLike(blogId, user.id)
      if (error) {
        console.error("Failed to toggle like:", error)
      } else {
        setLikedPosts((prev) => (liked ? [...prev, blogId] : prev.filter((id) => id !== blogId)))
        // Update the blog's like count in the local state
        setBlogs((prev) =>
          prev.map((blog) => (blog.id === blogId ? { ...blog, likes: liked ? blog.likes + 1 : blog.likes - 1 } : blog)),
        )
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  const toggleBookmark = (blogId: string) => {
    setBookmarkedPosts((prev) => (prev.includes(blogId) ? prev.filter((id) => id !== blogId) : [...prev, blogId]))
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (blog.author?.full_name && blog.author.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory =
      selectedCategory === "All" ||
      (blog.category && blog.category.name === selectedCategory) ||
      (!blog.category && selectedCategory === "Uncategorized")
    return matchesSearch && matchesCategory
  })

  const trendingBlogs = blogs
    .filter((blog) => blog.views > 10)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)

  const allCategories = ["All", ...categories.map((cat) => cat.name), "Uncategorized"]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading blogs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">NCIT College Blogs</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Stay updated with the latest news, insights, and stories from our NCIT community.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    variant={category === selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBlogs.length} of {blogs.length} published blog posts
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
              </p>
            </div>

            {/* Blog Grid */}
            {filteredBlogs.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">No blogs found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCategory !== "All"
                      ? "Try adjusting your search or filter criteria."
                      : "No published blogs available yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredBlogs.map((blog) => (
                  <Card
                    key={blog.id}
                    className="hover:shadow-lg transition-all duration-300 h-full flex flex-col group"
                  >
                    <CardHeader className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {blog.category && (
                            <Badge variant="secondary" style={{ backgroundColor: blog.category.color + "20" }}>
                              {blog.category.name}
                            </Badge>
                          )}
                          {blog.views > 10 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2 group-hover:text-primary">
                        <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                      <CardDescription className="mb-4 line-clamp-3 flex-grow">
                        {blog.excerpt || "No excerpt available"}
                      </CardDescription>

                      {/* Tags */}
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{blog.tags.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {/* Author Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={blog.author?.avatar_url || undefined} />
                            <AvatarFallback>
                              {blog.author?.full_name
                                ? blog.author.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {blog.author?.full_name || "Unknown Author"}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(blog.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleToggleLike(blog.id)}
                            disabled={!user}
                            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                              likedPosts.includes(blog.id) ? "text-red-500" : ""
                            } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <Heart className={`h-4 w-4 ${likedPosts.includes(blog.id) ? "fill-current" : ""}`} />
                            <span>{blog.likes}</span>
                          </button>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>0</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{blog.views}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleBookmark(blog.id)}
                          className={`hover:text-blue-500 transition-colors ${
                            bookmarkedPosts.includes(blog.id) ? "text-blue-500" : ""
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${bookmarkedPosts.includes(blog.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Trending Posts */}
              {trendingBlogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                      Popular Posts
                    </CardTitle>
                    <CardDescription>Most viewed posts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trendingBlogs.map((blog) => (
                      <div key={blog.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <Link href={`/blogs/${blog.id}`} className="group">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                            {blog.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{blog.author?.full_name || "Unknown"}</span>
                            <div className="flex items-center space-x-2">
                              <User className="h-3 w-3" />
                              <span>{blog.views}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Browse by topic</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allCategories.slice(1).map((category) => {
                      const count = blogs.filter((blog) => {
                        if (category === "Uncategorized") return !blog.category
                        return blog.category?.name === category
                      }).length
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between ${
                            selectedCategory === category ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          <span>{category}</span>
                          <span className="text-xs opacity-70">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card>
                <CardHeader>
                  <CardTitle>Community</CardTitle>
                  <CardDescription>Managed by Nepal Tech Community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This platform is proudly managed by the Nepal Tech Community, fostering innovation and knowledge
                    sharing in Nepal's tech ecosystem.
                  </p>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/about">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
