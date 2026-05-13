import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/auth";

export const log = internalMutation({
  args: {
    actorId: v.id("users"),
    actorName: v.string(),
    actorRole: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const recentLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit ?? 20);
  },
});

export const paginatedLogs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    entityType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const page = await ctx.db
      .query("activityLogs")
      .withIndex("by_created")
      .order("desc")
      .paginate(args.paginationOpts);

    if (args.entityType) {
      const filterType = args.entityType;
      return {
        ...page,
        page: page.page.filter((row) => row.entityType === filterType),
      };
    }
    return page;
  },
});
