import { NextResponse } from "next/server";
import { getInstitutionalRepository } from "@collabo/database";
import { Department, Institution } from "@collabo/shared";

export interface InstitutionsApiResponse {
  success: boolean;
  institutions?: Array<Institution & { departments?: Department[] }>;
  error?: string;
}

/**
 * GET /api/institutions
 * Retrieves the institutional registry and associated academic departments.
 */
export async function GET(): Promise<NextResponse<InstitutionsApiResponse>> {
  try {
    const repo = getInstitutionalRepository();
    const institutions = await repo.getInstitutions();

    const withDepartments = await Promise.all(
      institutions.map(async (inst) => {
        const departments = await repo.getDepartments(inst.id);
        return {
          ...inst,
          departments,
        };
      })
    );

    return NextResponse.json({
      success: true,
      institutions: withDepartments,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] GET /api/institutions:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

