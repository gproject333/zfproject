import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

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

/**
 * Daily cron: re-dispatch outbox rows that failed in the last 24h and
 * have fewer than 3 attempts. Catches transient n8n/Evolution outages
 * without coupling the synchronous send path to retry logic. OTPs are
 * intentionally skipped — they're time-sensitive and the user can just
 * request a new code.
 */
export const retryFailed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const failed = await ctx.db
      .query("whatsappOutbox")
      .withIndex("by_status_created", (q) =>
        q.eq("status", "failed").gt("createdAt", cutoff),
      )
      .take(200);

    let scheduled = 0;
    for (const row of failed) {
      if (row.attempts >= 3) continue;
      const action =
        row.kind === "otp"
          ? null
          : row.kind === "meeting"
            ? internal.whatsapp.actions.sendMeeting
            : internal.whatsapp.actions.sendStatusChange;
      if (!action) continue;

      await ctx.db.patch(row._id, { status: "queued", updatedAt: Date.now() });
      await ctx.scheduler.runAfter(0, action, { outboxId: row._id });
      scheduled++;
    }

    console.log(`[whatsappRetry] re-queued ${scheduled} failed messages`);
    return { scheduled };
  },
});
