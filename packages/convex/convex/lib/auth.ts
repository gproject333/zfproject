import { ConvexError } from "convex/values";
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

/**
 * Throws if not signed in or if the account has been frozen. Returns the
 * authenticated user document. Every `require*` helper funnels through here,
 * so a frozen account (`isActive === false`) is blocked from all protected
 * queries and mutations platform-wide — the single enforcement point that
 * makes admin "تجميد" actually mean something.
 */
export async function requireUser(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await getUserFromIdentity(ctx);
  if (!user) throw new Error("غير مسجل دخول");
  if (user.isActive === false) {
    throw new ConvexError("حسابك مجمّد. يُرجى مراجعة إدارة المنصّة.");
  }
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

/**
 * Returns the user if they're a supervisor or admin, null otherwise (whether
 * signed-out or wrong role). Use in queries that should render empty rather
 * than error for unauthorized callers — e.g. dashboards where a stale client
 * may still hold a subscription after logout.
 */
export async function getOptionalSupervisor(
  ctx: AnyCtx,
): Promise<Doc<"users"> | null> {
  const user = await getUserFromIdentity(ctx);
  if (!user) return null;
  if (user.isActive === false) return null;
  if (user.role !== "supervisor" && user.role !== "admin") return null;
  return user;
}

/**
 * Returns the user if they're an admin, null otherwise.
 * Mirror of getOptionalSupervisor for admin-only read endpoints.
 */
export async function getOptionalAdmin(
  ctx: AnyCtx,
): Promise<Doc<"users"> | null> {
  const user = await getUserFromIdentity(ctx);
  if (!user) return null;
  if (user.isActive === false) return null;
  if (user.role !== "admin") return null;
  return user;
}
