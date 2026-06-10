import { query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { getOptionalUser } from "../lib/auth";
import { STATUS_LABELS, type SupervisorStatus } from "../lib/statuses";
import { maybeSendWhatsapp } from "../lib/notifications";

type SupervisorRating = "excellent" | "good" | "average" | "poor";

/**
 * Apply one reviewed status transition to an application: patch the row,
 * append the `applicationReviews` audit entry, notify the student, and
 * queue the WhatsApp dispatch.
 *
 * Shared verbatim by the single (`updateApplicationStatus`) and bulk
 * (`bulkUpdateStatus`) supervisor mutations so the side-effects of a
 * transition live in exactly one place — change what a transition does
 * here and both paths stay in lockstep. Callers MUST validate the
 * transition (`canTransition`) and the student-note requirement
 * (`requiresStudentNote`) before calling; this helper only writes.
 */
export async function writeStatusTransition(
  ctx: MutationCtx,
  app: Doc<"applications">,
  args: {
    reviewerId: Id<"users">;
    status: SupervisorStatus;
    notes?: string;
    rating?: SupervisorRating;
    now: number;
  },
): Promise<void> {
  const { reviewerId, status, notes, rating, now } = args;

  const patch: Record<string, unknown> = {
    status,
    reviewerId,
    reviewedAt: now,
    updatedAt: now,
  };
  if (notes !== undefined) patch.supervisorNotes = notes;
  if (rating !== undefined) patch.supervisorRating = rating;
  await ctx.db.patch(app._id, patch);

  await ctx.db.insert("applicationReviews", {
    applicationId: app._id,
    reviewerId,
    fromStatus: app.status,
    toStatus: status,
    notes,
    rating,
    createdAt: now,
  });

  await ctx.db.insert("notifications", {
    userId: app.studentId,
    title: "تحديث حالة الطلب",
    message: `تم تغيير حالة طلب "${app.projectName}" إلى: ${STATUS_LABELS[status]}`,
    type: "status_change",
    applicationId: app._id,
    read: false,
    requireAck: true,
    createdAt: now,
  });

  await maybeSendWhatsapp(ctx, {
    userId: app.studentId,
    kind: "status_change",
    data: {
      applicationName: app.projectName,
      newStatus: status,
      supervisorNotes: notes ?? "",
    },
  });
}

export const getApplication = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return null;
    const app = await ctx.db.get(args.id);
    if (!app) return null;
    if (user.role === "student" && app.studentId !== user._id) return null;
    // Sponsors only get to see projects that have been approved for incubation.
    if (user.role === "sponsor" && app.status !== "accepted") return null;
    return app;
  },
});

export const applicationStats = query({
  args: {},
  handler: async (ctx) => {
    const empty = {
      total: 0,
      underReview: 0,
      accepted: 0,
      rejected: 0,
      needsModification: 0,
    };

    const user = await getOptionalUser(ctx);
    if (!user) return empty;

    let apps;
    if (user.role === "student") {
      apps = await ctx.db
        .query("applications")
        .withIndex("by_student", (q) => q.eq("studentId", user._id))
        .collect();
    } else {
      apps = await ctx.db
        .query("applications")
        .filter((q) => q.neq(q.field("status"), "draft"))
        .collect();
    }

    return {
      total: apps.length,
      underReview: apps.filter((a) => a.status === "under_review").length,
      accepted: apps.filter((a) => a.status === "accepted").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      needsModification: apps.filter((a) => a.status === "needs_modification").length,
    };
  },
});
