"use node";
import { action } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "../_generated/api";

async function createClerkUser(secretKey: string, email: string, password: string, name: string) {
  if (!secretKey) {
    throw new ConvexError("CLERK_SECRET_KEY غير مضبوط في بيئة Convex");
  }
  const { createClerkClient } = await import("@clerk/backend");
  const clerk = createClerkClient({ secretKey });
  try {
    return await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName: name,
      skipPasswordChecks: false,
    });
  } catch (e: unknown) {
    // Clerk errors come back as `{ errors: [{ message, longMessage, code }] }`.
    // We forward longMessage/message to the admin so they can see exactly
    // why Clerk rejected the signup (weak password, duplicate email, …)
    // instead of Convex's generic "internal error".
    const err = e as {
      errors?: { message?: string; longMessage?: string; code?: string }[];
      message?: string;
    };
    const msg =
      err?.errors?.[0]?.longMessage ??
      err?.errors?.[0]?.message ??
      err?.message ??
      "فشل إنشاء الحساب";
    console.error("[createClerkUser] Clerk error:", JSON.stringify(err?.errors ?? err));
    throw new ConvexError(msg);
  }
}

export const createSupervisor = action({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.shared.currentUser);
    if (!user || user.role !== "admin") throw new ConvexError("غير مصرح");

    const clerkUser = await createClerkUser(
      process.env.CLERK_SECRET_KEY!,
      args.email,
      args.password,
      args.name,
    );

    await ctx.runMutation(internal.users.admin.insertSupervisor, {
      clerkId: clerkUser.id,
      email: args.email,
      name: args.name,
      department: args.department,
      phone: args.phone,
    });
  },
});

/** Best-effort Clerk account removal — a missing/empty id is a no-op. */
async function deleteClerkUser(secretKey: string, clerkId: string) {
  if (!clerkId) return;
  if (!secretKey) throw new ConvexError("CLERK_SECRET_KEY غير مضبوط في بيئة Convex");
  const { createClerkClient } = await import("@clerk/backend");
  const clerk = createClerkClient({ secretKey });
  try {
    await clerk.users.deleteUser(clerkId);
  } catch (e: unknown) {
    // A 404 (already deleted in Clerk) is fine — the Convex side is the
    // source of truth and has already been cleaned up by the caller.
    const err = e as { status?: number; errors?: { code?: string }[] };
    if (err?.status === 404) return;
    console.error("[deleteClerkUser] Clerk error:", JSON.stringify(err?.errors ?? err));
    // Swallow other errors — the user is already gone from our app; a hard
    // failure here would block the admin even though access is revoked.
  }
}

export const deleteUserByAdmin = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await ctx.runQuery(api.users.shared.currentUser);
    if (!admin || admin.role !== "admin") throw new ConvexError("غير مصرح");
    if (admin._id === args.userId) {
      throw new ConvexError("لا يمكنك حذف حسابك الخاص.");
    }

    const target = await ctx.runQuery(api.users.admin.getUserById, {
      userId: args.userId,
    });
    if (!target) throw new ConvexError("المستخدم غير موجود");
    if (target.role === "admin") {
      const admins = await ctx.runQuery(api.users.admin.getAllUsers, { role: "admin" });
      const activeAdmins = admins.filter((a) => a.isActive !== false);
      if (activeAdmins.length <= 1) {
        throw new ConvexError("لا يمكن حذف آخر مدير فعّال في المنصّة.");
      }
    }

    // Cascade-delete app data first so access is revoked even if the Clerk
    // call later fails, then remove the Clerk account best-effort.
    await ctx.runMutation(internal.users.admin.deleteUserCascade, {
      userId: args.userId,
    });
    await deleteClerkUser(process.env.CLERK_SECRET_KEY!, target.clerkId);

    await ctx.runMutation(internal.activityLogs.log, {
      actorId: admin._id,
      actorName: admin.name ?? admin.email,
      actorRole: "admin",
      action: `حذف حساب ${target.name ?? target.email}`,
      entityType: "user",
      entityId: args.userId,
    });
  },
});

export const createSponsor = action({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.shared.currentUser);
    if (!user || user.role !== "admin") throw new ConvexError("غير مصرح");

    const clerkUser = await createClerkUser(
      process.env.CLERK_SECRET_KEY!,
      args.email,
      args.password,
      args.name,
    );

    await ctx.runMutation(internal.users.admin.insertSponsor, {
      clerkId: clerkUser.id,
      email: args.email,
      name: args.name,
      phone: args.phone,
    });
  },
});

export const createAdmin = action({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.shared.currentUser);
    if (!user || user.role !== "admin") throw new ConvexError("غير مصرح");

    const clerkUser = await createClerkUser(
      process.env.CLERK_SECRET_KEY!,
      args.email,
      args.password,
      args.name,
    );

    await ctx.runMutation(internal.users.admin.insertAdmin, {
      clerkId: clerkUser.id,
      email: args.email,
      name: args.name,
      phone: args.phone,
    });
  },
});
