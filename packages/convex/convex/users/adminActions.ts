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
