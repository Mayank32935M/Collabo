import { NextResponse } from "next/server";
import { getBoardStorageAdapter } from "@collabo/database";
import {
  BoardApiResponse,
  SaveBoardPayload,
} from "@collabo/shared";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/boards/[id]
 * Retrieves a board document by its room_id using the injected storage adapter.
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

    const adapter = getBoardStorageAdapter();
    const result = await adapter.getBoard(roomId);

    return NextResponse.json({
      success: true,
      board: result.board,
      storageSource: result.storageSource,
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
 * Upserts a board's elements and metadata using the injected storage adapter.
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

    const adapter = getBoardStorageAdapter();
    const result = await adapter.saveBoard(roomId, title, elements);

    return NextResponse.json({
      success: true,
      board: result.board,
      storageSource: result.storageSource,
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
