import {
  BoardRecord,
  CanvasElement,
  StorageSource,
} from "@collabo/shared";
import { supabase, isSupabaseConfigured } from "./client";
import { memoryStore } from "./memory-store";

export interface BoardStorageResult {
  board: BoardRecord;
  storageSource: StorageSource;
}

export interface BoardStorageAdapter {
  getBoard(roomId: string): Promise<BoardStorageResult>;
  saveBoard(
    roomId: string,
    title: string,
    elements: CanvasElement[]
  ): Promise<BoardStorageResult>;
  createBoard(
    roomId?: string,
    title?: string,
    elements?: CanvasElement[]
  ): Promise<BoardStorageResult>;
}

/**
 * Creates a clean default in-memory template for an uninitialized board.
 */
function createDefaultBoard(roomId: string, title?: string): BoardRecord {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
    room_id: roomId,
    title: title || `${roomId} Board`,
    elements: [],
    created_at: now,
    updated_at: now,
  };
}

/**
 * Supabase PostgreSQL Board Storage Adapter.
 */
export class SupabaseBoardAdapter implements BoardStorageAdapter {
  async getBoard(roomId: string): Promise<BoardStorageResult> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized");
    }

    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    if (error) {
      throw new Error(`[Supabase Error] getBoard: ${error.message}`);
    }

    if (data) {
      return {
        board: data as BoardRecord,
        storageSource: "supabase",
      };
    }

    // Unsaved board defaults to clean template
    return {
      board: createDefaultBoard(roomId),
      storageSource: "supabase",
    };
  }

  async saveBoard(
    roomId: string,
    title: string,
    elements: CanvasElement[]
  ): Promise<BoardStorageResult> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized");
    }

    const { data, error } = await supabase
      .from("boards")
      .upsert(
        {
          room_id: roomId,
          title: title || `${roomId} Board`,
          elements,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "room_id" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`[Supabase Error] saveBoard: ${error.message}`);
    }

    return {
      board: data as BoardRecord,
      storageSource: "supabase",
    };
  }

  async createBoard(
    roomId?: string,
    title?: string,
    elements: CanvasElement[] = []
  ): Promise<BoardStorageResult> {
    const finalRoomId =
      roomId?.trim() ||
      `room-${Math.random().toString(36).substring(2, 9)}`;
    const finalTitle = title?.trim() || `${finalRoomId} Board`;

    return this.saveBoard(finalRoomId, finalTitle, elements);
  }
}

/**
 * In-Memory Development & Offline Board Storage Adapter.
 */
export class MemoryBoardAdapter implements BoardStorageAdapter {
  async getBoard(roomId: string): Promise<BoardStorageResult> {
    const existing = memoryStore.getBoard(roomId);
    const board = existing || createDefaultBoard(roomId);
    return {
      board,
      storageSource: "memory-fallback",
    };
  }

  async saveBoard(
    roomId: string,
    title: string,
    elements: CanvasElement[]
  ): Promise<BoardStorageResult> {
    const board = memoryStore.upsertBoard(roomId, title, elements);
    return {
      board,
      storageSource: "memory-fallback",
    };
  }

  async createBoard(
    roomId?: string,
    title?: string,
    elements: CanvasElement[] = []
  ): Promise<BoardStorageResult> {
    const finalRoomId =
      roomId?.trim() ||
      `room-${Math.random().toString(36).substring(2, 9)}`;
    const finalTitle = title?.trim() || `${finalRoomId} Board`;
    const board = memoryStore.upsertBoard(finalRoomId, finalTitle, elements);
    return {
      board,
      storageSource: "memory-fallback",
    };
  }
}

/**
 * Hybrid Board Storage Adapter.
 * Uses Supabase when available and configured; gracefully falls back to MemoryStore on error or when offline.
 */
export class HybridBoardAdapter implements BoardStorageAdapter {
  private supabaseAdapter = new SupabaseBoardAdapter();
  private memoryAdapter = new MemoryBoardAdapter();

  async getBoard(roomId: string): Promise<BoardStorageResult> {
    if (isSupabaseConfigured && supabase) {
      try {
        return await this.supabaseAdapter.getBoard(roomId);
      } catch (err) {
        console.warn("[HybridBoardAdapter] Supabase getBoard failed, falling back to memory:", err);
      }
    }
    return this.memoryAdapter.getBoard(roomId);
  }

  async saveBoard(
    roomId: string,
    title: string,
    elements: CanvasElement[]
  ): Promise<BoardStorageResult> {
    if (isSupabaseConfigured && supabase) {
      try {
        return await this.supabaseAdapter.saveBoard(roomId, title, elements);
      } catch (err) {
        console.warn("[HybridBoardAdapter] Supabase saveBoard failed, falling back to memory:", err);
      }
    }
    return this.memoryAdapter.saveBoard(roomId, title, elements);
  }

  async createBoard(
    roomId?: string,
    title?: string,
    elements: CanvasElement[] = []
  ): Promise<BoardStorageResult> {
    if (isSupabaseConfigured && supabase) {
      try {
        return await this.supabaseAdapter.createBoard(roomId, title, elements);
      } catch (err) {
        console.warn("[HybridBoardAdapter] Supabase createBoard failed, falling back to memory:", err);
      }
    }
    return this.memoryAdapter.createBoard(roomId, title, elements);
  }
}

let defaultAdapterInstance: BoardStorageAdapter | null = null;

/**
 * Returns the default injectable BoardStorageAdapter instance.
 */
export function getBoardStorageAdapter(): BoardStorageAdapter {
  if (!defaultAdapterInstance) {
    defaultAdapterInstance = new HybridBoardAdapter();
  }
  return defaultAdapterInstance;
}

