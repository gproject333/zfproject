export const APPLICATION_STATUSES = [
  "draft",
  "under_review",
  "needs_modification",
  "accepted",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "مسودة",
  under_review: "قيد المراجعة",
  needs_modification: "يحتاج تعديل",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export const SUPERVISOR_STATUS_KEYS = [
  "under_review",
  "needs_modification",
  "accepted",
  "rejected",
] as const;

export type SupervisorStatus = (typeof SUPERVISOR_STATUS_KEYS)[number];

export function isSupervisorStatus(
  status: ApplicationStatus | null | undefined,
): status is SupervisorStatus {
  return (
    status != null &&
    (SUPERVISOR_STATUS_KEYS as readonly string[]).includes(status)
  );
}

/**
 * Statuses the supervisor cannot apply without leaving a written note for
 * the student: rejecting an application or sending it back for changes must
 * always be explained. Enforced both server-side (the source of truth in
 * applications/supervisor.ts) and in the review UI for fast feedback.
 */
export const NOTE_REQUIRED_STATUSES = [
  "needs_modification",
  "rejected",
] as const satisfies readonly ApplicationStatus[];

export function requiresStudentNote(
  status: ApplicationStatus | null | undefined,
): boolean {
  return (
    status != null &&
    (NOTE_REQUIRED_STATUSES as readonly string[]).includes(status)
  );
}

export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["under_review"],
  needs_modification: ["under_review"],
  under_review: ["needs_modification", "accepted", "rejected"],
  accepted: [],
  rejected: [],
};

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
