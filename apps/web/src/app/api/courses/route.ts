import { NextResponse } from "next/server";
import { getMockSession, hasPermission } from "@collabo/auth";
import { getInstitutionalRepository } from "@collabo/database";
import { CourseWithDetails } from "@collabo/shared";

export interface CoursesApiResponse {
  success: boolean;
  courses?: CourseWithDetails[];
  course?: CourseWithDetails;
  error?: string;
}

/**
 * GET /api/courses
 * Retrieves academic courses, filterable by ?departmentId=... or ?institutionId=...
 */
export async function GET(request: Request): Promise<NextResponse<CoursesApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId") || undefined;
    const institutionId = searchParams.get("institutionId") || undefined;

    const repo = getInstitutionalRepository();
    const courses = await repo.getCourses({ departmentId, institutionId });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] GET /api/courses:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Creates a new course offering (requires course:create permission).
 */
export async function POST(request: Request): Promise<NextResponse<CoursesApiResponse>> {
  try {
    // Check user session and permission
    const session = getMockSession();
    if (!hasPermission(session.user, "course:create")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have permission to create courses." },
        { status: 403 }
      );
    }

    let body: Partial<{
      department_id: string;
      code: string;
      name: string;
      term: string;
      description?: string;
    }>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { department_id, code, name, term, description } = body;
    if (!department_id || !code || !name || !term) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: department_id, code, name, term" },
        { status: 400 }
      );
    }

    const repo = getInstitutionalRepository();
    const created = await repo.createCourse({
      department_id,
      code,
      name,
      term,
      description,
    });

    // Auto-enroll the creator as instructor
    if (session.user) {
      await repo.enrollUser(created.id, session.user.id, "instructor");
    }

    const full = await repo.getCourseById(created.id);

    return NextResponse.json(
      { success: true, course: full || created },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/courses:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
