import { CanvasElement } from "./canvas";

/**
 * PostgreSQL boards table record representation
 */
export interface BoardRecord {
  id: string;
  room_id: string;
  title: string;
  elements: CanvasElement[];
  created_at: string;
  updated_at: string;
}

/**
 * Storage backend source indicator
 */
export type StorageSource = "supabase" | "memory-fallback";

/**
 * API Response contract for /api/boards routes
 */
export interface BoardApiResponse {
  success: boolean;
  board?: BoardRecord;
  error?: string;
  storageSource: StorageSource;
}

/**
 * Payload sent to PUT /api/boards/[id]
 */
export interface SaveBoardPayload {
  title?: string;
  elements: CanvasElement[];
}

/**
 * Payload sent to POST /api/boards
 */
export interface CreateBoardPayload {
  roomId?: string;
  title?: string;
  elements?: CanvasElement[];
}

