import { BoardRecord } from "@collabo/shared";

/**
 * In-memory fallback repository for local offline development
 * and testing when Supabase credentials have not yet been provided.
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
      id: existing?.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`),
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

  clear: (): void => {
    memoryBoardStore.clear();
  },
};

