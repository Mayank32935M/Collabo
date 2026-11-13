import { NextResponse } from "next/server";
import { getAIProvider, BoardQARequestSchema } from "@collabo/ai";
import { BoardQAResponse } from "@collabo/shared";

export interface BoardQAApiResponse {
  success: boolean;
  qa?: BoardQAResponse;
  error?: string;
}

/**
 * POST /api/ai/board-qa
 * Spatial reasoning and comprehension over active canvas elements.
 */
export async function POST(
  request: Request
): Promise<NextResponse<BoardQAApiResponse>> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parseResult = BoardQARequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const qa = await provider.answerBoardQuery(parseResult.data);

    return NextResponse.json({
      success: true,
      qa,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/ai/board-qa:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
