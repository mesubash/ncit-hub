"use client"

import { useEffect, useState } from "react"
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  type Notification,
} from "@/lib/notifications"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function NotificationDropdown() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotifications()
      loadUnreadCount()

      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      return unsubscribe
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    const { notifications: fetchedNotifications } = await getUserNotifications(user.id, 20)
    setNotifications(fetchedNotifications)
    setIsLoading(false)
  }

  const loadUnreadCount = async () => {
    if (!user) return

    const { count } = await getUnreadCount(user.id)
    setUnreadCount(count)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    if (notification.link) {
      setIsOpen(false)
      router.push(notification.link)
    }
  }

  const handleMarkAllRead = async () => {
    if (!user) return

    await markAllAsRead(user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    await deleteNotification(notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    
    // Update unread count if deleted notification was unread
    const deletedNotification = notifications.find((n) => n.id === notificationId)
    if (deletedNotification && !deletedNotification.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "blog_approved":
      case "blog_published":
        return "🎉"
      case "blog_rejected":
        return "📝"
      case "blog_submitted":
        return "📬"
      case "registration_confirmation":
        return "✅"
      case "event_reminder":
        return "⏰"
      case "blog_comment":
        return "💬"
      case "blog_like":
        return "❤️"
      default:
        return "📢"
    }
  }

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMs = now.getTime() - notificationDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return notificationDate.toLocaleDateString()
  }

  if (!user) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative group",
                    !notification.is_read && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(notification.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setIsOpen(false)
                  router.push("/notifications")
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
