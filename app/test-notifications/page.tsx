"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { createNotification, getUserNotifications, type Notification } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"
import { Bell, Send, RefreshCw } from "lucide-react"

export default function TestNotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [title, setTitle] = useState("Test Notification")
  const [message, setMessage] = useState("This is a test notification")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateNotification = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await createNotification({
        user_id: user.id,
        type: "blog_submitted",
        title: title,
        message: message,
        link: "/test",
      })

      if (result.error) {
        toast({
          title: "❌ Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Success",
          description: "Notification created successfully!",
        })
        loadNotifications()
      }
    } catch (error) {
      console.error("Error creating notification:", error)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to create notification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!user) return

    const { notifications: data, error } = await getUserNotifications(user.id, 10)
    if (!error) {
      setNotifications(data)
      toast({
        title: "✅ Loaded",
        description: `Found ${data.length} notifications`,
      })
    } else {
      toast({
        title: "❌ Error",
        description: error,
        variant: "destructive",
      })
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Test Notifications
          </h1>

          <div className="grid gap-6">
            {/* Create Notification */}
            <Card>
              <CardHeader>
                <CardTitle>Create Test Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateNotification} disabled={isLoading}>
                    <Send className="mr-2 h-4 w-4" />
                    Create Notification
                  </Button>

                  <Button variant="outline" onClick={loadNotifications}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Load Notifications
                  </Button>
                </div>

                {user && (
                  <div className="text-sm text-muted-foreground">
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Display Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Your Notifications ({notifications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground">No notifications yet. Create one above!</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Type: {notification.type}</span>
                              <span>Read: {notification.is_read ? "Yes" : "No"}</span>
                              <span>{new Date(notification.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle>Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>1.</strong> Click "Create Notification" to create a test notification</p>
                <p><strong>2.</strong> Click "Load Notifications" to fetch your notifications</p>
                <p><strong>3.</strong> Check the bell icon in the navigation - it should show a badge</p>
                <p><strong>4.</strong> Click the bell to see the dropdown</p>
                <p><strong>5.</strong> Go to <a href="/notifications" className="text-blue-600 underline">/notifications</a> to see the full page</p>
                <p className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <strong>⚠️ Important:</strong> If notifications don't appear, you need to run the setup SQL script in Supabase:
                  <br />
                  <code className="block mt-2 p-2 bg-white dark:bg-black rounded text-xs">
                    supabase/setup_notifications.sql
                  </code>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
