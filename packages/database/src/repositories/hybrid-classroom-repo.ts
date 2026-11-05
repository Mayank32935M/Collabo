import {
  AttendanceRecord,
  Classroom,
  ClassroomSession,
  ClassroomWithDetails,
  ParticipantRole,
  SessionBoard,
  SessionParticipant,
  SessionStatus,
  SessionWithDetails,
} from "@collabo/shared";
import { isSupabaseConfigured, supabase } from "../client";
import {
  ClassroomRepository,
  CreateClassroomInput,
  CreateSessionInput,
} from "./classroom-repository";
import { MemoryClassroomRepository } from "./memory-classroom-repo";
import { SupabaseClassroomRepository } from "./supabase-classroom-repo";

export class HybridClassroomRepository implements ClassroomRepository {
  private supabaseRepo = new SupabaseClassroomRepository();
  private memoryRepo = new MemoryClassroomRepository();

  private get isLive(): boolean {
    return Boolean(isSupabaseConfigured && supabase);
  }

  async getClassrooms(courseId?: string): Promise<ClassroomWithDetails[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getClassrooms(courseId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase getClassrooms failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getClassrooms(courseId);
  }

  async getClassroomById(classroomId: string): Promise<ClassroomWithDetails | null> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getClassroomById(classroomId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase getClassroomById failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getClassroomById(classroomId);
  }

  async createClassroom(input: CreateClassroomInput): Promise<Classroom> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.createClassroom(input);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase createClassroom failed, using fallback:", err);
      }
    }
    return this.memoryRepo.createClassroom(input);
  }

  async getSessions(options?: {
    classroomId?: string;
    status?: SessionStatus;
  }): Promise<SessionWithDetails[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getSessions(options);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase getSessions failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getSessions(options);
  }

  async getSessionById(sessionId: string): Promise<SessionWithDetails | null> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getSessionById(sessionId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase getSessionById failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getSessionById(sessionId);
  }

  async createSession(input: CreateSessionInput): Promise<ClassroomSession> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.createSession(input);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase createSession failed, using fallback:", err);
      }
    }
    return this.memoryRepo.createSession(input);
  }

  async startSession(sessionId: string): Promise<ClassroomSession> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.startSession(sessionId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase startSession failed, using fallback:", err);
      }
    }
    return this.memoryRepo.startSession(sessionId);
  }

  async endSession(sessionId: string): Promise<ClassroomSession> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.endSession(sessionId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase endSession failed, using fallback:", err);
      }
    }
    return this.memoryRepo.endSession(sessionId);
  }

  async logParticipantJoin(
    sessionId: string,
    profileId: string,
    role?: ParticipantRole
  ): Promise<SessionParticipant> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.logParticipantJoin(sessionId, profileId, role);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase logParticipantJoin failed, using fallback:", err);
      }
    }
    return this.memoryRepo.logParticipantJoin(sessionId, profileId, role);
  }

  async logParticipantLeave(
    sessionId: string,
    profileId: string
  ): Promise<SessionParticipant | null> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.logParticipantLeave(sessionId, profileId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase logParticipantLeave failed, using fallback:", err);
      }
    }
    return this.memoryRepo.logParticipantLeave(sessionId, profileId);
  }

  async getAttendance(sessionId: string): Promise<AttendanceRecord[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getAttendance(sessionId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase getAttendance failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getAttendance(sessionId);
  }

  async attachBoardToSession(
    sessionId: string,
    boardId: string
  ): Promise<SessionBoard> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.attachBoardToSession(sessionId, boardId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase attachBoardToSession failed, using fallback:", err);
      }
    }
    return this.memoryRepo.attachBoardToSession(sessionId, boardId);
  }

  async getSessionBoards(sessionId: string): Promise<SessionBoard[]> {
    if (this.isLive) {
      try {
        return await this.supabaseRepo.getSessionBoards(sessionId);
      } catch (err) {
        console.warn("[HybridClassroomRepository] Supabase getSessionBoards failed, using fallback:", err);
      }
    }
    return this.memoryRepo.getSessionBoards(sessionId);
  }
}

let defaultClassroomRepoInstance: ClassroomRepository | null = null;

export function getClassroomRepository(): ClassroomRepository {
  if (!defaultClassroomRepoInstance) {
    defaultClassroomRepoInstance = new HybridClassroomRepository();
  }
  return defaultClassroomRepoInstance;
}

