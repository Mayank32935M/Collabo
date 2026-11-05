import { NextResponse } from "next/server";
import { getMockSession, canHostRoom } from "@collabo/auth";
import { getClassroomRepository } from "@collabo/database";
import { SessionStatus, SessionWithDetails } from "@collabo/shared";

export interface SessionsApiResponse {
  success: boolean;
  sessions?: SessionWithDetails[];
  session?: SessionWithDetails;
  error?: string;
}

/**
 * GET /api/sessions
 * Retrieves sessions, filterable by ?classroomId=... and ?status=...
 */
export async function GET(request: Request): Promise<NextResponse<SessionsApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId") || undefined;
    const status = (searchParams.get("status") as SessionStatus) || undefined;

    const repo = getClassroomRepository();
    const sessions = await repo.getSessions({ classroomId, status });

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] GET /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions
 * Schedules or creates a live classroom session.
 */
export async function POST(request: Request): Promise<NextResponse<SessionsApiResponse>> {
  try {
    const session = getMockSession();
    if (!canHostRoom(session.user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only instructors can schedule or host sessions." },
        { status: 403 }
      );
    }

    let body: Partial<{
      classroom_id: string;
      title: string;
      scheduled_start_at?: string;
    }>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { classroom_id, title, scheduled_start_at } = body;
    if (!classroom_id || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: classroom_id, title" },
        { status: 400 }
      );
    }

    const repo = getClassroomRepository();
    const created = await repo.createSession({
      classroom_id,
      host_profile_id: session.user!.id,
      title,
      scheduled_start_at,
    });

    const full = await repo.getSessionById(created.id);

    return NextResponse.json(
      { success: true, session: full || undefined },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
