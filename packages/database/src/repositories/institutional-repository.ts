import {
  Course,
  CourseEnrollment,
  CourseWithDetails,
  Department,
  EnrollmentRole,
  Institution,
  UserProfile,
} from "@collabo/shared";

export interface CreateCourseInput {
  department_id: string;
  code: string;
  name: string;
  term: string;
  description?: string;
}

export interface InstitutionalRepository {
  getInstitutions(): Promise<Institution[]>;
  getInstitutionBySlug(slug: string): Promise<Institution | null>;
  getDepartments(institutionId: string): Promise<Department[]>;
  getCourses(options?: {
    departmentId?: string;
    institutionId?: string;
  }): Promise<CourseWithDetails[]>;
  getCourseById(courseId: string): Promise<CourseWithDetails | null>;
  createCourse(input: CreateCourseInput): Promise<Course>;
  getEnrollments(courseId: string): Promise<CourseEnrollment[]>;
  enrollUser(
    courseId: string,
    profileId: string,
    role: EnrollmentRole
  ): Promise<CourseEnrollment>;
  getProfile(profileId: string): Promise<UserProfile | null>;
}

