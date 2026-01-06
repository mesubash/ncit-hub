import type { User } from "./auth";
import { profileToUser } from "./auth";

// Server-side get current user
export async function getCurrentUserServer(): Promise<User | null> {
  const { createClient: createServerClient } = await import(
    "@/lib/supabase/server"
  );
  const supabase = await createServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile || !profile.email_verified) {
    return null;
  }

  return profileToUser(profile);
}
