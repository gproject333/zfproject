import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireUser } from "./lib/auth";

export const saveNote = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("studentNotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { content: args.content, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("studentNotes", {
        userId: user._id,
        content: args.content,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getMyNote = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("studentNotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});
