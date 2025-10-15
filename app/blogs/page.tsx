"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { getAllBlogs, getCategories, getUserLikedBlogs, toggleBlogLike, type Blog, type CategoryRow } from "@/lib/blog"
import { getCommentCount } from "@/lib/comments"
import { getUserBookmarkedBlogIds, toggleBookmark } from "@/lib/bookmarks"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Search, User, Calendar, ArrowLeft, Heart, MessageCircle, Bookmark, TrendingUp, Loader2, Plus } from "lucide-react"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([])
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [filterType, setFilterType] = useState<"all" | "bookmarked">("all")
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserLikes()
      loadUserBookmarks()
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
        // Load comment counts for all blogs
        loadCommentCounts(blogsResult.blogs)
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

  const loadCommentCounts = async (blogs: Blog[]) => {
    const counts: Record<string, number> = {}
    await Promise.all(
      blogs.map(async (blog) => {
        const { count } = await getCommentCount(blog.id)
        counts[blog.id] = count
      })
    )
    setCommentCounts(counts)
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

  const loadUserBookmarks = async () => {
    if (!user) return

    try {
      const { blogIds, error } = await getUserBookmarkedBlogIds(user.id)
      if (error) {
        console.error("Failed to load user bookmarks:", error)
      } else {
        setBookmarkedPosts(blogIds)
      }
    } catch (error) {
      console.error("Failed to load user bookmarks:", error)
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

  const handleToggleBookmark = async (blogId: string) => {
    if (!user) return

    try {
      const { error } = await toggleBookmark(blogId, user.id)
      if (error) {
        console.error("Failed to toggle bookmark:", error)
      } else {
        // Toggle bookmark in local state
        setBookmarkedPosts((prev) => 
          prev.includes(blogId) 
            ? prev.filter((id) => id !== blogId) 
            : [...prev, blogId]
        )
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
    }
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
    const matchesFilter = 
      filterType === "all" || 
      (filterType === "bookmarked" && bookmarkedPosts.includes(blog.id))
    return matchesSearch && matchesCategory && matchesFilter
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
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            {/* Role-specific action buttons */}
            {isAuthenticated && user ? (
              <div className="flex gap-2">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/create-blog">
                      <Plus className="h-4 w-4 mr-2" />
                      Write Your Blog
                    </Link>
                  </Button>
                )}
                
                {user.role === 'admin' && (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/create-blog">
                        <Plus className="h-4 w-4 mr-2" />
                        Write Blog
                      </Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                      <Link href="/admin/review">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Review Requests
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" className="border-2 border-primary/50">
                  <Link href="/login">
                    <User className="h-4 w-4 mr-2" />
                    Log in to Write Blog
                  </Link>
                </Button>
              </div>
            )}
          </div>
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
            {/* Filter Tabs */}
            {isAuthenticated && bookmarkedPosts.length > 0 && (
              <div className="mb-4 flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All Blogs
                </Button>
                <Button
                  variant={filterType === "bookmarked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("bookmarked")}
                  className="flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  Bookmarked ({bookmarkedPosts.length})
                </Button>
              </div>
            )}

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
                            title={!user ? "Please log in to like this blog" : ""}
                            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                              likedPosts.includes(blog.id) ? "text-red-500" : ""
                            } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <Heart className={`h-4 w-4 ${likedPosts.includes(blog.id) ? "fill-current" : ""}`} />
                            <span>{blog.likes}</span>
                          </button>
                          <div className="flex items-center space-x-1" title="Comments">
                            <MessageCircle className="h-4 w-4" />
                            <span>{commentCounts[blog.id] || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1" title="Views">
                            <User className="h-4 w-4" />
                            <span>{blog.views}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleBookmark(blog.id)}
                          disabled={!user}
                          title={!user ? "Please log in to bookmark this blog" : "Bookmark"}
                          className={`hover:text-blue-500 transition-colors ${
                            bookmarkedPosts.includes(blog.id) ? "text-blue-500" : ""
                          } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
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
