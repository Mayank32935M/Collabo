import {
  Course,
  CourseEnrollment,
  CourseWithDetails,
  Department,
  EnrollmentRole,
  Institution,
  UserProfile,
} from "@collabo/shared";
import { supabase } from "../client";
import {
  CreateCourseInput,
  InstitutionalRepository,
} from "./institutional-repository";

interface SupabaseCourseRow extends Course {
  department?: Department;
  enrollments?: Array<CourseEnrollment & { profile?: UserProfile }>;
}

export class SupabaseInstitutionalRepository
  implements InstitutionalRepository
{
  async getInstitutions(): Promise<Institution[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("institutions")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new Error(`[Supabase Error] getInstitutions: ${error.message}`);
    return (data as Institution[]) || [];
  }

  async getInstitutionBySlug(slug: string): Promise<Institution | null> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("institutions")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error] getInstitutionBySlug: ${error.message}`);
    return (data as Institution) || null;
  }

  async getDepartments(institutionId: string): Promise<Department[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("institution_id", institutionId)
      .order("name", { ascending: true });

    if (error) throw new Error(`[Supabase Error] getDepartments: ${error.message}`);
    return (data as Department[]) || [];
  }

  async getCourses(options?: {
    departmentId?: string;
    institutionId?: string;
  }): Promise<CourseWithDetails[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    let query = supabase.from("courses").select(`
      *,
      department:departments(*),
      enrollments:course_enrollments(
        *,
        profile:profiles(*)
      )
    `);

    if (options?.departmentId) {
      query = query.eq("department_id", options.departmentId);
    }

    const { data, error } = await query.order("code", { ascending: true });
    if (error) throw new Error(`[Supabase Error] getCourses: ${error.message}`);

    return ((data as unknown as SupabaseCourseRow[]) || []).map((row) => {
      const enrollments = row.enrollments || [];
      const instructorEnr = enrollments.find(
        (e) => e.role === "instructor"
      );
      return {
        id: row.id,
        department_id: row.department_id,
        code: row.code,
        name: row.name,
        term: row.term,
        description: row.description,
        created_at: row.created_at,
        department: row.department,
        instructor: instructorEnr?.profile,
        enrollment_count: enrollments.length,
      };
    });
  }

  async getCourseById(courseId: string): Promise<CourseWithDetails | null> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        department:departments(*),
        enrollments:course_enrollments(
          *,
          profile:profiles(*)
        )
      `)
      .eq("id", courseId)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error] getCourseById: ${error.message}`);
    if (!data) return null;

    const row = data as unknown as SupabaseCourseRow;
    const enrollments = row.enrollments || [];
    const instructorEnr = enrollments.find(
      (e) => e.role === "instructor"
    );

    return {
      id: row.id,
      department_id: row.department_id,
      code: row.code,
      name: row.name,
      term: row.term,
      description: row.description,
      created_at: row.created_at,
      department: row.department,
      instructor: instructorEnr?.profile,
      enrollment_count: enrollments.length,
    };
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("courses")
      .insert({
        department_id: input.department_id,
        code: input.code,
        name: input.name,
        term: input.term,
        description: input.description,
      })
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] createCourse: ${error.message}`);
    return data as Course;
  }

  async getEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("course_id", courseId);

    if (error) throw new Error(`[Supabase Error] getEnrollments: ${error.message}`);
    return (data as CourseEnrollment[]) || [];
  }

  async enrollUser(
    courseId: string,
    profileId: string,
    role: EnrollmentRole
  ): Promise<CourseEnrollment> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("course_enrollments")
      .upsert(
        {
          course_id: courseId,
          profile_id: profileId,
          role,
        },
        { onConflict: "course_id,profile_id" }
      )
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] enrollUser: ${error.message}`);
    return data as CourseEnrollment;
  }

  async getProfile(profileId: string): Promise<UserProfile | null> {
    if (!supabase) throw new Error("Supabase client is uninitialized");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error] getProfile: ${error.message}`);
    return (data as UserProfile) || null;
  }
}
