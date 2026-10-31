import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, memoryStore } from "@/lib/supabase";
import {
  BoardApiResponse,
  BoardRecord,
  SaveBoardPayload,
} from "@/types/database";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/boards/[id]
 * Retrieves a board document by its room_id.
 * If the board doesn't exist yet, returns a clean default board template.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<BoardApiResponse>> {
  try {
    const { id: roomId } = await params;

    if (!roomId || typeof roomId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing board room ID",
          storageSource: "memory-fallback",
        },
        { status: 400 }
      );
    }

    // 1. Fetch from Supabase PostgreSQL if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();

      if (error) {
        console.error("[Supabase Error] GET /api/boards/[id]:", error);
        return NextResponse.json(
          { success: false, error: error.message, storageSource: "supabase" },
          { status: 500 }
        );
      }

      if (data) {
        return NextResponse.json({
          success: true,
          board: data as BoardRecord,
          storageSource: "supabase",
        });
      }

      // If board record not found in DB, return clean default template
      const defaultBoard: BoardRecord = {
        id: "",
        room_id: roomId,
        title: `${roomId} Board`,
        elements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        board: defaultBoard,
        storageSource: "supabase",
      });
    }

    // 2. In-memory development fallback (when Supabase credentials are not provided)
    const existing = memoryStore.getBoard(roomId);
    const board: BoardRecord = existing || {
      id: "local-dev-id",
      room_id: roomId,
      title: `${roomId} Board`,
      elements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      board,
      storageSource: "memory-fallback",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] GET /api/boards/[id]:", err);
    return NextResponse.json(
      { success: false, error: message, storageSource: "memory-fallback" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/boards/[id]
 * Upserts a board's elements and metadata in PostgreSQL (or in-memory fallback).
 */
export async function PUT(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<BoardApiResponse>> {
  try {
    const { id: roomId } = await params;

    if (!roomId || typeof roomId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing board room ID",
          storageSource: "memory-fallback",
        },
        { status: 400 }
      );
    }

    let payload: SaveBoardPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Malformed JSON body in request",
          storageSource: "memory-fallback",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(payload.elements)) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload must contain an 'elements' array",
          storageSource: "memory-fallback",
        },
        { status: 400 }
      );
    }

    const title = payload.title || `${roomId} Board`;
    const elements = payload.elements;

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
        console.error("[Supabase Error] PUT /api/boards/[id]:", error);
        return NextResponse.json(
          { success: false, error: error.message, storageSource: "supabase" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        board: data as BoardRecord,
        storageSource: "supabase",
      });
    }

    // 2. In-memory development fallback
    const board = memoryStore.upsertBoard(roomId, title, elements);

    return NextResponse.json({
      success: true,
      board,
      storageSource: "memory-fallback",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] PUT /api/boards/[id]:", err);
    return NextResponse.json(
      { success: false, error: message, storageSource: "memory-fallback" },
      { status: 500 }
    );
  }
}

