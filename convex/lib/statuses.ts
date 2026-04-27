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
