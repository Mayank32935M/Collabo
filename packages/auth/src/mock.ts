import { AuthSession, AuthUser } from "./types";

export const MOCK_ADMIN_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@apex.edu",
  full_name: "Dr. Evelyn Reed (Admin)",
  system_role: "admin",
  institution_id: "inst-apex-001",
  avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
};

export const MOCK_INSTRUCTOR_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "prof.maya@apex.edu",
  full_name: "Prof. Maya Lin",
  system_role: "instructor",
  institution_id: "inst-apex-001",
  avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=maya",
};

export const MOCK_STUDENT_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000003",
  email: "alex.rivera@student.apex.edu",
  full_name: "Alex Rivera",
  system_role: "student",
  institution_id: "inst-apex-001",
  avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=alex",
};

export const MOCK_GUEST_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000004",
  email: "guest@collabo.app",
  full_name: "Guest Collaborator",
  system_role: "guest",
  institution_id: null,
  avatar_url: null,
};

let currentMockUser: AuthUser = MOCK_INSTRUCTOR_USER;

/**
 * Gets the active mock session for development. Defaults to the instructor persona.
 */
export function getMockSession(): AuthSession {
  return {
    user: currentMockUser,
    isAuthenticated: true,
    token: `mock-jwt-token-for-${currentMockUser.id}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Switches the active mock user persona for testing (Admin, Instructor, Student, Guest).
 */
export function setMockUser(user: AuthUser): void {
  currentMockUser = user;
}

