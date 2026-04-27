import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { getOptionalUser, requireUser } from "./lib/auth";
import { loadUsersMap } from "./lib/users";

const PRESENCE_WINDOW_MS = 30_000;
const PRESENCE_EVICT_MS = 60_000;

export const joinPresence = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const cutoff = now - PRESENCE_EVICT_MS;

    const rowsForApp = await ctx.db
      .query("applicationPresence")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();
    for (const row of rowsForApp) {
      if (row.lastSeenAt < cutoff) await ctx.db.delete(row._id);
    }

    const existing = await ctx.db
      .query("applicationPresence")
      .withIndex("by_user_application", (q) =>
        q.eq("userId", user._id).eq("applicationId", args.applicationId),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: now });
    } else {
      await ctx.db.insert("applicationPresence", {
        applicationId: args.applicationId,
        userId: user._id,
        lastSeenAt: now,
      });
    }
  },
});

export const leavePresence = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return;
    const existing = await ctx.db
      .query("applicationPresence")
      .withIndex("by_user_application", (q) =>
        q.eq("userId", user._id).eq("applicationId", args.applicationId),
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const getPresence = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const me = await getOptionalUser(ctx);
    if (!me) return [];

    const cutoff = Date.now() - PRESENCE_WINDOW_MS;
    const rows = await ctx.db
      .query("applicationPresence")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    const fresh = rows.filter((r) => r.lastSeenAt >= cutoff && r.userId !== me._id);
    if (fresh.length === 0) return [];

    const usersMap = await loadUsersMap(ctx, fresh.map((r) => r.userId));

    return Array.from(usersMap.entries()).map(
      ([id, u]): { userId: Id<"users">; name: string; role: string | undefined } => ({
        userId: id,
        name: u.name ?? u.email ?? "مستخدم",
        role: u.role,
      }),
    );
  },
});
