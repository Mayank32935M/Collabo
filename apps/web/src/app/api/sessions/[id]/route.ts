import { NextResponse } from "next/server";
import { getMockSession, canHostRoom } from "@collabo/auth";
import { getClassroomRepository } from "@collabo/database";
import { SessionStatus, SessionWithDetails } from "@collabo/shared";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export interface SessionDetailApiResponse {
  success: boolean;
  session?: SessionWithDetails;
  error?: string;
}

/**
 * GET /api/sessions/[id]
 * Retrieves details for a specific session including host, active board, and participant count.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<SessionDetailApiResponse>> {
  try {
    const { id: sessionId } = await params;
    const repo = getClassroomRepository();
    const session = await repo.getSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] GET /api/sessions/[id]:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sessions/[id]
 * Updates session lifecycle status: transitions between 'scheduled', 'live', and 'ended'.
 */
export async function PATCH(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<SessionDetailApiResponse>> {
  try {
    const authSession = getMockSession();
    if (!canHostRoom(authSession.user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only instructors can transition session lifecycle." },
        { status: 403 }
      );
    }

    const { id: sessionId } = await params;

    let body: Partial<{ status: SessionStatus }>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const repo = getClassroomRepository();

    if (body.status === "live") {
      await repo.startSession(sessionId);
    } else if (body.status === "ended") {
      await repo.endSession(sessionId);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid status transition. Allowed values: 'live', 'ended'" },
        { status: 400 }
      );
    }

    const updated = await repo.getSessionById(sessionId);

    return NextResponse.json({
      success: true,
      session: updated || undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] PATCH /api/sessions/[id]:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

