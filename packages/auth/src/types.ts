import { SystemRole, EnrollmentRole } from "@collabo/shared";

/**
 * Granular permissions governing capabilities across classrooms, courses, and boards.
 */
export type Permission =
  | "institution:manage"
  | "department:create"
  | "course:create"
  | "course:edit"
  | "course:delete"
  | "course:enroll"
  | "course:read"
  | "room:host"
  | "room:cohost"
  | "room:speak"
  | "room:raise_hand"
  | "room:mute_others"
  | "room:manage_modes"
  | "board:create"
  | "board:edit"
  | "board:view"
  | "attendance:view";

/**
 * Represents an authenticated user in the COLLABO ecosystem.
 */
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  system_role: SystemRole;
  institution_id?: string | null;
}

/**
 * Represents the active user authentication session.
 */
export interface AuthSession {
  user: AuthUser | null;
  token?: string;
  isAuthenticated: boolean;
  expiresAt?: string;
}

