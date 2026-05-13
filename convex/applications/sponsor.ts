import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireAdmin } from "../lib/auth";

/**
 * Returns every application a sponsor is allowed to see — i.e. anything past
 * the `draft` stage and not `rejected` — together with a signed video URL
 * so the dashboard can render an Instagram-style reels feed without a
 * second round-trip per project.
 *
 * Applications without a videoFileId are omitted (the dashboard only shows
 * reels). The list is sorted newest-submitted first.
 */
export const mySponsoredApplications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") return [];

    const VISIBLE_STATUSES = [
      "under_review",
      "needs_modification",
      "accepted",
    ] as const;

    const groups = await Promise.all(
      VISIBLE_STATUSES.map((status) =>
        ctx.db
          .query("applications")
          .withIndex("by_status", (q) => q.eq("status", status))
          .collect(),
      ),
    );
    const apps = groups.flat();

    // Per-sponsor "interest" lookup so we can render the heart pre-filled.
    const interests = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor", (q) => q.eq("sponsorId", user._id))
      .collect();
    const interestMap = new Map(
      interests.map((a) => [a.applicationId, a.isInterested ?? false]),
    );

    const withVideo = apps.filter((a) => !!a.videoFileId);
    const reels = await Promise.all(
      withVideo.map(async (a) => ({
        ...a,
        videoUrl: a.videoFileId ? await ctx.storage.getUrl(a.videoFileId) : null,
        isInterested: interestMap.get(a._id) ?? false,
      })),
    );
    reels.sort(
      (a, b) => (b.submittedAt ?? b.createdAt) - (a.submittedAt ?? a.createdAt),
    );
    return reels;
  },
});

export const getSponsorAssignments = query({
  args: { sponsorId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "supervisor")) return [];

    if (args.sponsorId) {
      return await ctx.db
        .query("sponsorAssignments")
        .withIndex("by_sponsor", (q) => q.eq("sponsorId", args.sponsorId!))
        .collect();
    }
    return await ctx.db.query("sponsorAssignments").collect();
  },
});

export const assignSponsor = mutation({
  args: {
    sponsorId: v.id("users"),
    applicationId: v.id("applications"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor_application", (q) =>
        q.eq("sponsorId", args.sponsorId).eq("applicationId", args.applicationId),
      )
      .first();
    if (existing) throw new Error("هذا السبونسر مربوط بهذا المشروع مسبقاً");

    return await ctx.db.insert("sponsorAssignments", {
      sponsorId: args.sponsorId,
      applicationId: args.applicationId,
      assignedBy: admin._id,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const removeSponsorAssignment = mutation({
  args: { assignmentId: v.id("sponsorAssignments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.assignmentId);
  },
});

export const getAssignmentByProject = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") return null;

    return await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor_application", (q) =>
        q.eq("sponsorId", user._id).eq("applicationId", args.applicationId),
      )
      .first();
  },
});

/**
 * Applications the current sponsor has marked as "interested" — these are
 * their saved projects. Same shape as `mySponsoredApplications` (full
 * application doc + signed videoUrl + isInterested: true) so the saved-
 * projects page can reuse the same ReelSlide / card components.
 */
export const mySavedApplications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") return [];

    const assignments = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor", (q) => q.eq("sponsorId", user._id))
      .collect();
    const savedIds = assignments
      .filter((a) => a.isInterested === true)
      .map((a) => a.applicationId);

    if (savedIds.length === 0) return [];

    const apps = await Promise.all(savedIds.map((id) => ctx.db.get(id)));
    const visible = apps.filter(
      (a): a is NonNullable<typeof a> => a !== null && a.status !== "draft" && a.status !== "rejected",
    );

    const withMeta = await Promise.all(
      visible.map(async (a) => ({
        ...a,
        videoUrl: a.videoFileId ? await ctx.storage.getUrl(a.videoFileId) : null,
        isInterested: true as const,
      })),
    );
    withMeta.sort(
      (a, b) => (b.submittedAt ?? b.createdAt) - (a.submittedAt ?? a.createdAt),
    );
    return withMeta;
  },
});

/**
 * Toggle "interested" for the (current sponsor, application) pair.
 * Lazily creates a sponsorAssignments record on first call, so sponsors
 * don't need an admin to pre-assign them — the assignment row now just
 * holds the per-sponsor "interest" bit.
 */
export const toggleSponsorInterest = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") throw new Error("غير مصرح");

    const existing = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor_application", (q) =>
        q.eq("sponsorId", user._id).eq("applicationId", args.applicationId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isInterested: !existing.isInterested });
      return;
    }

    await ctx.db.insert("sponsorAssignments", {
      sponsorId: user._id,
      applicationId: args.applicationId,
      assignedBy: user._id,
      createdAt: Date.now(),
      isInterested: true,
    });
  },
});
