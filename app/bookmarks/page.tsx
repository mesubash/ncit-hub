"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { getUserBookmarkedBlogs, toggleBookmark } from "@/lib/bookmarks"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Blog } from "@/lib/blog"
import Link from "next/link"
import { ArrowLeft, Bookmark, Calendar, Heart, MessageCircle, User, Loader2, BookmarkX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const isDev = process.env.NODE_ENV !== "production"
const devError = (...args: any[]) => { if (isDev) console.error(...args) }

export default function BookmarksPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadBookmarks()
    }
  }, [user])

  const loadBookmarks = async () => {
    if (!user) return

    try {
      const { blogs: bookmarkedBlogs, error } = await getUserBookmarkedBlogs(user.id)
      if (error) {
        devError("Failed to load bookmarks:", error)
        toast({
          title: "Error",
          description: "Failed to load bookmarks",
          variant: "destructive",
        })
      } else {
        setBlogs(bookmarkedBlogs)
      }
    } catch (error) {
      devError("Failed to load bookmarks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBookmark = async (blogId: string) => {
    if (!user) return

    setRemovingId(blogId)
    try {
      const { error } = await toggleBookmark(blogId, user.id)
      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove bookmark",
          variant: "destructive",
        })
      } else {
        setBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
        toast({
          title: "Success",
          description: "Bookmark removed",
        })
      }
    } catch (error) {
      devError("Failed to remove bookmark:", error)
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/blogs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Link>
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">My Bookmarks</h1>
            </div>
            <p className="text-muted-foreground">
              {blogs.length} {blogs.length === 1 ? "blog" : "blogs"} saved for later
            </p>
          </div>

          {/* Bookmarked Blogs */}
          {blogs.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <BookmarkX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start bookmarking blogs you want to read later
                </p>
                <Button asChild>
                  <Link href="/blogs">Browse Blogs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="hover:shadow-lg transition-all duration-300 h-full flex flex-col group"
                >
                  <CardHeader className="flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {blog.category && (
                          <Badge
                            variant="secondary"
                            style={{ backgroundColor: blog.category.color + "20" }}
                          >
                            {blog.category.name}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          <Bookmark className="h-3 w-3 mr-1" />
                          Bookmarked
                        </Badge>
                      </div>
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
                          <span className="text-xs text-muted-foreground">
                            +{blog.tags.length - 3} more
                          </span>
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
                            {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Stats & Actions */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{blog.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>0</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{blog.views}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveBookmark(blog.id)}
                        disabled={removingId === blog.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {removingId === blog.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <BookmarkX className="h-4 w-4 mr-1" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
