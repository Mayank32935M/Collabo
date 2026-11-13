import { NextResponse } from "next/server";
import { getAIProvider, MindMapRequestSchema } from "@collabo/ai";
import { MindMapResponse } from "@collabo/shared";

export interface MindMapApiResponse {
  success: boolean;
  mindMap?: MindMapResponse;
  error?: string;
}

/**
 * POST /api/ai/mind-map
 * Generates an algorithmic, non-overlapping concept tree from a topic prompt.
 */
export async function POST(
  request: Request
): Promise<NextResponse<MindMapApiResponse>> {
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

    const parseResult = MindMapRequestSchema.safeParse(body);
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
    const mindMap = await provider.generateMindMap(parseResult.data);

    return NextResponse.json({
      success: true,
      mindMap,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/ai/mind-map:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
