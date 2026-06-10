import type { ActionCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";

interface ActivityEntry {
  /** Human-readable, past-tense Arabic sentence shown in the admin feed. */
  action: string;
  entityType: string;
  entityId?: string;
  /**
   * Override the actor's stored role for this entry (e.g. force "admin"
   * when the actor row's role isn't the relevant one). Defaults to the
   * actor's own role.
   */
  role?: string;
}

/**
 * Append one row to the audit feed (`activityLogs`).
 *
 * Centralizes the actor-field extraction (`_id` / `name ?? email` / role)
 * that every call site used to repeat, so callers only pass what's unique
 * to the event. Routes through the internal `activityLogs.log` mutation —
 * the single writer of that table — so it works from both mutations and
 * actions (the latter have no `ctx.db`).
 */
export async function logActivity(
  ctx: MutationCtx | ActionCtx,
  actor: Doc<"users">,
  entry: ActivityEntry,
): Promise<void> {
  await ctx.runMutation(internal.activityLogs.log, {
    actorId: actor._id,
    actorName: actor.name ?? actor.email,
    actorRole: entry.role ?? actor.role ?? "user",
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
  });
}
