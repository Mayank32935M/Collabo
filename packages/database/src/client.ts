import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

/**
 * Checks whether Supabase environment variables have been set to a legitimate URL and key.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("your-project") &&
    supabaseUrl.startsWith("http")
);

/**
 * Supabase client instance (null when not configured yet).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

/**
 * Factory helper to get the active Supabase client or null if unconfigured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

