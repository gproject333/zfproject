import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const handleClerkWebhook = internalMutation({
  args: {
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, { type, data }) => {
    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id as string;
      const email =
        (data.email_addresses as { email_address: string }[])?.[0]
          ?.email_address ?? "";
      const name =
        `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || undefined;
      const phone = (data.phone_numbers as { phone_number: string }[])?.[0]
        ?.phone_number;

      const meta = (data.unsafe_metadata ?? {}) as Record<string, string>;
      const studentId = meta.studentId as string | undefined;
      const college = meta.college as string | undefined;
      const department = meta.department as string | undefined;

      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          email,
          name,
          phone,
          isActive: true,
          ...(studentId !== undefined && { studentId }),
          ...(college !== undefined && { college }),
          ...(department !== undefined && { department }),
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("users", {
          clerkId,
          email,
          name,
          phone,
          role: "student",
          studentId,
          college,
          department,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    if (type === "user.deleted") {
      const clerkId = data.id as string;
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { isActive: false, updatedAt: Date.now() });
      }
    }
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();
  },
});
