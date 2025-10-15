import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { user_id, type, title, message, link } = body;

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS
    const serviceSupabase = createServiceClient();

    // Insert notification
    const { data: notification, error: insertError } = await serviceSupabase
      .from("notifications")
      .insert({
        user_id,
        type: type as NotificationType,
        title,
        message,
        link: link || null,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ [API] Failed to create notification:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("✅ [API] Notification created:", notification);
    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    console.error("❌ [API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
