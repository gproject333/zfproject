import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireAdmin } from "../lib/auth";
import { assertMaxLength } from "../lib/validation";

/**
 * Returns every application a sponsor is allowed to see — only `accepted`
 * projects (a supervisor has already approved them for incubation) —
 * together with a signed video URL so the dashboard can render an
 * Instagram-style reels feed without a second round-trip per project.
 *
 * Applications without a videoFileId are omitted (the dashboard only shows
 * reels). The list is sorted newest-submitted first.
 */
export const mySponsoredApplications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") return [];

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .collect();

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
      withVideo.map(async (a) => {
        const [videoUrl, pdfUrl] = await Promise.all([
          a.videoFileId ? ctx.storage.getUrl(a.videoFileId) : null,
          a.pdfFileId ? ctx.storage.getUrl(a.pdfFileId) : null,
        ]);
        return {
          ...a,
          videoUrl,
          pdfUrl,
          isInterested: interestMap.get(a._id) ?? false,
        };
      }),
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
    assertMaxLength("assignmentNotes", args.notes);

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

/**
 * Sponsor-callable lookup of the applicant's public-ish profile for an
 * accepted project. Mirrors the shape returned by
 * `users.admin.getStudentByApplication` so the same dialog body can render
 * both. Returns null silently for unauthorized callers or non-accepted apps.
 */
export const getStudentForAcceptedApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") return null;

    const app = await ctx.db.get(args.applicationId);
    if (!app || app.status !== "accepted") return null;

    const student = await ctx.db.get(app.studentId);
    if (!student) return null;

    const avatarUrl = student.avatar
      ? await ctx.storage.getUrl(student.avatar)
      : null;

    return {
      _id: student._id,
      name: student.name ?? null,
      email: student.email,
      studentId: student.studentId ?? null,
      college: student.college ?? null,
      department: student.department ?? null,
      phone: student.phone ?? null,
      linkedinUrl: student.linkedinUrl ?? null,
      avatarUrl,
      createdAt: student.createdAt ?? null,
    };
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
