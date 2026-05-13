import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

const STATS_KEY = "global";

export type StatsCounters = {
  students: number;
  supervisors: number;
  sponsors: number;
  admins: number;
  applicationsUnderReview: number;
  applicationsAccepted: number;
  applicationsRejected: number;
  applicationsNeedsModification: number;
  sponsorAssignments: number;
};

const EMPTY_COUNTERS: StatsCounters = {
  students: 0,
  supervisors: 0,
  sponsors: 0,
  admins: 0,
  applicationsUnderReview: 0,
  applicationsAccepted: 0,
  applicationsRejected: 0,
  applicationsNeedsModification: 0,
  sponsorAssignments: 0,
};

/** Read-only: returns the singleton row, or empty counters if it doesn't exist yet. */
export async function readStats(ctx: QueryCtx): Promise<StatsCounters> {
  const row = await ctx.db
    .query("stats")
    .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
    .first();
  if (!row) return EMPTY_COUNTERS;
  return {
    students: row.students,
    supervisors: row.supervisors,
    sponsors: row.sponsors,
    admins: row.admins,
    applicationsUnderReview: row.applicationsUnderReview,
    applicationsAccepted: row.applicationsAccepted,
    applicationsRejected: row.applicationsRejected,
    applicationsNeedsModification: row.applicationsNeedsModification,
    sponsorAssignments: row.sponsorAssignments,
  };
}

async function getOrCreateStatsRow(ctx: MutationCtx): Promise<Doc<"stats">> {
  const existing = await ctx.db
    .query("stats")
    .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
    .first();
  if (existing) return existing;
  const id = await ctx.db.insert("stats", {
    key: STATS_KEY,
    ...EMPTY_COUNTERS,
    updatedAt: Date.now(),
  });
  return (await ctx.db.get(id))!;
}

/**
 * Apply integer deltas to the counters. Pass only the fields that
 * changed; the rest stay untouched.
 *
 * Counters are clamped at zero — a delta that would drive a counter
 * negative is silently floored. This is safer than throwing because
 * a stale recompute or a double-fired trigger could otherwise leave
 * the dashboard showing impossible negatives, and the cron-style
 * recompute will eventually correct any drift.
 */
export async function bumpStats(
  ctx: MutationCtx,
  deltas: Partial<StatsCounters>,
): Promise<void> {
  const row = await getOrCreateStatsRow(ctx);
  const patch: Record<string, number> = {};
  let touched = false;
  for (const key of Object.keys(deltas) as (keyof StatsCounters)[]) {
    const delta = deltas[key];
    if (!delta) continue;
    patch[key] = Math.max(0, row[key] + delta);
    touched = true;
  }
  if (!touched) return;
  await ctx.db.patch(row._id, { ...patch, updatedAt: Date.now() });
}

const ROLE_TO_COUNTER: Record<NonNullable<Doc<"users">["role"]>, keyof StatsCounters> = {
  student: "students",
  supervisor: "supervisors",
  sponsor: "sponsors",
  admin: "admins",
};

export function counterForRole(
  role: Doc<"users">["role"] | undefined,
): keyof StatsCounters | null {
  if (!role) return null;
  return ROLE_TO_COUNTER[role];
}

const STATUS_TO_COUNTER: Record<
  Doc<"applications">["status"],
  keyof StatsCounters | null
> = {
  draft: null,
  under_review: "applicationsUnderReview",
  accepted: "applicationsAccepted",
  rejected: "applicationsRejected",
  needs_modification: "applicationsNeedsModification",
};

export function counterForApplicationStatus(
  status: Doc<"applications">["status"],
): keyof StatsCounters | null {
  return STATUS_TO_COUNTER[status];
}
