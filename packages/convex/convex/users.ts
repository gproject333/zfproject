import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const UNIVERSITY_EMAIL_DOMAINS = [
  "@zuj.edu.jo",
  "@std-zuj.edu.jo",
  "@std.zuj.edu.jo",
] as const;

function isUniversityEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return UNIVERSITY_EMAIL_DOMAINS.some((d) => lower.endsWith(d));
}

/**
 * Student emails are `<id>@std-zuj.edu.jo` or `<id>@std.zuj.edu.jo`,
 * where `<id>` is the 6-10 digit university ID. We derive it directly
 * from the email so students never have to type it during signup.
 *
 * Returns undefined for staff emails (`@zuj.edu.jo`) or any other
 * shape — those users get their `studentId` from admin provisioning
 * (or stay null for supervisors/admins/sponsors).
 */
function extractStudentIdFromEmail(email: string): string | undefined {
  const match = email.toLowerCase().match(/^(\d{6,10})@std[-.]zuj\.edu\.jo$/);
  return match ? match[1] : undefined;
}

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
      // Prefer email-derived studentId; fall back to whatever the
      // registration form passed in unsafeMetadata (legacy clients).
      const studentId =
        extractStudentIdFromEmail(email) ??
        (meta.studentId as string | undefined);
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
        // Self-registration is restricted to university email domains.
        // Sponsors/supervisors are provisioned administratively via
        // convex/users/admin.ts (insertSponsor / insertSupervisor) which
        // creates the row directly; the webhook for those users hits the
        // `existing` branch above and only syncs profile fields.
        if (!isUniversityEmail(email)) return;

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
