import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSupervisor, getOptionalUser } from "./lib/auth";

const RESOURCE_TYPE = v.union(
  v.literal("video"),
  v.literal("course"),
  v.literal("link"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("entrepreneurialGuide")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    type: RESOURCE_TYPE,
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);
    const now = Date.now();
    return await ctx.db.insert("entrepreneurialGuide", {
      ...args,
      createdBy: supervisor._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("entrepreneurialGuide"),
    title: v.optional(v.string()),
    type: v.optional(RESOURCE_TYPE),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    const { id, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("entrepreneurialGuide") },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    await ctx.db.delete(args.id);
  },
});
