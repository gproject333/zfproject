import { query } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalUser } from "../lib/auth";

export const getApplication = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return null;
    const app = await ctx.db.get(args.id);
    if (!app) return null;
    if (user.role === "student" && app.studentId !== user._id) return null;
    // Sponsors can only see applications that have moved past `draft`.
    if (user.role === "sponsor" && app.status === "draft") return null;
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

    if (user.role === "student") {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_student", (q) => q.eq("studentId", user._id))
        .collect();
      return {
        total: apps.length,
        underReview: apps.filter((a) => a.status === "under_review").length,
        accepted: apps.filter((a) => a.status === "accepted").length,
        rejected: apps.filter((a) => a.status === "rejected").length,
        needsModification: apps.filter((a) => a.status === "needs_modification").length,
      };
    }

    const [underReview, accepted, rejected, needsModification] = await Promise.all([
      ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", "under_review"))
        .collect(),
      ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", "accepted"))
        .collect(),
      ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", "rejected"))
        .collect(),
      ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", "needs_modification"))
        .collect(),
    ]);

    return {
      total: underReview.length + accepted.length + rejected.length + needsModification.length,
      underReview: underReview.length,
      accepted: accepted.length,
      rejected: rejected.length,
      needsModification: needsModification.length,
    };
  },
});
