import {
  Course,
  CourseEnrollment,
  CourseWithDetails,
  Department,
  EnrollmentRole,
  Institution,
  UserProfile,
} from "@collabo/shared";
import { isSupabaseConfigured, supabase } from "../client";
import {
  CreateCourseInput,
  InstitutionalRepository,
} from "./institutional-repository";
import { MemoryInstitutionalRepository } from "./memory-institutional-repo";
import { SupabaseInstitutionalRepository } from "./supabase-institutional-repo";

export class HybridInstitutionalRepository implements InstitutionalRepository {
  private supabaseRepo = new SupabaseInstitutionalRepository();
  private memoryRepo = new MemoryInstitutionalRepository();

  private get isLive(): boolean {
    return Boolean(isSupabaseConfigured && supabase);
  }

  async getInstitutions(): Promise<Institution[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getInstitutions();
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase getInstitutions failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getInstitutions();
  }

  async getInstitutionBySlug(slug: string): Promise<Institution | null> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getInstitutionBySlug(slug);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase getInstitutionBySlug failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getInstitutionBySlug(slug);
  }

  async getDepartments(institutionId: string): Promise<Department[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getDepartments(institutionId);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase getDepartments failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getDepartments(institutionId);
  }

  async getCourses(options?: {
    departmentId?: string;
    institutionId?: string;
  }): Promise<CourseWithDetails[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getCourses(options);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase getCourses failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getCourses(options);
  }

  async getCourseById(courseId: string): Promise<CourseWithDetails | null> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getCourseById(courseId);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase getCourseById failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getCourseById(courseId);
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.createCourse(input);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase createCourse failed, using fallback:", err);
      }
    }
    return this.memoryRepo.createCourse(input);
  }

  async getEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getEnrollments(courseId);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase getEnrollments failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getEnrollments(courseId);
  }

  async enrollUser(
    courseId: string,
    profileId: string,
    role: EnrollmentRole
  ): Promise<CourseEnrollment> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.enrollUser(courseId, profileId, role);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase enrollUser failed, using fallback:", err);
      }
    }
    return this.memoryRepo.enrollUser(courseId, profileId, role);
  }

  async getProfile(profileId: string): Promise<UserProfile | null> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getProfile(profileId);
      } catch (err) {
        console.warn("[HybridInstitutionalRepository] Supabase getProfile failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getProfile(profileId);
  }
}

let defaultInstitutionalRepoInstance: InstitutionalRepository | null = null;

export function getInstitutionalRepository(): InstitutionalRepository {
  if (!defaultInstitutionalRepoInstance) {
    defaultInstitutionalRepoInstance = new HybridInstitutionalRepository();
  }
  return defaultInstitutionalRepoInstance;
}

