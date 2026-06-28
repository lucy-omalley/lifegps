import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, isSupabaseConfigured } from "@/lib/supabase/config";

export { getSupabaseAnonKey, isSupabaseConfigured } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey()!
  );
}
