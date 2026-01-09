import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  return createSupabaseClient(url, key);
}
