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
    // Sponsors can see any application that has been submitted (i.e. moved
    // out of the student-only `draft` stage). No admin assignment required.
    const isSponsorViewing = user.role === "sponsor" && app.status !== "draft";

    if (!isOwner && !isStaff && !isSponsorViewing) return null;

    return await ctx.storage.getUrl(args.id);
  },
});
