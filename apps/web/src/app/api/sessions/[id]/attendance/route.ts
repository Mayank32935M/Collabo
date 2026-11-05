import { NextResponse } from "next/server";
import { getMockSession, canHostRoom } from "@collabo/auth";
import { getClassroomRepository } from "@collabo/database";
import { AttendanceRecord, ParticipantRole, SessionParticipant } from "@collabo/shared";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export interface AttendanceApiResponse {
  success: boolean;
  attendance?: AttendanceRecord[];
  participant?: SessionParticipant | null;
  error?: string;
}

/**
 * GET /api/sessions/[id]/attendance
 * Retrieves the full attendance roster for a session (requires host privileges).
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<AttendanceApiResponse>> {
  try {
    const session = getMockSession();
    if (!canHostRoom(session.user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only hosts can inspect attendance rosters." },
        { status: 403 }
      );
    }

    const { id: sessionId } = await params;
    const repo = getClassroomRepository();
    const attendance = await repo.getAttendance(sessionId);

    return NextResponse.json({
      success: true,
      attendance,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] GET /api/sessions/[id]/attendance:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions/[id]/attendance
 * Logs a participant joining or leaving a live session.
 */
export async function POST(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<AttendanceApiResponse>> {
  try {
    const { id: sessionId } = await params;

    let body: Partial<{
      action: "join" | "leave";
      profile_id?: string;
      role?: ParticipantRole;
    }>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const session = getMockSession();
    const profileId = body.profile_id || session.user?.id;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: "Missing required profile_id" },
        { status: 400 }
      );
    }

    const repo = getClassroomRepository();

    if (body.action === "join") {
      const participant = await repo.logParticipantJoin(
        sessionId,
        profileId,
        body.role || "attendee"
      );
      return NextResponse.json({ success: true, participant }, { status: 201 });
    } else if (body.action === "leave") {
      const participant = await repo.logParticipantLeave(sessionId, profileId);
      return NextResponse.json({ success: true, participant });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Allowed values: 'join', 'leave'" },
        { status: 400 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/sessions/[id]/attendance:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

