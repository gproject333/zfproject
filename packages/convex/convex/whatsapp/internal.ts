import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const _getOutbox = internalQuery({
  args: { id: v.id("whatsappOutbox") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const _patchOutbox = internalMutation({
  args: {
    id: v.id("whatsappOutbox"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.get(args.id);
    if (!existing) return;
    await ctx.db.patch(args.id, {
      status: args.status,
      errorMessage: args.errorMessage,
      attempts: existing.attempts + 1,
      updatedAt: now,
    });
  },
});
