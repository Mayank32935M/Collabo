import { EnrollmentRole, SystemRole } from "@collabo/shared";
import { AuthUser, Permission } from "./types";

/**
 * System-level role permissions mapping.
 */
export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  admin: [
    "institution:manage",
    "department:create",
    "course:create",
    "course:edit",
    "course:delete",
    "course:enroll",
    "course:read",
    "room:host",
    "room:cohost",
    "room:speak",
    "room:raise_hand",
    "room:mute_others",
    "room:manage_modes",
    "board:create",
    "board:edit",
    "board:view",
    "attendance:view",
  ],
  instructor: [
    "course:create",
    "course:edit",
    "course:enroll",
    "course:read",
    "room:host",
    "room:cohost",
    "room:speak",
    "room:raise_hand",
    "room:mute_others",
    "room:manage_modes",
    "board:create",
    "board:edit",
    "board:view",
    "attendance:view",
  ],
  student: [
    "course:read",
    "room:speak",
    "room:raise_hand",
    "board:create",
    "board:edit",
    "board:view",
  ],
  guest: [
    "room:raise_hand",
    "board:create",
    "board:edit",
    "board:view",
  ],
};

/**
 * Contextual course enrollment permissions mapping.
 */
export const ENROLLMENT_ROLE_PERMISSIONS: Record<EnrollmentRole, Permission[]> = {
  instructor: [
    "course:edit",
    "course:enroll",
    "course:read",
    "room:host",
    "room:cohost",
    "room:speak",
    "room:mute_others",
    "room:manage_modes",
    "board:create",
    "board:edit",
    "board:view",
    "attendance:view",
  ],
  ta: [
    "course:read",
    "room:cohost",
    "room:speak",
    "room:mute_others",
    "board:edit",
    "board:view",
    "attendance:view",
  ],
  student: [
    "course:read",
    "room:speak",
    "room:raise_hand",
    "board:view",
  ],
};

/**
 * Evaluates whether a user has a specific permission based on system role and optional course enrollment.
 */
export function hasPermission(
  user: AuthUser | null,
  permission: Permission,
  enrollmentRole?: EnrollmentRole
): boolean {
  if (!user) {
    // Unauthenticated guest user default permissions
    return SYSTEM_ROLE_PERMISSIONS.guest.includes(permission);
  }

  // Admin has global access
  if (user.system_role === "admin") {
    return true;
  }

  // Check enrollment-specific role if provided
  if (enrollmentRole && ENROLLMENT_ROLE_PERMISSIONS[enrollmentRole]?.includes(permission)) {
    return true;
  }

  // Fallback to user system role
  return SYSTEM_ROLE_PERMISSIONS[user.system_role]?.includes(permission) ?? false;
}

/**
 * Convenience helper to check if a user can host a classroom session.
 */
export function canHostRoom(
  user: AuthUser | null,
  enrollmentRole?: EnrollmentRole
): boolean {
  return hasPermission(user, "room:host", enrollmentRole);
}

/**
 * Convenience helper to check if a user can modify a course.
 */
export function canManageCourse(
  user: AuthUser | null,
  enrollmentRole?: EnrollmentRole
): boolean {
  return hasPermission(user, "course:edit", enrollmentRole);
}

/**
 * Convenience helper to verify if a user has instructor privileges.
 */
export function isInstructor(user: AuthUser | null): boolean {
  return user?.system_role === "instructor" || user?.system_role === "admin";
}

