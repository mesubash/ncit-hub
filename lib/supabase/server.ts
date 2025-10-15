import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const defaultConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
};

export async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...defaultConfig,
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? "";
        },
        set(name: string, value: string) {
          try {
            cookieStore.set({
              name,
              value,
              path: "/",
              sameSite: "lax",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string) {
          try {
            cookieStore.set({
              name,
              value: "",
              path: "/",
              expires: new Date(0),
            });
          } catch {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
