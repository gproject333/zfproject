import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

interface FanoutNotificationArgs {
  title: string;
  message: string;
  type: Doc<"notifications">["type"];
  applicationId?: Id<"applications">;
  excludeUserId?: Id<"users">;
}

export async function notifyAllSupervisors(
  ctx: MutationCtx,
  args: FanoutNotificationArgs,
): Promise<void> {
  const supervisors = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "supervisor"))
    .collect();
  const admins = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .collect();

  const now = Date.now();
  const recipients = [...supervisors, ...admins].filter(
    (u) => !args.excludeUserId || u._id !== args.excludeUserId,
  );
  await Promise.all(
    recipients.map((user) =>
      ctx.db.insert("notifications", {
        userId: user._id,
        title: args.title,
        message: args.message,
        type: args.type,
        applicationId: args.applicationId,
        read: false,
        createdAt: now,
      }),
    ),
  );
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
  const recipients = students.filter(
    (s) => !args.excludeUserId || s._id !== args.excludeUserId,
  );
  await Promise.all(
    recipients.map((student) =>
      ctx.db.insert("notifications", {
        userId: student._id,
        title: args.title,
        message: args.message,
        type: args.type,
        read: false,
        createdAt: now,
      }),
    ),
  );
}
