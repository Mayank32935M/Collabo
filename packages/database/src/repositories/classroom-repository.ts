import {
  AttendanceRecord,
  Classroom,
  ClassroomMode,
  ClassroomWithDetails,
  ParticipantRole,
  SessionBoard,
  SessionParticipant,
  SessionStatus,
  SessionWithDetails,
  ClassroomSession,
} from "@collabo/shared";

export interface CreateClassroomInput {
  course_id: string;
  title: string;
  default_mode?: ClassroomMode;
  require_waiting_room?: boolean;
}

export interface CreateSessionInput {
  classroom_id: string;
  host_profile_id: string;
  title: string;
  scheduled_start_at?: string | null;
}

export interface ClassroomRepository {
  getClassrooms(courseId?: string): Promise<ClassroomWithDetails[]>;
  getClassroomById(classroomId: string): Promise<ClassroomWithDetails | null>;
  createClassroom(input: CreateClassroomInput): Promise<Classroom>;
  getSessions(options?: {
    classroomId?: string;
    status?: SessionStatus;
  }): Promise<SessionWithDetails[]>;
  getSessionById(sessionId: string): Promise<SessionWithDetails | null>;
  createSession(input: CreateSessionInput): Promise<ClassroomSession>;
  startSession(sessionId: string): Promise<ClassroomSession>;
  endSession(sessionId: string): Promise<ClassroomSession>;
  logParticipantJoin(
    sessionId: string,
    profileId: string,
    role?: ParticipantRole
  ): Promise<SessionParticipant>;
  logParticipantLeave(
    sessionId: string,
    profileId: string
  ): Promise<SessionParticipant | null>;
  getAttendance(sessionId: string): Promise<AttendanceRecord[]>;
  attachBoardToSession(
    sessionId: string,
    boardId: string
  ): Promise<SessionBoard>;
  getSessionBoards(sessionId: string): Promise<SessionBoard[]>;
}

