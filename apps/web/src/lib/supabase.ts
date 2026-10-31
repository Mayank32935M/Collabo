import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BoardRecord } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
 * Supabase client instance (null when not configured yet)
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

/**
 * In-memory fallback repository for local offline development
 * and testing when Supabase credentials have not yet been provided in .env.local.
 */
const memoryBoardStore = new Map<string, BoardRecord>();

export const memoryStore = {
  getBoard: (roomId: string): BoardRecord | null => {
    return memoryBoardStore.get(roomId) || null;
  },
  upsertBoard: (
    roomId: string,
    title: string,
    elements: BoardRecord["elements"]
  ): BoardRecord => {
    const existing = memoryBoardStore.get(roomId);
    const now = new Date().toISOString();
    const record: BoardRecord = {
      id: existing?.id || crypto.randomUUID(),
      room_id: roomId,
      title: title || existing?.title || `${roomId} Board`,
      elements: elements || [],
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    memoryBoardStore.set(roomId, record);
    return record;
  },
  hasBoard: (roomId: string): boolean => {
    return memoryBoardStore.has(roomId);
  },
};

