import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireUser } from "../lib/auth";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getOptionalUser(ctx);
  },
});

/**
 * Profile fields the user can edit themselves.
 *
 * `studentId` is derived from the email at signup (`users.ts` webhook)
 * and not editable here. For students, `phone` is owned by the
 * WhatsApp OTP flow (`whatsapp.ts`) and the manual phone field on the
 * profile page is gone — but sponsors/supervisors still set it via
 * this mutation since they don't go through OTP verification.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    college: v.optional(v.string()),
    department: v.optional(v.string()),
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
    // Students get their phone via the WhatsApp OTP flow and never
    // arrive here with a `phone` argument (the manual field on the
    // student profile UI was removed). Honoring it for everyone else
    // keeps sponsor/supervisor flows working.
    if (args.phone !== undefined && user.role !== "student") {
      updates.phone = args.phone;
    }
    if (args.college !== undefined) updates.college = args.college;
    if (args.department !== undefined) updates.department = args.department;
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
