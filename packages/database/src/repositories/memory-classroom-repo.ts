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
import {
  ClassroomRepository,
  CreateClassroomInput,
  CreateSessionInput,
} from "./classroom-repository";
import { getInstitutionalRepository } from "./hybrid-institutional-repo";
import { getBoardStorageAdapter } from "../adapter";

// -------------------------------------------------------------
// SEED FIXTURES FOR CLASSROOMS & SESSIONS
// -------------------------------------------------------------

const SEED_CLASSROOMS: Classroom[] = [
  {
    id: "room-cs101-main",
    course_id: "course-cs101-001",
    title: "Lecture Hall A — Algorithmic Foundations",
    default_mode: "lecture",
    require_waiting_room: false,
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
  {
    id: "room-cs240-main",
    course_id: "course-cs240-001",
    title: "Systems Lab 3 — Distributed Consensus",
    default_mode: "interactive",
    require_waiting_room: true,
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

const SEED_SESSIONS: ClassroomSession[] = [
  {
    id: "session-cs101-001",
    classroom_id: "room-cs101-main",
    host_profile_id: "00000000-0000-0000-0000-000000000002", // Prof. Maya Lin
    title: "Lecture 1: Asymptotic Notation & Amortized Analysis",
    status: "scheduled",
    scheduled_start_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    started_at: null,
    ended_at: null,
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

export class MemoryClassroomRepository implements ClassroomRepository {
  private classrooms = new Map<string, Classroom>(
    SEED_CLASSROOMS.map((c) => [c.id, { ...c }])
  );
  private sessions = new Map<string, ClassroomSession>(
    SEED_SESSIONS.map((s) => [s.id, { ...s }])
  );
  private participants = new Map<string, SessionParticipant>();
  private sessionBoards = new Map<string, SessionBoard>();

  async getClassrooms(courseId?: string): Promise<ClassroomWithDetails[]> {
    let list = Array.from(this.classrooms.values());
    if (courseId) {
      list = list.filter((c) => c.course_id === courseId);
    }
    return Promise.all(list.map((c) => this.enrichClassroom(c)));
  }

  async getClassroomById(classroomId: string): Promise<ClassroomWithDetails | null> {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) return null;
    return this.enrichClassroom(classroom);
  }

  async createClassroom(input: CreateClassroomInput): Promise<Classroom> {
    const id = `room-${Math.random().toString(36).slice(2, 9)}`;
    const newClassroom: Classroom = {
      id,
      course_id: input.course_id,
      title: input.title,
      default_mode: input.default_mode || "lecture",
      require_waiting_room: input.require_waiting_room ?? false,
      created_at: new Date().toISOString(),
    };
    this.classrooms.set(id, newClassroom);
    return { ...newClassroom };
  }

  async getSessions(options?: {
    classroomId?: string;
    status?: SessionStatus;
  }): Promise<SessionWithDetails[]> {
    let list = Array.from(this.sessions.values());
    if (options?.classroomId) {
      list = list.filter((s) => s.classroom_id === options.classroomId);
    }
    if (options?.status) {
      list = list.filter((s) => s.status === options.status);
    }
    return Promise.all(list.map((s) => this.enrichSession(s)));
  }

  async getSessionById(sessionId: string): Promise<SessionWithDetails | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return this.enrichSession(session);
  }

  async createSession(input: CreateSessionInput): Promise<ClassroomSession> {
    const id = `session-${Math.random().toString(36).slice(2, 9)}`;
    const session: ClassroomSession = {
      id,
      classroom_id: input.classroom_id,
      host_profile_id: input.host_profile_id,
      title: input.title,
      status: "scheduled",
      scheduled_start_at: input.scheduled_start_at || new Date().toISOString(),
      started_at: null,
      ended_at: null,
      created_at: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return { ...session };
  }

  async startSession(sessionId: string): Promise<ClassroomSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.status = "live";
    session.started_at = new Date().toISOString();
    return { ...session };
  }

  async endSession(sessionId: string): Promise<ClassroomSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.status = "ended";
    session.ended_at = new Date().toISOString();

    // Auto-finalize any participants who hadn't logged a leave event
    const now = Date.now();
    for (const p of this.participants.values()) {
      if (p.session_id === sessionId && !p.left_at) {
        p.left_at = session.ended_at;
        const joinMs = new Date(p.joined_at).getTime();
        p.duration_seconds = Math.max(0, Math.floor((now - joinMs) / 1000));
      }
    }

    return { ...session };
  }

  async logParticipantJoin(
    sessionId: string,
    profileId: string,
    role: ParticipantRole = "attendee"
  ): Promise<SessionParticipant> {
    const id = `part-${sessionId}-${profileId}`;
    const participant: SessionParticipant = {
      id,
      session_id: sessionId,
      profile_id: profileId,
      role,
      joined_at: new Date().toISOString(),
      left_at: null,
      duration_seconds: 0,
    };
    this.participants.set(id, participant);
    return { ...participant };
  }

  async logParticipantLeave(
    sessionId: string,
    profileId: string
  ): Promise<SessionParticipant | null> {
    const id = `part-${sessionId}-${profileId}`;
    const participant = this.participants.get(id);
    if (!participant) return null;

    const leftAt = new Date().toISOString();
    const joinMs = new Date(participant.joined_at).getTime();
    const leaveMs = new Date(leftAt).getTime();

    participant.left_at = leftAt;
    participant.duration_seconds = Math.max(0, Math.floor((leaveMs - joinMs) / 1000));
    return { ...participant };
  }

  async getAttendance(sessionId: string): Promise<AttendanceRecord[]> {
    const instRepo = getInstitutionalRepository();
    const list = Array.from(this.participants.values()).filter(
      (p) => p.session_id === sessionId
    );

    return Promise.all(
      list.map(async (p) => {
        const profile = await instRepo.getProfile(p.profile_id);
        return {
          ...p,
          profile,
        };
      })
    );
  }

  async attachBoardToSession(
    sessionId: string,
    boardId: string
  ): Promise<SessionBoard> {
    const id = `sb-${sessionId}-${boardId}`;
    const sessionBoard: SessionBoard = {
      id,
      session_id: sessionId,
      board_id: boardId,
      is_active: true,
      attached_at: new Date().toISOString(),
    };
    this.sessionBoards.set(id, sessionBoard);
    return { ...sessionBoard };
  }

  async getSessionBoards(sessionId: string): Promise<SessionBoard[]> {
    return Array.from(this.sessionBoards.values()).filter(
      (sb) => sb.session_id === sessionId
    );
  }

  private async enrichClassroom(
    classroom: Classroom
  ): Promise<ClassroomWithDetails> {
    const instRepo = getInstitutionalRepository();
    const course = await instRepo.getCourseById(classroom.course_id);
    const activeSession = Array.from(this.sessions.values()).find(
      (s) => s.classroom_id === classroom.id && s.status === "live"
    );
    const totalSessions = Array.from(this.sessions.values()).filter(
      (s) => s.classroom_id === classroom.id
    ).length;

    return {
      ...classroom,
      course: course || undefined,
      active_session: activeSession || null,
      total_sessions_count: totalSessions,
    };
  }

  private async enrichSession(
    session: ClassroomSession
  ): Promise<SessionWithDetails> {
    const instRepo = getInstitutionalRepository();
    const boardAdapter = getBoardStorageAdapter();

    const classroom = this.classrooms.get(session.classroom_id);
    const host = await instRepo.getProfile(session.host_profile_id);
    const sessionBoard = Array.from(this.sessionBoards.values()).find(
      (sb) => sb.session_id === session.id && sb.is_active
    );

    let activeBoard = null;
    if (sessionBoard) {
      const boardRes = await boardAdapter.getBoard(sessionBoard.board_id);
      activeBoard = boardRes.board;
    }

    const participants = Array.from(this.participants.values()).filter(
      (p) => p.session_id === session.id
    );

    return {
      ...session,
      classroom,
      host,
      active_board: activeBoard,
      participant_count: participants.length,
    };
  }
}

