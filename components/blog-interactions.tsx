"use client"

import { useState, useEffect } from "react"
import { Comments } from "@/components/comments-section"
import { LikeButton } from "@/components/like-button"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  likeBlog,
  unlikeBlog,
  hasUserLikedBlog,
  getBlogLikesCount,
  subscribeToBlogLikes,
} from "@/lib/comments"
import { getCommentCount } from "@/lib/comments"
import {
  bookmarkBlog,
  unbookmarkBlog,
  hasUserBookmarkedBlog,
  subscribeToBookmarks,
} from "@/lib/bookmarks"
import { Share2, BookmarkPlus, Bookmark, MessageSquare, Heart, Info } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface BlogInteractionsProps {
  blogId: string
  initialLikes: number
  blogTitle: string
  blogUrl: string
}

export function BlogInteractions({
  blogId,
  initialLikes,
  blogTitle,
  blogUrl,
}: BlogInteractionsProps) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [commentCount, setCommentCount] = useState(0)
  const [isLoadingLike, setIsLoadingLike] = useState(true)
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(true)
  const [shareUrl, setShareUrl] = useState("")

  // Set share URL on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}${blogUrl}`)
    }
  }, [blogUrl])

  // Load initial like state
  useEffect(() => {
    if (user?.id) {
      loadLikeState()
      loadBookmarkState()
    } else {
      setIsLoadingLike(false)
      setIsLoadingBookmark(false)
    }
  }, [user?.id, blogId])

  // Load comment count
  useEffect(() => {
    loadCommentCount()
  }, [blogId])

  // Subscribe to real-time like updates
  useEffect(() => {
    const channel = subscribeToBlogLikes(blogId, async () => {
      const { count } = await getBlogLikesCount(blogId)
      setLikesCount(count)
    })

    return () => {
      channel.unsubscribe()
    }
  }, [blogId])

  // Subscribe to real-time bookmark updates
  useEffect(() => {
    if (!user?.id) return

    const channel = subscribeToBookmarks(blogId, () => {
      loadBookmarkState()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [blogId, user?.id])

  const loadLikeState = async () => {
    if (!user?.id) return

    const { isLiked: liked } = await hasUserLikedBlog(blogId, user.id)
    setIsLiked(liked)
    setIsLoadingLike(false)
  }

  const loadBookmarkState = async () => {
    if (!user?.id) return

    const { isBookmarked: bookmarked } = await hasUserBookmarkedBlog(blogId, user.id)
    setIsBookmarked(bookmarked)
    setIsLoadingBookmark(false)
  }

  const loadCommentCount = async () => {
    const { count } = await getCommentCount(blogId)
    setCommentCount(count)
  }

  const handleLike = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to like this blog",
        variant: "destructive",
      })
      return
    }
    await likeBlog(blogId, user.id)
  }

  const handleUnlike = async () => {
    if (!user?.id) return
    await unlikeBlog(blogId, user.id)
  }

  const handleBookmark = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to bookmark this blog",
        variant: "destructive",
      })
      return
    }

    try {
      if (isBookmarked) {
        const { error } = await unbookmarkBlog(blogId, user.id)
        if (error) throw new Error(error)
        setIsBookmarked(false)
        toast({
          title: "Bookmark removed",
          description: "Blog removed from your bookmarks",
        })
      } else {
        const { error } = await bookmarkBlog(blogId, user.id)
        if (error) throw new Error(error)
        setIsBookmarked(true)
        toast({
          title: "Bookmarked!",
          description: "Blog saved to your bookmarks",
        })
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (platform: string) => {
    const shareText = `Check out this blog: ${blogTitle}`

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    }

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link copied!",
          description: "Blog link copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        })
      }
    } else if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="space-y-8">
      {/* Auth Alert for Non-logged Users */}
      {!isAuthenticated && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
            <Link href="/login" className="font-semibold hover:underline">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/register" className="font-semibold hover:underline">
              sign up
            </Link>{" "}
            to like this blog and leave comments
          </AlertDescription>
        </Alert>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 py-4">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          {isAuthenticated && !isLoadingLike && (
            <LikeButton
              isLiked={isLiked}
              likesCount={likesCount}
              onLike={handleLike}
              onUnlike={handleUnlike}
              size="md"
              showCount={true}
            />
          )}

          {!isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/20"
            >
              <Link href="/login">
                <Heart className="h-4 w-4 mr-2" />
                {likesCount > 0 && <span>{likesCount}</span>}
              </Link>
            </Button>
          )}

          {/* Comment Count */}
          <Button variant="outline" size="sm" disabled className="cursor-default">
            <MessageSquare className="h-4 w-4 mr-2" />
            {commentCount}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          {isAuthenticated && !isLoadingBookmark ? (
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
              className={isBookmarked ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              {isBookmarked ? (
                <>
                  <Bookmark className="h-4 w-4 fill-current" />
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : !isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950/20"
            >
              <Link href="/login">
                <BookmarkPlus className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}

          {/* Share Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share this blog</DialogTitle>
                <DialogDescription>
                  Share "{blogTitle}" with your network
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleShare("twitter")}
                    className="w-full"
                  >
                    <span className="mr-2">𝕏</span> Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare("facebook")}
                    className="w-full"
                  >
                    <span className="mr-2">📘</span> Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare("linkedin")}
                    className="w-full"
                  >
                    <span className="mr-2">💼</span> LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare("whatsapp")}
                    className="w-full"
                  >
                    <span className="mr-2">💬</span> WhatsApp
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={() => handleShare("copy")}>Copy</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      {/* Comments Section */}
      <Comments blogId={blogId} />
    </div>
  )
}
