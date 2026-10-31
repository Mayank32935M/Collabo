import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, memoryStore } from "@/lib/supabase";
import {
  BoardApiResponse,
  BoardRecord,
  CreateBoardPayload,
} from "@/types/database";

/**
 * POST /api/boards
 * Creates or initializes a new board room.
 */
export async function POST(
  request: Request
): Promise<NextResponse<BoardApiResponse>> {
  try {
    let payload: CreateBoardPayload = {};
    try {
      payload = await request.json();
    } catch {
      // Empty body is acceptable; we generate a random room id
    }

    const roomId =
      payload.roomId?.trim() ||
      `room-${Math.random().toString(36).substring(2, 9)}`;
    const title = payload.title?.trim() || `${roomId} Board`;
    const elements = Array.isArray(payload.elements) ? payload.elements : [];

    // 1. Persist to Supabase PostgreSQL if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("boards")
        .upsert(
          {
            room_id: roomId,
            title,
            elements,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "room_id" }
        )
        .select()
        .single();

      if (error) {
        console.error("[Supabase Error] POST /api/boards:", error);
        return NextResponse.json(
          { success: false, error: error.message, storageSource: "supabase" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          board: data as BoardRecord,
          storageSource: "supabase",
        },
        { status: 201 }
      );
    }

    // 2. In-memory development fallback
    const board = memoryStore.upsertBoard(roomId, title, elements);
    return NextResponse.json(
      { success: true, board, storageSource: "memory-fallback" },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/boards:", err);
    return NextResponse.json(
      {
        success: false,
        error: message,
        storageSource: "memory-fallback",
      },
      { status: 500 }
    );
  }
}

