import { NextResponse } from "next/server";
import { getAIProvider, LectureRecapRequestSchema } from "@collabo/ai";
import { LectureRecapResponse } from "@collabo/shared";

export interface RecapApiResponse {
  success: boolean;
  recap?: LectureRecapResponse;
  error?: string;
}

/**
 * POST /api/ai/recap
 * Generates an executive lecture summary, key takeaways, active-recall quiz, and flashcards.
 */
export async function POST(
  request: Request
): Promise<NextResponse<RecapApiResponse>> {
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

    const parseResult = LectureRecapRequestSchema.safeParse(body);
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
    const recap = await provider.summarizeLecture(parseResult.data);

    return NextResponse.json({
      success: true,
      recap,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/ai/recap:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
