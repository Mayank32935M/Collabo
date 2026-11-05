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
  UserProfile,
} from "@collabo/shared";
import { supabase } from "../client";
import {
  ClassroomRepository,
  CreateClassroomInput,
  CreateSessionInput,
} from "./classroom-repository";

interface SupabaseClassroomRow extends Classroom {
  course?: {
    id: string;
    code: string;
    name: string;
    term: string;
  };
  sessions?: ClassroomSession[];
}

interface SupabaseSessionRow extends ClassroomSession {
  classroom?: Classroom;
  host?: UserProfile;
  participants?: SessionParticipant[];
  session_boards?: Array<SessionBoard & { board?: any }>;
}

export class SupabaseClassroomRepository implements ClassroomRepository {
  async getClassrooms(courseId?: string): Promise<ClassroomWithDetails[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    let query = supabase.from("classrooms").select(`
      *,
      course:courses(*),
      sessions:classroom_sessions(*)
    `);

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw new Error(`[Supabase Error] getClassrooms: ${error.message}`);

    return ((data as unknown as SupabaseClassroomRow[]) || []).map((row) => {
      const activeSession = (row.sessions || []).find((s) => s.status === "live");
      return {
        id: row.id,
        course_id: row.course_id,
        title: row.title,
        default_mode: row.default_mode,
        require_waiting_room: row.require_waiting_room,
        created_at: row.created_at,
        course: row.course as any,
        active_session: activeSession || null,
        total_sessions_count: (row.sessions || []).length,
      };
    });
  }

  async getClassroomById(classroomId: string): Promise<ClassroomWithDetails | null> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("classrooms")
      .select(`
        *,
        course:courses(*),
        sessions:classroom_sessions(*)
      `)
      .eq("id", classroomId)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error] getClassroomById: ${error.message}`);
    if (!data) return null;

    const row = data as unknown as SupabaseClassroomRow;
    const activeSession = (row.sessions || []).find((s) => s.status === "live");

    return {
      id: row.id,
      course_id: row.course_id,
      title: row.title,
      default_mode: row.default_mode,
      require_waiting_room: row.require_waiting_room,
      created_at: row.created_at,
      course: row.course as any,
      active_session: activeSession || null,
      total_sessions_count: (row.sessions || []).length,
    };
  }

  async createClassroom(input: CreateClassroomInput): Promise<Classroom> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("classrooms")
      .insert({
        course_id: input.course_id,
        title: input.title,
        default_mode: input.default_mode || "lecture",
        require_waiting_room: input.require_waiting_room ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] createClassroom: ${error.message}`);
    return data as Classroom;
  }

  async getSessions(options?: {
    classroomId?: string;
    status?: SessionStatus;
  }): Promise<SessionWithDetails[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    let query = supabase.from("classroom_sessions").select(`
      *,
      classroom:classrooms(*),
      host:profiles(*),
      participants:session_participants(*),
      session_boards:session_boards(
        *,
        board:boards(*)
      )
    `);

    if (options?.classroomId) {
      query = query.eq("classroom_id", options.classroomId);
    }
    if (options?.status) {
      query = query.eq("status", options.status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(`[Supabase Error] getSessions: ${error.message}`);

    return ((data as unknown as SupabaseSessionRow[]) || []).map((row) => {
      const activeSb = (row.session_boards || []).find((sb) => sb.is_active);
      return {
        id: row.id,
        classroom_id: row.classroom_id,
        host_profile_id: row.host_profile_id,
        title: row.title,
        status: row.status,
        scheduled_start_at: row.scheduled_start_at,
        started_at: row.started_at,
        ended_at: row.ended_at,
        created_at: row.created_at,
        classroom: row.classroom,
        host: row.host,
        active_board: activeSb?.board || null,
        participant_count: (row.participants || []).length,
      };
    });
  }

  async getSessionById(sessionId: string): Promise<SessionWithDetails | null> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("classroom_sessions")
      .select(`
        *,
        classroom:classrooms(*),
        host:profiles(*),
        participants:session_participants(*),
        session_boards:session_boards(
          *,
          board:boards(*)
        )
      `)
      .eq("id", sessionId)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error] getSessionById: ${error.message}`);
    if (!data) return null;

    const row = data as unknown as SupabaseSessionRow;
    const activeSb = (row.session_boards || []).find((sb) => sb.is_active);

    return {
      id: row.id,
      classroom_id: row.classroom_id,
      host_profile_id: row.host_profile_id,
      title: row.title,
      status: row.status,
      scheduled_start_at: row.scheduled_start_at,
      started_at: row.started_at,
      ended_at: row.ended_at,
      created_at: row.created_at,
      classroom: row.classroom,
      host: row.host,
      active_board: activeSb?.board || null,
      participant_count: (row.participants || []).length,
    };
  }

  async createSession(input: CreateSessionInput): Promise<ClassroomSession> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("classroom_sessions")
      .insert({
        classroom_id: input.classroom_id,
        host_profile_id: input.host_profile_id,
        title: input.title,
        scheduled_start_at: input.scheduled_start_at || new Date().toISOString(),
        status: "scheduled",
      })
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] createSession: ${error.message}`);
    return data as ClassroomSession;
  }

  async startSession(sessionId: string): Promise<ClassroomSession> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("classroom_sessions")
      .update({
        status: "live",
        started_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] startSession: ${error.message}`);
    return data as ClassroomSession;
  }

  async endSession(sessionId: string): Promise<ClassroomSession> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const endedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("classroom_sessions")
      .update({
        status: "ended",
        ended_at: endedAt,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] endSession: ${error.message}`);
    return data as ClassroomSession;
  }

  async logParticipantJoin(
    sessionId: string,
    profileId: string,
    role: ParticipantRole = "attendee"
  ): Promise<SessionParticipant> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("session_participants")
      .upsert(
        {
          session_id: sessionId,
          profile_id: profileId,
          role,
          joined_at: new Date().toISOString(),
        },
        { onConflict: "session_id,profile_id,joined_at" }
      )
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] logParticipantJoin: ${error.message}`);
    return data as SessionParticipant;
  }

  async logParticipantLeave(
    sessionId: string,
    profileId: string
  ): Promise<SessionParticipant | null> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data: existing, error: findError } = await supabase
      .from("session_participants")
      .select("*")
      .eq("session_id", sessionId)
      .eq("profile_id", profileId)
      .is("left_at", null)
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) throw new Error(`[Supabase Error] logParticipantLeave find: ${findError.message}`);
    if (!existing) return null;

    const leftAt = new Date().toISOString();
    const duration = Math.max(
      0,
      Math.floor((new Date(leftAt).getTime() - new Date(existing.joined_at).getTime()) / 1000)
    );

    const { data, error } = await supabase
      .from("session_participants")
      .update({
        left_at: leftAt,
        duration_seconds: duration,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] logParticipantLeave update: ${error.message}`);
    return data as SessionParticipant;
  }

  async getAttendance(sessionId: string): Promise<AttendanceRecord[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("session_participants")
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq("session_id", sessionId)
      .order("joined_at", { ascending: true });

    if (error) throw new Error(`[Supabase Error] getAttendance: ${error.message}`);
    return (data as unknown as AttendanceRecord[]) || [];
  }

  async attachBoardToSession(
    sessionId: string,
    boardId: string
  ): Promise<SessionBoard> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("session_boards")
      .upsert(
        {
          session_id: sessionId,
          board_id: boardId,
          is_active: true,
          attached_at: new Date().toISOString(),
        },
        { onConflict: "session_id,board_id" }
      )
      .select()
      .single();

    if (error) throw new Error(`[Supabase Error] attachBoardToSession: ${error.message}`);
    return data as SessionBoard;
  }

  async getSessionBoards(sessionId: string): Promise<SessionBoard[]> {
    if (!supabase) throw new Error("Supabase client is uninitialized");

    const { data, error } = await supabase
      .from("session_boards")
      .select("*")
      .eq("session_id", sessionId);

    if (error) throw new Error(`[Supabase Error] getSessionBoards: ${error.message}`);
    return (data as SessionBoard[]) || [];
  }
}

