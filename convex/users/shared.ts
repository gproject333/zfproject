import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireUser } from "../lib/auth";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getOptionalUser(ctx);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    college: v.optional(v.string()),
    department: v.optional(v.string()),
    studentId: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.avatar !== undefined && user.avatar && user.avatar !== args.avatar) {
      await ctx.storage.delete(user.avatar);
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.college !== undefined) updates.college = args.college;
    if (args.department !== undefined) updates.department = args.department;
    if (args.studentId !== undefined) updates.studentId = args.studentId;
    if (args.linkedinUrl !== undefined) updates.linkedinUrl = args.linkedinUrl;
    if (args.avatar !== undefined) updates.avatar = args.avatar;

    await ctx.db.patch(user._id, updates);
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getAvatarUrl = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user?.avatar) return null;
    return await ctx.storage.getUrl(user.avatar);
  },
});
