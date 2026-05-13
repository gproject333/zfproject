import { internalMutation } from "./_generated/server";

const STATS_KEY = "global";

/**
 * Recompute the singleton stats row from scratch by scanning the source
 * tables. Used for:
 *  - initial backfill before the incremental triggers existed
 *  - drift correction if the counters get out of sync
 *
 * Reads via indexed `.collect()` per role / status (bounded subsets,
 * not full table scans). For a tiny db this fits in a single
 * transaction; for larger datasets, run it off-hours when read load
 * is low.
 */
export const recomputeStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const [
      students,
      supervisors,
      sponsors,
      admins,
      underReview,
      accepted,
      rejected,
      needsModification,
      assignments,
    ] = await Promise.all([
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "student")).collect(),
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "supervisor")).collect(),
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "sponsor")).collect(),
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "admin")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "under_review")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "accepted")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "rejected")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "needs_modification")).collect(),
      ctx.db.query("sponsorAssignments").collect(),
    ]);

    const counters = {
      students: students.length,
      supervisors: supervisors.length,
      sponsors: sponsors.length,
      admins: admins.length,
      applicationsUnderReview: underReview.length,
      applicationsAccepted: accepted.length,
      applicationsRejected: rejected.length,
      applicationsNeedsModification: needsModification.length,
      sponsorAssignments: assignments.length,
    };

    const existing = await ctx.db
      .query("stats")
      .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...counters, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("stats", {
        key: STATS_KEY,
        ...counters,
        updatedAt: Date.now(),
      });
    }

    return counters;
  },
});

