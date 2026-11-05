import { NextResponse } from "next/server";
import { getMockSession, canHostRoom } from "@collabo/auth";
import { getClassroomRepository } from "@collabo/database";
import { ClassroomMode, ClassroomWithDetails } from "@collabo/shared";

export interface ClassroomsApiResponse {
  success: boolean;
  classrooms?: ClassroomWithDetails[];
  classroom?: ClassroomWithDetails;
  error?: string;
}

/**
 * GET /api/classrooms
 * Retrieves virtual classrooms, optionally filtered by ?courseId=...
 */
export async function GET(request: Request): Promise<NextResponse<ClassroomsApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || undefined;

    const repo = getClassroomRepository();
    const classrooms = await repo.getClassrooms(courseId);

    return NextResponse.json({
      success: true,
      classrooms,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] GET /api/classrooms:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/classrooms
 * Provisions a new virtual classroom bound to a course.
 */
export async function POST(request: Request): Promise<NextResponse<ClassroomsApiResponse>> {
  try {
    const session = getMockSession();
    if (!canHostRoom(session.user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only instructors can create classrooms." },
        { status: 403 }
      );
    }

    let body: Partial<{
      course_id: string;
      title: string;
      default_mode?: ClassroomMode;
      require_waiting_room?: boolean;
    }>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { course_id, title, default_mode, require_waiting_room } = body;
    if (!course_id || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: course_id, title" },
        { status: 400 }
      );
    }

    const repo = getClassroomRepository();
    const created = await repo.createClassroom({
      course_id,
      title,
      default_mode: default_mode || "lecture",
      require_waiting_room: Boolean(require_waiting_room),
    });

    const full = await repo.getClassroomById(created.id);

    return NextResponse.json(
      { success: true, classroom: full || created },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/classrooms:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

