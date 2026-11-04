import {
  Course,
  CourseEnrollment,
  CourseWithDetails,
  Department,
  EnrollmentRole,
  Institution,
  UserProfile,
} from "@collabo/shared";
import {
  CreateCourseInput,
  InstitutionalRepository,
} from "./institutional-repository";

// -------------------------------------------------------------
// SEED DATA FOR LOCAL DEVELOPMENT & OFFLINE RESILIENCE
// -------------------------------------------------------------

const SEED_INSTITUTIONS: Institution[] = [
  {
    id: "inst-apex-001",
    name: "Apex Institute of Technology",
    slug: "apex-tech",
    domain: "apex.edu",
    settings: {
      default_lecture_capacity: 300,
      allow_guest_audio: false,
    },
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

const SEED_PROFILES: UserProfile[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@apex.edu",
    full_name: "Dr. Evelyn Reed",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
    system_role: "admin",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "prof.maya@apex.edu",
    full_name: "Prof. Maya Lin",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=maya",
    system_role: "instructor",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "alex.rivera@student.apex.edu",
    full_name: "Alex Rivera",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=alex",
    system_role: "student",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

const SEED_DEPARTMENTS: Department[] = [
  {
    id: "dept-cs-001",
    institution_id: "inst-apex-001",
    name: "Department of Computer Science & Engineering",
    slug: "cs",
    head_profile_id: "00000000-0000-0000-0000-000000000002",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "dept-math-001",
    institution_id: "inst-apex-001",
    name: "Department of Mathematics & Statistics",
    slug: "math",
    head_profile_id: null,
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

const SEED_COURSES: Course[] = [
  {
    id: "course-cs101-001",
    department_id: "dept-cs-001",
    code: "CS-101",
    name: "Introduction to Data Structures & Algorithms",
    term: "Fall 2026",
    description: "Fundamental data structures, asymptotic complexity, and graph search algorithms.",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "course-cs240-001",
    department_id: "dept-cs-001",
    code: "CS-240",
    name: "Distributed Systems & Cloud Computing",
    term: "Fall 2026",
    description: "Consensus algorithms, WebRTC peer topology, and microservice resilience.",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "course-math201-001",
    department_id: "dept-math-001",
    code: "MATH-201",
    name: "Linear Algebra & Vector Spaces",
    term: "Fall 2026",
    description: "Matrix decompositions, eigenvectors, and geometric linear transformations.",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

const SEED_ENROLLMENTS: CourseEnrollment[] = [
  {
    id: "enr-001",
    course_id: "course-cs101-001",
    profile_id: "00000000-0000-0000-0000-000000000002",
    role: "instructor",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "enr-002",
    course_id: "course-cs101-001",
    profile_id: "00000000-0000-0000-0000-000000000003",
    role: "student",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "enr-003",
    course_id: "course-cs240-001",
    profile_id: "00000000-0000-0000-0000-000000000002",
    role: "instructor",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

export class MemoryInstitutionalRepository implements InstitutionalRepository {
  private institutions = new Map<string, Institution>(
    SEED_INSTITUTIONS.map((inst) => [inst.id, { ...inst }])
  );
  private departments = new Map<string, Department>(
    SEED_DEPARTMENTS.map((dept) => [dept.id, { ...dept }])
  );
  private courses = new Map<string, Course>(
    SEED_COURSES.map((course) => [course.id, { ...course }])
  );
  private enrollments = new Map<string, CourseEnrollment>(
    SEED_ENROLLMENTS.map((enr) => [enr.id, { ...enr }])
  );
  private profiles = new Map<string, UserProfile>(
    SEED_PROFILES.map((p) => [p.id, { ...p }])
  );

  async getInstitutions(): Promise<Institution[]> {
    return Array.from(this.institutions.values());
  }

  async getInstitutionBySlug(slug: string): Promise<Institution | null> {
    for (const inst of this.institutions.values()) {
      if (inst.slug === slug) return { ...inst };
    }
    return null;
  }

  async getDepartments(institutionId: string): Promise<Department[]> {
    return Array.from(this.departments.values()).filter(
      (dept) => dept.institution_id === institutionId
    );
  }

  async getCourses(options?: {
    departmentId?: string;
    institutionId?: string;
  }): Promise<CourseWithDetails[]> {
    let list = Array.from(this.courses.values());

    if (options?.departmentId) {
      list = list.filter((c) => c.department_id === options.departmentId);
    } else if (options?.institutionId) {
      const depts = await this.getDepartments(options.institutionId);
      const deptIds = new Set(depts.map((d) => d.id));
      list = list.filter((c) => deptIds.has(c.department_id));
    }

    return Promise.all(list.map((c) => this.enrichCourse(c)));
  }

  async getCourseById(courseId: string): Promise<CourseWithDetails | null> {
    const course = this.courses.get(courseId);
    if (!course) return null;
    return this.enrichCourse(course);
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const id = `course-${Math.random().toString(36).slice(2, 9)}`;
    const newCourse: Course = {
      id,
      department_id: input.department_id,
      code: input.code,
      name: input.name,
      term: input.term,
      description: input.description,
      created_at: new Date().toISOString(),
    };
    this.courses.set(id, newCourse);
    return { ...newCourse };
  }

  async getEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enr) => enr.course_id === courseId
    );
  }

  async enrollUser(
    courseId: string,
    profileId: string,
    role: EnrollmentRole
  ): Promise<CourseEnrollment> {
    // Check if already enrolled
    const existing = Array.from(this.enrollments.values()).find(
      (enr) => enr.course_id === courseId && enr.profile_id === profileId
    );
    if (existing) {
      existing.role = role;
      return { ...existing };
    }

    const id = `enr-${Math.random().toString(36).slice(2, 9)}`;
    const enrollment: CourseEnrollment = {
      id,
      course_id: courseId,
      profile_id: profileId,
      role,
      created_at: new Date().toISOString(),
    };
    this.enrollments.set(id, enrollment);
    return { ...enrollment };
  }

  async getProfile(profileId: string): Promise<UserProfile | null> {
    const profile = this.profiles.get(profileId);
    return profile ? { ...profile } : null;
  }

  private async enrichCourse(course: Course): Promise<CourseWithDetails> {
    const department = this.departments.get(course.department_id);
    const enrollments = await this.getEnrollments(course.id);
    const instructorEnrollment = enrollments.find((e) => e.role === "instructor");
    const instructor = instructorEnrollment
      ? await this.getProfile(instructorEnrollment.profile_id)
      : null;

    return {
      ...course,
      department,
      instructor: instructor || undefined,
      enrollment_count: enrollments.length,
    };
  }
}

