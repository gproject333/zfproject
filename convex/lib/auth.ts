import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx;

async function getUserFromIdentity(ctx: AnyCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

/** Throws if not signed in. Returns the authenticated user document. */
export async function requireUser(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await getUserFromIdentity(ctx);
  if (!user) throw new Error("غير مسجل دخول");
  return user;
}

/** Throws unless the caller is a supervisor or admin. */
export async function requireSupervisor(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "supervisor" && user.role !== "admin") {
    throw new Error("غير مصرح — هذه الصفحة للمشرفين فقط");
  }
  return user;
}

/** Throws unless the caller is an admin. */
export async function requireAdmin(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new Error("غير مصرح — هذه الصفحة للمدراء فقط");
  }
  return user;
}

/** Throws unless the caller is a student. */
export async function requireStudent(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "student") {
    throw new Error("يجب أن تكون طالباً للقيام بهذا الإجراء");
  }
  return user;
}

/**
 * Returns null instead of throwing when unauthenticated.
 * Useful for queries that should gracefully return empty for signed-out users.
 */
export async function getOptionalUser(
  ctx: AnyCtx,
): Promise<Doc<"users"> | null> {
  return getUserFromIdentity(ctx);
}
