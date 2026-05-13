import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { getOptionalUser, requireUser } from "./lib/auth";

const NOTIFICATION_TYPE = v.union(
  v.literal("status_change"),
  v.literal("new_note"),
  v.literal("new_application"),
  v.literal("assignment"),
  v.literal("announcement"),
  v.literal("system"),
  v.literal("upgrade_request"),
);

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
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

export const paginatedNotifications = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filter: v.optional(
      v.union(v.literal("all"), v.literal("unread"), NOTIFICATION_TYPE),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    if (args.filter === "unread") {
      return await ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) =>
          q.eq("userId", user._id).eq("read", false),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const page = await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    if (args.filter && args.filter !== "all") {
      const filterType = args.filter;
      return { ...page, page: page.page.filter((n) => n.type === filterType) };
    }

    return page;
  },
});

export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== user._id) {
      throw new Error("غير مصرح");
    }
    await ctx.db.delete(args.id);
  },
});
