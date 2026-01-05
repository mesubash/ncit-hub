import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    const redirectUrl = new URL("/api/auth/callback", appUrl);

    // Construct the Supabase OAuth URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const clientId = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !clientId) {
      return NextResponse.json(
        { error: "OAuth configuration missing" },
        { status: 500 }
      );
    }

    const oauthUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
    oauthUrl.searchParams.set("provider", "google");
    oauthUrl.searchParams.set("client_id", clientId);
    oauthUrl.searchParams.set("redirect_to", redirectUrl.toString());
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", "openid profile email");

    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.json(
      { error: "OAuth configuration error" },
      { status: 500 }
    );
  }
}
