/**
 * Single source of truth for mapping a user's role to the URL of their
 * role-specific home, profile, etc. Imported by RoleGuard, LandingPage,
 * and any future route that needs role-aware routing — never inline a
 * role→href switch again.
 */

export type Role = "student" | "supervisor" | "admin" | "sponsor";

const ROLE_HOMEPAGE: Record<Role, string> = {
  student: "/student",
  supervisor: "/supervisor",
  admin: "/admin",
  sponsor: "/sponsor",
};

const ROLE_PROFILE: Record<Role, string> = {
  student: "/student/profile",
  supervisor: "/supervisor/profile",
  admin: "/admin",
  sponsor: "/sponsor",
};

const DEFAULT_HOMEPAGE = ROLE_HOMEPAGE.student;
const DEFAULT_PROFILE = ROLE_PROFILE.student;

function normalizeRole(role: string | undefined | null): Role | null {
  if (!role) return null;
  if (role === "student" || role === "supervisor" || role === "admin" || role === "sponsor") {
    return role;
  }
  return null;
}

/** Returns the dashboard home URL for the given role. Untyped/missing roles default to /student. */
export function getRoleHomepage(role: string | undefined | null): string {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_HOMEPAGE[normalized] : DEFAULT_HOMEPAGE;
}

/** Returns the profile URL for the given role. Admin/sponsor don't have a separate profile page, so they fall back to their home. */
export function getRoleProfileHref(role: string | undefined | null): string {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_PROFILE[normalized] : DEFAULT_PROFILE;
}

/** Type predicate for role values coming from the database. */
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && normalizeRole(value) !== null;
}
