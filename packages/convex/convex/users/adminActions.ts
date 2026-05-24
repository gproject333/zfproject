"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";

async function createClerkUser(secretKey: string, email: string, password: string, name: string) {
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
    const err = e as { errors?: { message?: string; longMessage?: string }[] };
    const msg =
      err?.errors?.[0]?.longMessage ??
      err?.errors?.[0]?.message ??
      "فشل إنشاء الحساب";
    throw new Error(msg);
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
    if (!user || user.role !== "admin") throw new Error("غير مصرح");

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
    if (!user || user.role !== "admin") throw new Error("غير مصرح");

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
