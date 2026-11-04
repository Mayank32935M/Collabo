/**
 * COLLABO — Institutional Domain Models & Multi-Tenant Types
 * Defines data structures for Institutions, Departments, Courses, Profiles, and Enrollments.
 */

export type SystemRole = "admin" | "instructor" | "student" | "guest";

export type EnrollmentRole = "instructor" | "ta" | "student";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  system_role: SystemRole;
  created_at: string;
}

export interface Institution {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  slug: string;
  head_profile_id?: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  department_id: string;
  code: string;
  name: string;
  term: string;
  description?: string;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  profile_id: string;
  role: EnrollmentRole;
  created_at: string;
}

export interface CourseWithDetails extends Course {
  department?: Department;
  instructor?: UserProfile;
  enrollment_count?: number;
}

