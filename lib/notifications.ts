import { createClient } from "@/lib/supabase/client";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";

export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];

export type NotificationType =
  | "blog_comment"
  | "blog_like"
  | "event_reminder"
  | "registration_confirmation"
  | "blog_published"
  | "blog_approved"
  | "blog_rejected"
  | "blog_submitted";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// Get all notifications for a user
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<{ notifications: Notification[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { notifications: [], error: error.message };
  }

  return { notifications: data as Notification[], error: null };
}

// Get unread notification count
export async function getUnreadCount(
  userId: string
): Promise<{ count: number; error: string | null }> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count || 0, error: null };
}

// Mark notification as read
export async function markAsRead(
  notificationId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Mark all notifications as read
export async function markAllAsRead(
  userId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Delete notification
export async function deleteNotification(
  notificationId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Delete all notifications for a user
export async function deleteAllNotifications(
  userId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Create notification (uses API route to bypass RLS)
export async function createNotification(data: {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<{ notification: Notification | null; error: string | null }> {
  console.log("🔔 [CREATE NOTIFICATION] Starting...", data);

  try {
    // Call API route instead of direct Supabase insert
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ [CREATE NOTIFICATION] API Error:", errorData);
      return {
        notification: null,
        error: errorData.error || "Failed to create notification",
      };
    }

    const result = await response.json();
    console.log("✅ [CREATE NOTIFICATION] Success:", result.notification);
    return { notification: result.notification as Notification, error: null };
  } catch (error) {
    console.error("❌ [CREATE NOTIFICATION] Unexpected error:", error);
    return { notification: null, error: "Failed to create notification" };
  }
}

// Helper function to create blog approval notification
export async function notifyBlogApproved(
  userId: string,
  blogTitle: string,
  blogId: string
): Promise<{ error: string | null }> {
  return (
    await createNotification({
      user_id: userId,
      type: "blog_approved",
      title: "🎉 Blog Approved!",
      message: `Your blog "${blogTitle}" has been approved and is now published.`,
      link: `/blogs/${blogId}`,
    })
  ).error
    ? { error: "Failed to create notification" }
    : { error: null };
}

// Helper function to notify admin when new blog is submitted for review
export async function notifyAdminBlogSubmitted(
  blogTitle: string,
  authorName: string,
  blogId: string
): Promise<{ error: string | null }> {
  console.log("👨‍💼 [NOTIFY ADMIN] Starting...");
  console.log("👨‍💼 [NOTIFY ADMIN] Blog:", blogTitle);
  console.log("👨‍💼 [NOTIFY ADMIN] Author:", authorName);

  // Use regular client (authenticated user can query profiles and create notifications)
  const supabase = createClient();

  // Get all admin users
  console.log("👨‍💼 [NOTIFY ADMIN] Fetching admin users...");
  const { data: admins, error: adminError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  console.log("👨‍💼 [NOTIFY ADMIN] Admins found:", admins?.length || 0);
  console.log(
    "👨‍💼 [NOTIFY ADMIN] Admin IDs:",
    admins?.map((a) => a.id)
  );

  if (adminError) {
    console.error("❌ [NOTIFY ADMIN] Error fetching admins:", adminError);
    return { error: "Error fetching admin users" };
  }

  if (!admins || admins.length === 0) {
    console.error("❌ [NOTIFY ADMIN] No admin users found");
    return { error: "No admin users found" };
  }

  // Create notification for each admin
  console.log(
    "👨‍💼 [NOTIFY ADMIN] Creating notifications for",
    admins.length,
    "admin(s)"
  );
  const promises = admins.map((admin) => {
    console.log("👨‍💼 [NOTIFY ADMIN] Creating notification for admin:", admin.id);
    return createNotification({
      user_id: admin.id,
      type: "blog_submitted",
      title: "📝 New Blog Submitted",
      message: `${authorName} submitted a new blog "${blogTitle}" for review.`,
      link: `/admin/review`,
    });
  });

  const results = await Promise.all(promises);
  const hasError = results.some((result) => result.error);

  if (hasError) {
    console.error("❌ [NOTIFY ADMIN] Some notifications failed");
    console.error("❌ [NOTIFY ADMIN] Results:", results);
  } else {
    console.log(
      "✅ [NOTIFY ADMIN] All admin notifications created successfully!"
    );
  }

  return hasError ? { error: "Failed to notify some admins" } : { error: null };
}

// Helper function to create blog rejection notification
export async function notifyBlogRejected(
  userId: string,
  blogTitle: string,
  blogId: string,
  reason?: string
): Promise<{ error: string | null }> {
  const message = reason
    ? `Your blog "${blogTitle}" was not approved. Reason: ${reason}`
    : `Your blog "${blogTitle}" was not approved. Please review and resubmit.`;

  return (
    await createNotification({
      user_id: userId,
      type: "blog_rejected",
      title: "📝 Blog Needs Revision",
      message,
      link: `/edit-blog/${blogId}`,
    })
  ).error
    ? { error: "Failed to create notification" }
    : { error: null };
}

// Helper function to create event registration confirmation
export async function notifyEventRegistration(
  userId: string,
  eventTitle: string,
  eventId: string,
  eventDate: string
): Promise<{ error: string | null }> {
  const date = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    await createNotification({
      user_id: userId,
      type: "registration_confirmation",
      title: "✅ Event Registration Confirmed",
      message: `You're registered for "${eventTitle}" on ${date}`,
      link: `/events/${eventId}`,
    })
  ).error
    ? { error: "Failed to create notification" }
    : { error: null };
}

// Helper function to create event reminder
export async function notifyEventReminder(
  userId: string,
  eventTitle: string,
  eventId: string,
  hoursUntil: number
): Promise<{ error: string | null }> {
  const timeText =
    hoursUntil < 24
      ? `in ${hoursUntil} hours`
      : `in ${Math.floor(hoursUntil / 24)} days`;

  return (
    await createNotification({
      user_id: userId,
      type: "event_reminder",
      title: "⏰ Event Reminder",
      message: `"${eventTitle}" is coming up ${timeText}!`,
      link: `/events/${eventId}`,
    })
  ).error
    ? { error: "Failed to create notification" }
    : { error: null };
}

// Subscribe to real-time notifications
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
