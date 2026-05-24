import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getOptionalUser, requireUser } from "./lib/auth";

export const myNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== user._id)
      throw new Error("غير مصرح");
    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

/**
 * Explicit "I understand" for a notification flagged requireAck=true.
 * Sets both `read` and `ackedAt` so the badge and the unread count both
 * clear in one mutation. Re-running on an already-acked row is a no-op so
 * accidental double clicks don't fail.
 */
export const acknowledgeNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== user._id) {
      throw new Error("غير مصرح");
    }
    if (!notification.requireAck) {
      throw new Error("هذا الإشعار لا يتطلب تأكيداً");
    }
    if (notification.ackedAt !== undefined) return;
    await ctx.db.patch(args.id, {
      read: true,
      ackedAt: Date.now(),
    });
  },
});

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const CLEANUP_BATCH_SIZE = 100;

/**
 * Daily cron: drop notifications older than 90 days. Skips any row still
 * waiting for an acknowledgement so the user can't lose a meeting/status
 * decision they never confirmed. Self-reschedules when a batch fills up
 * so a single run can process arbitrarily long backlogs without breaking
 * Convex's per-mutation read/write limits.
 */
export const cleanupOld = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - NINETY_DAYS_MS;

    const candidates = await ctx.db
      .query("notifications")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
      .take(CLEANUP_BATCH_SIZE);

    let deleted = 0;
    for (const n of candidates) {
      if (n.requireAck === true && n.ackedAt === undefined) continue;
      await ctx.db.delete(n._id);
      deleted++;
    }

    if (candidates.length === CLEANUP_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.notifications.cleanupOld, {});
    }

    console.log(`[cleanupOld] حذف ${deleted}/${candidates.length}`);
  },
});
