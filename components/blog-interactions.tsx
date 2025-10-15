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
import { Share2, BookmarkPlus, MessageSquare, Heart, Info } from "lucide-react"
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
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [commentCount, setCommentCount] = useState(0)
  const [isLoadingLike, setIsLoadingLike] = useState(true)

  // Load initial like state
  useEffect(() => {
    if (user?.id) {
      loadLikeState()
    } else {
      setIsLoadingLike(false)
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

  const loadLikeState = async () => {
    if (!user?.id) return

    const { isLiked: liked } = await hasUserLikedBlog(blogId, user.id)
    setIsLiked(liked)
    setIsLoadingLike(false)
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

  const handleShare = async (platform: string) => {
    const shareUrl = `${window.location.origin}${blogUrl}`
    const shareText = `Check out this blog: ${blogTitle}`

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    }

    if (platform === "copy") {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "Blog link copied to clipboard",
      })
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
          {/* Bookmark Button (placeholder) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Coming soon!",
                description: "Bookmarking feature will be available soon",
              })
            }}
          >
            <BookmarkPlus className="h-4 w-4" />
          </Button>

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
                    value={`${window.location.origin}${blogUrl}`}
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
