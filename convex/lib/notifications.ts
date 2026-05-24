import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

interface FanoutNotificationArgs {
  title: string;
  message: string;
  type: Doc<"notifications">["type"];
  applicationId?: Id<"applications">;
  excludeUserId?: Id<"users">;
}

/**
 * Fan a notification out to every supervisor. Used for events tied to the
 * supervisor's review workflow: new applications, resubmissions, sponsor
 * interest that needs brokering. Admins are NOT included here — they
 * shouldn't see every application-level event. Use `notifyAllAdmins` for
 * the rare cases that genuinely need their attention (e.g., upgrade
 * requests).
 */
export async function notifyAllSupervisors(
  ctx: MutationCtx,
  args: FanoutNotificationArgs,
): Promise<void> {
  const supervisors = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "supervisor"))
    .collect();

  const now = Date.now();
  for (const user of supervisors) {
    if (args.excludeUserId && user._id === args.excludeUserId) continue;
    await ctx.db.insert("notifications", {
      userId: user._id,
      title: args.title,
      message: args.message,
      type: args.type,
      applicationId: args.applicationId,
      read: false,
      createdAt: now,
    });
  }
}

/**
 * Fan a notification out to every admin. Reserve for events the admin
 * actually needs to act on — system-wide concerns, supervisor upgrade
 * requests, escalations. Day-to-day application traffic stays out.
 */
export async function notifyAllAdmins(
  ctx: MutationCtx,
  args: FanoutNotificationArgs,
): Promise<void> {
  const admins = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .collect();

  const now = Date.now();
  for (const user of admins) {
    if (args.excludeUserId && user._id === args.excludeUserId) continue;
    await ctx.db.insert("notifications", {
      userId: user._id,
      title: args.title,
      message: args.message,
      type: args.type,
      applicationId: args.applicationId,
      read: false,
      createdAt: now,
    });
  }
}

export async function notifyAllStudents(
  ctx: MutationCtx,
  args: Omit<FanoutNotificationArgs, "applicationId">,
): Promise<void> {
  const students = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "student"))
    .collect();

  const now = Date.now();
  for (const student of students) {
    if (args.excludeUserId && student._id === args.excludeUserId) continue;
    await ctx.db.insert("notifications", {
      userId: student._id,
      title: args.title,
      message: args.message,
      type: args.type,
      read: false,
      createdAt: now,
    });
  }
}
