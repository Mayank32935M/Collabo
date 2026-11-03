import { NextResponse } from "next/server";
import { getBoardStorageAdapter } from "@collabo/database";
import {
  BoardApiResponse,
  CreateBoardPayload,
} from "@collabo/shared";

/**
 * POST /api/boards
 * Creates or initializes a new board room using the injected storage adapter.
 */
export async function POST(
  request: Request
): Promise<NextResponse<BoardApiResponse>> {
  try {
    let payload: CreateBoardPayload = {};
    try {
      payload = await request.json();
    } catch {
      // Empty body is acceptable; adapter generates a random roomId if omitted
    }

    const adapter = getBoardStorageAdapter();
    const result = await adapter.createBoard(
      payload.roomId,
      payload.title,
      payload.elements
    );

    return NextResponse.json(
      {
        success: true,
        board: result.board,
        storageSource: result.storageSource,
      },
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
