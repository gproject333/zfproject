import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const BATCH = 200;

// Delete activity log rows older than `olderThanMs` (default 90 days).
// Returns `{ deleted, isDone }`; the cron calls until isDone.
export const pruneActivityLogs = internalMutation({
  args: { olderThanMs: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.olderThanMs ?? 90 * 24 * 60 * 60 * 1000);
    const stale = await ctx.db
      .query("activityLogs")
      .withIndex("by_created", (q) => q.lt("createdAt", cutoff))
      .take(BATCH);
    await Promise.all(stale.map((row) => ctx.db.delete(row._id)));
    return { deleted: stale.length, isDone: stale.length < BATCH };
  },
});

// Delete presence rows whose lastSeenAt is older than 1 hour. Per-app
// cleanup in joinPresence misses users who never return; this catches them.
export const prunePresence = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    const stale = await ctx.db.query("applicationPresence").take(BATCH);
    const toDelete = stale.filter((r) => r.lastSeenAt < cutoff);
    await Promise.all(toDelete.map((row) => ctx.db.delete(row._id)));
    return { deleted: toDelete.length, isDone: stale.length < BATCH };
  },
});

// Delete read notifications older than 30 days.
export const pruneReadNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const batch = await ctx.db.query("notifications").take(BATCH);
    const toDelete = batch.filter((n) => n.read && n.createdAt < cutoff);
    await Promise.all(toDelete.map((row) => ctx.db.delete(row._id)));
    return { deleted: toDelete.length, isDone: batch.length < BATCH };
  },
});
