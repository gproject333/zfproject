import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireSupervisor, getOptionalUser } from "../lib/auth";

export const getStudentByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const caller = await getOptionalUser(ctx);
    if (!caller || (caller.role !== "admin" && caller.role !== "supervisor")) return null;

    const app = await ctx.db.get(args.applicationId);
    if (!app) return null;

    const student = await ctx.db.get(app.studentId);
    if (!student) return null;

    const avatarUrl = student.avatar ? await ctx.storage.getUrl(student.avatar) : null;

    return {
      _id: student._id,
      name: student.name ?? null,
      email: student.email,
      studentId: student.studentId ?? null,
      college: student.college ?? null,
      department: student.department ?? null,
      phone: student.phone ?? null,
      linkedinUrl: student.linkedinUrl ?? null,
      avatarUrl,
      createdAt: student.createdAt ?? null,
    };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const caller = await getOptionalUser(ctx);
    if (!caller || (caller.role !== "admin" && caller.role !== "supervisor")) return null;
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("student"),
      v.literal("supervisor"),
      v.literal("admin"),
      v.literal("sponsor"),
    ),
  },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const createUserByAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("supervisor"), v.literal("sponsor")),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("الإيميل مسجل مسبقاً");

    return await ctx.db.insert("users", {
      clerkId: "",
      email: args.email,
      name: args.name,
      role: args.role,
      department: args.department,
      phone: args.phone,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getAllUsers = query({
  args: {
    role: v.optional(
      v.union(
        v.literal("student"),
        v.literal("supervisor"),
        v.literal("admin"),
        v.literal("sponsor"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.role) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    }
    return await ctx.db.query("users").collect();
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [allUsers, allApps, allAssignments] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("applications").collect(),
      ctx.db.query("sponsorAssignments").collect(),
    ]);

    return {
      totalStudents: allUsers.filter((u) => u.role === "student").length,
      totalSupervisors: allUsers.filter((u) => u.role === "supervisor").length,
      totalSponsors: allUsers.filter((u) => u.role === "sponsor").length,
      totalApplications: allApps.length,
      underReviewApplications: allApps.filter((a) => a.status === "under_review").length,
      acceptedApplications: allApps.filter((a) => a.status === "accepted").length,
      rejectedApplications: allApps.filter((a) => a.status === "rejected").length,
      totalAssignments: allAssignments.length,
    };
  },
});

export const toggleUserActive = mutation({
  args: { userId: v.id("users"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isActive: args.isActive });
  },
});
