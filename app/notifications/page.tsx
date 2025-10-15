"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeToNotifications,
  type Notification,
} from "@/lib/notifications"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Bell, Trash2, CheckCheck, Loader2, Inbox } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
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

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotifications()

      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev])
      })

      return unsubscribe
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    const { notifications: data, error } = await getUserNotifications(user.id, 100)

    if (!error) {
      setNotifications(data)
    }
    setIsLoading(false)
  }

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return

    await markAsRead(notification.id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    )

    if (notification.link) {
      router.push(notification.link)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    const { error } = await markAllAsRead(user.id)
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast({
        title: "✅ Success",
        description: "All notifications marked as read",
      })
    }
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    toast({
      title: "✅ Deleted",
      description: "Notification removed",
    })
  }

  const handleDeleteAll = async () => {
    if (!user) return

    setIsDeletingAll(true)
    const { error } = await deleteAllNotifications(user.id)
    if (!error) {
      setNotifications([])
      toast({
        title: "✅ Success",
        description: "All notifications deleted",
      })
    } else {
      toast({
        title: "❌ Error",
        description: "Failed to delete notifications",
        variant: "destructive",
      })
    }
    setIsDeletingAll(false)
    setShowDeleteAllDialog(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "blog_approved":
        return "🎉"
      case "blog_rejected":
        return "📝"
      case "blog_submitted":
        return "📬"
      case "blog_published":
        return "✅"
      case "registration_confirmation":
        return "✅"
      case "event_reminder":
        return "⏰"
      case "blog_comment":
        return "💬"
      case "blog_like":
        return "❤️"
      default:
        return "🔔"
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const notificationDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / 60000)

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return notificationDate.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read
    if (filter === "read") return n.is_read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                  <Bell className="h-8 w-8" />
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-muted-foreground mt-2">
                    You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    onClick={() => setShowDeleteAllDialog(true)}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete all
                  </Button>
                )}
              </div>
            </div>

            <Separator />
          </div>

          {/* Tabs Filter */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read">
                Read ({notifications.length - unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Notifications List */}
          {isLoading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {filter === "all"
                    ? "No notifications yet"
                    : filter === "unread"
                    ? "No unread notifications"
                    : "No read notifications"}
                </h3>
                <p className="text-muted-foreground">
                  {filter === "all"
                    ? "You'll see notifications here when you have them"
                    : filter === "unread"
                    ? "All caught up! 🎉"
                    : "You haven't read any notifications yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-all hover:shadow-md cursor-pointer",
                    !notification.is_read && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => handleMarkAsRead(notification)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            {notification.title}
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        {notification.link && (
                          <Badge variant="outline" className="text-xs">
                            Click to view
                          </Badge>
                        )}
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete All Confirmation Dialog */}
        <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete All Notifications?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all {notifications.length} notifications. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete All"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  )
}
