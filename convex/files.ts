import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireUser } from "./lib/auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: {
    id: v.id("_storage"),
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return null;

    const app = await ctx.db.get(args.applicationId);
    if (!app) return null;

    if (app.pdfFileId !== args.id && app.videoFileId !== args.id) return null;

    const isOwner = app.studentId === user._id;
    const isStaff = user.role === "supervisor" || user.role === "admin";

    let isAssignedSponsor = false;
    if (user.role === "sponsor") {
      const assignment = await ctx.db
        .query("sponsorAssignments")
        .withIndex("by_sponsor_application", (q) =>
          q.eq("sponsorId", user._id).eq("applicationId", args.applicationId),
        )
        .first();
      isAssignedSponsor = !!assignment;
    }

    if (!isOwner && !isStaff && !isAssignedSponsor) return null;

    return await ctx.storage.getUrl(args.id);
  },
});
