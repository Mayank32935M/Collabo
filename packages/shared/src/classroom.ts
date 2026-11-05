/**
 * COLLABO — Classroom, Session & Attendance Domain Models
 * Defines data structures for Virtual Classrooms, Live/Scheduled Sessions,
 * Automated Attendance Logs, and Session-Board bindings.
 */

import { Course, UserProfile } from "./institution";
import { BoardRecord } from "./database";

export type ClassroomMode = "lecture" | "interactive";

export type SessionStatus = "scheduled" | "live" | "ended";

export type ParticipantRole = "host" | "co-host" | "speaker" | "attendee";

export interface Classroom {
  id: string;
  course_id: string;
  title: string;
  default_mode: ClassroomMode;
  require_waiting_room: boolean;
  created_at: string;
}

export interface ClassroomSession {
  id: string;
  classroom_id: string;
  host_profile_id: string;
  title: string;
  status: SessionStatus;
  scheduled_start_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  profile_id: string;
  role: ParticipantRole;
  joined_at: string;
  left_at?: string | null;
  duration_seconds: number;
}

export interface SessionBoard {
  id: string;
  session_id: string;
  board_id: string;
  is_active: boolean;
  attached_at: string;
}

export interface ClassroomWithDetails extends Classroom {
  course?: Course;
  active_session?: ClassroomSession | null;
  total_sessions_count?: number;
}

export interface SessionWithDetails extends ClassroomSession {
  classroom?: Classroom;
  host?: UserProfile | null;
  active_board?: BoardRecord | null;
  participant_count?: number;
}

export interface AttendanceRecord extends SessionParticipant {
  profile?: UserProfile | null;
}

