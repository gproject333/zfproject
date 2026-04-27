import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireAdmin } from "../lib/auth";

export const mySponsoredApplications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") return [];

    const assignments = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor", (q) => q.eq("sponsorId", user._id))
      .collect();

    const apps = await Promise.all(assignments.map((a) => ctx.db.get(a.applicationId)));
    return apps.filter(Boolean);
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

export const toggleSponsorInterest = mutation({
  args: { assignmentId: v.id("sponsorAssignments") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "sponsor") throw new Error("غير مصرح");

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("الربط غير موجود");
    if (assignment.sponsorId !== user._id) throw new Error("غير مصرح");

    await ctx.db.patch(args.assignmentId, { isInterested: !assignment.isInterested });
  },
});
