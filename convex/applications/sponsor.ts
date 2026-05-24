import { query, mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireAdmin, requireSupervisor } from "../lib/auth";
import { assertMaxLength } from "../lib/validation";
import { notifyAllSupervisors } from "../lib/notifications";
import type { Doc, Id } from "../_generated/dataModel";

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
        const [videoUrl, pdfUrl, student] = await Promise.all([
          a.videoFileId ? ctx.storage.getUrl(a.videoFileId) : null,
          a.pdfFileId ? ctx.storage.getUrl(a.pdfFileId) : null,
          ctx.db.get(a.studentId),
        ]);
        const studentAvatarUrl = student?.avatar
          ? await ctx.storage.getUrl(student.avatar)
          : null;
        return {
          ...a,
          videoUrl,
          pdfUrl,
          isInterested: interestMap.get(a._id) ?? false,
          // Instagram-style identity strip on the reel — name + avatar of
          // the project owner, pre-hydrated so we don't fetch per-frame.
          student: {
            name: student?.name ?? null,
            avatarUrl: studentAvatarUrl,
          },
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
 *
 * On every off→on transition we fan out notifications to (a) the project's
 * student and (b) all supervisors/admins, so the next step happens off-
 * platform without the sponsor needing a contact button. Toggling back off
 * stays silent to avoid spam.
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
      const becomingInterested = !existing.isInterested;
      await ctx.db.patch(existing._id, {
        isInterested: becomingInterested,
        // Reset the "admin contacted" pill when the sponsor re-shows interest,
        // since the previous outreach was tied to the previous interest moment.
        ...(becomingInterested ? { adminContactedAt: undefined } : {}),
      });
      if (becomingInterested) {
        await notifyInterest(ctx, args.applicationId, user);
      }
      return;
    }

    await ctx.db.insert("sponsorAssignments", {
      sponsorId: user._id,
      applicationId: args.applicationId,
      assignedBy: user._id,
      createdAt: Date.now(),
      isInterested: true,
    });
    await notifyInterest(ctx, args.applicationId, user);
  },
});

/**
 * Sponsor's view of every project they ever liked. Returns enriched rows
 * so the interests grid can render thumbnails (via the video URL used as
 * a poster source) and the "admin contacted?" pill without secondary
 * round-trips. Sorted newest-interest-first; projects that left the
 * `accepted` state are filtered out silently.
 */
export const myInterests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") return [];

    const interests = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor", (q) => q.eq("sponsorId", user._id))
      .collect();

    const liked = interests.filter((a) => a.isInterested === true);

    const rows = await Promise.all(
      liked.map(async (a) => {
        const app = await ctx.db.get(a.applicationId);
        if (!app || app.status !== "accepted") return null;
        const videoUrl = app.videoFileId
          ? await ctx.storage.getUrl(app.videoFileId)
          : null;
        return {
          assignmentId: a._id,
          applicationId: app._id,
          projectName: app.projectName,
          type: app.type,
          description: app.description,
          videoUrl,
          interestCreatedAt: a.createdAt,
          adminContactedAt: a.adminContactedAt ?? null,
        };
      }),
    );

    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.interestCreatedAt - a.interestCreatedAt);
  },
});

/**
 * Supervisor/admin inbox: every sponsor↔project interest in the system,
 * enriched with sponsor + project metadata so the dashboard can render
 * contact info and a "تم التواصل" toggle without any per-row round trip.
 *
 * Returned newest-interest-first. Filters out rows whose sponsor or
 * application was deleted, and only includes rows where the sponsor is
 * still interested.
 */
export const allSponsorInterests = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getOptionalUser(ctx);
    if (!caller || (caller.role !== "supervisor" && caller.role !== "admin")) {
      return [];
    }

    const interests = await ctx.db.query("sponsorAssignments").collect();
    const liked = interests.filter((a) => a.isInterested === true);

    const rows = await Promise.all(
      liked.map(async (a) => {
        const [sponsor, app] = await Promise.all([
          ctx.db.get(a.sponsorId),
          ctx.db.get(a.applicationId),
        ]);
        if (!sponsor || !app) return null;
        return {
          assignmentId: a._id,
          interestCreatedAt: a.createdAt,
          adminContactedAt: a.adminContactedAt ?? null,
          sponsor: {
            _id: sponsor._id,
            name: sponsor.name ?? null,
            email: sponsor.email,
            phone: sponsor.phone ?? null,
            linkedinUrl: sponsor.linkedinUrl ?? null,
          },
          project: {
            _id: app._id,
            name: app.projectName,
            type: app.type,
            status: app.status,
            studentId: app.studentId,
          },
        };
      }),
    );

    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => {
        // Pending (not contacted) first, then by newest interest.
        const aPending = a.adminContactedAt === null ? 0 : 1;
        const bPending = b.adminContactedAt === null ? 0 : 1;
        if (aPending !== bPending) return aPending - bPending;
        return b.interestCreatedAt - a.interestCreatedAt;
      });
  },
});

/**
 * Supervisor/admin action: marks a sponsor↔project interest as "contacted",
 * which flips the sponsor-facing pill on /sponsor/interests from "بانتظار
 * الإدارة" to "الإدارة تواصلت". No notifications fired — the act of
 * reaching out is itself the user-visible feedback.
 */
export const markSponsorContacted = mutation({
  args: { assignmentId: v.id("sponsorAssignments") },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    await ctx.db.patch(args.assignmentId, { adminContactedAt: Date.now() });
  },
});

async function notifyInterest(
  ctx: MutationCtx,
  applicationId: Id<"applications">,
  sponsor: Doc<"users">,
): Promise<void> {
  const app = await ctx.db.get(applicationId);
  if (!app) return;

  const sponsorLabel = sponsor.name?.trim() || "أحد الداعمين";
  const projectLabel = app.projectName;

  // Notify the project owner. `assignment` is FYI — no ack required.
  await ctx.db.insert("notifications", {
    userId: app.studentId,
    title: "اهتمام جديد بمشروعك",
    message: `${sponsorLabel} أبدى/ت اهتماماً بمشروع "${projectLabel}". ستتواصل معك الإدارة قريباً.`,
    type: "assignment",
    applicationId,
    read: false,
    requireAck: false,
    createdAt: Date.now(),
  });

  // Notify the supervisor/admin pool so someone can broker the contact.
  await notifyAllSupervisors(ctx, {
    title: "اهتمام جديد من داعم",
    message: `${sponsorLabel} أبدى/ت اهتماماً بمشروع "${projectLabel}".`,
    type: "assignment",
    applicationId,
  });
}
