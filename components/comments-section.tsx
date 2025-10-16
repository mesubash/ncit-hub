"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LikeButton } from "@/components/like-button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  type Comment,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  subscribeToComments,
  subscribeToCommentLikes,
} from "@/lib/comments"
import {
  MessageSquare,
  Reply,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface CommentsProps {
  blogId: string
}

export function Comments({ blogId }: CommentsProps) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  // Load comments
  useEffect(() => {
    loadComments()
  }, [blogId, user?.id])

  // Subscribe to real-time updates
  useEffect(() => {
    const commentsChannel = subscribeToComments(blogId, (payload) => {
      console.log("Comment update:", payload)
      loadComments()
    })

    const likesChannel = subscribeToCommentLikes((payload) => {
      console.log("Comment like update:", payload)
      loadComments()
    })

    return () => {
      commentsChannel.unsubscribe()
      likesChannel.unsubscribe()
    }
  }, [blogId, user?.id])

  const loadComments = async () => {
    const { comments: fetchedComments, error } = await getComments(blogId, user?.id)
    if (error) {
      console.error("Error loading comments:", error)
    } else {
      setComments(fetchedComments)
      setCommentCount(countAllComments(fetchedComments))
    }
    setIsLoading(false)
  }

  const countAllComments = (comments: Comment[]): number => {
    let count = comments.length
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        count += countAllComments(comment.replies)
      }
    })
    return count
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const { comment, error } = await createComment(blogId, newComment, user.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } else {
      setNewComment("")
      toast({
        title: "Success",
        description: "Comment posted successfully",
      })
      loadComments()
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({commentCount})
            </h3>
          </div>

          {/* New Comment Form */}
          {isAuthenticated ? (
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                Please{" "}
                <Link href="/login" className="font-semibold hover:underline">
                  log in
                </Link>{" "}
                or{" "}
                <Link href="/register" className="font-semibold hover:underline">
                  create an account
                </Link>{" "}
                to leave a comment
              </AlertDescription>
            </Alert>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  blogId={blogId}
                  onUpdate={loadComments}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CommentItemProps {
  comment: Comment
  blogId: string
  onUpdate: () => void
  depth?: number
}

function CommentItem({ comment, blogId, onUpdate, depth = 0 }: CommentItemProps) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [editContent, setEditContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAuthor = user?.id === comment.author_id
  const maxDepth = 3 // Maximum nesting level

  const handleReply = async () => {
    if (!replyContent.trim() || !user?.id) return

    setIsSubmitting(true)
    const { error } = await createComment(blogId, replyContent, user.id, comment.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    } else {
      setReplyContent("")
      setIsReplying(false)
      toast({
        title: "Success",
        description: "Reply posted successfully",
      })
      onUpdate()
    }
    setIsSubmitting(false)
  }

  const handleEdit = async () => {
    if (!editContent.trim() || !user?.id) return

    setIsSubmitting(true)
    const { error } = await updateComment(comment.id, editContent, user.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      })
    } else {
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Comment updated successfully",
      })
      onUpdate()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!user?.id) return

    const { error } = await deleteComment(comment.id, user.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
      onUpdate()
    }
    setShowDeleteDialog(false)
  }

  const handleLike = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to like comments",
        variant: "destructive",
      })
      return
    }
    await likeComment(comment.id, user.id)
    onUpdate()
  }

  const handleUnlike = async () => {
    if (!user?.id) return
    await unlikeComment(comment.id, user.id)
    onUpdate()
  }

  return (
    <div className={depth > 0 ? "ml-8 mt-4" : ""}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author?.avatar_url || undefined} />
          <AvatarFallback>
            {comment.author?.full_name?.[0] || comment.author?.email[0] || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {comment.author?.full_name || comment.author?.email}
            </span>
            {comment.author?.role === "admin" && (
              <Badge variant="destructive" className="text-xs">
                Admin
              </Badge>
            )}
            {comment.author?.role === "faculty" && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Faculty
              </Badge>
            )}
            {comment.author?.role === "student" && (
              <Badge variant="outline" className="text-xs">
                Student
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={isSubmitting}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Like Button */}
              {isAuthenticated && (
                <LikeButton
                  isLiked={comment.is_liked || false}
                  likesCount={comment.likes_count}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  size="sm"
                  showCount={true}
                />
              )}

              {/* Reply Button */}
              {isAuthenticated && depth < maxDepth && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              {/* Edit Button */}
              {isAuthor && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}

              {/* Delete Button */}
              {isAuthor && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="space-y-2 mt-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    "Reply"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent("")
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  blogId={blogId}
                  onUpdate={onUpdate}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
