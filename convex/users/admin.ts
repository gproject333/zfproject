import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireSupervisor, getOptionalUser } from "../lib/auth";
import { internal } from "../_generated/api";

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

export const insertSupervisor = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: "supervisor", updatedAt: Date.now() });
      return;
    }

    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "supervisor",
      department: args.department,
      phone: args.phone,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const insertSponsor = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: "sponsor", updatedAt: Date.now() });
      return;
    }

    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "sponsor",
      phone: args.phone,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
    role: v.union(
      v.literal("student"),
      v.literal("supervisor"),
      v.literal("admin"),
      v.literal("sponsor"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [
      students,
      supervisors,
      sponsors,
      underReview,
      accepted,
      rejected,
      needsModification,
      assignments,
    ] = await Promise.all([
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "student")).collect(),
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "supervisor")).collect(),
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "sponsor")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "under_review")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "accepted")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "rejected")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "needs_modification")).collect(),
      ctx.db.query("sponsorAssignments").collect(),
    ]);

    return {
      totalStudents: students.length,
      totalSupervisors: supervisors.length,
      totalSponsors: sponsors.length,
      totalApplications:
        underReview.length + accepted.length + rejected.length + needsModification.length,
      underReviewApplications: underReview.length,
      acceptedApplications: accepted.length,
      rejectedApplications: rejected.length,
      totalAssignments: assignments.length,
    };
  },
});

export const toggleUserActive = mutation({
  args: { userId: v.id("users"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    await ctx.db.patch(args.userId, { isActive: args.isActive });
    await ctx.runMutation(internal.activityLogs.log, {
      actorId: admin._id,
      actorName: admin.name ?? admin.email,
      actorRole: "admin",
      action: args.isActive
        ? `فعّل حساب ${target?.name ?? target?.email ?? ""}`
        : `جمّد حساب ${target?.name ?? target?.email ?? ""}`,
      entityType: "user",
      entityId: args.userId,
    });
  },
});

export const getStudentsWithStats = query({
  args: {
    search: v.optional(v.string()),
    college: v.optional(v.string()),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();

    const filtered = students.filter((s) => {
      if (args.search) {
        const q = args.search.toLowerCase();
        if (
          !(s.name ?? "").toLowerCase().includes(q) &&
          !s.email.toLowerCase().includes(q)
        )
          return false;
      }
      if (args.college && s.college !== args.college) return false;
      if (args.department && s.department !== args.department) return false;
      return true;
    });

    return await Promise.all(
      filtered.map(async (student) => {
        const apps = await ctx.db
          .query("applications")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .collect();
        return {
          _id: student._id,
          name: student.name ?? null,
          email: student.email,
          studentId: student.studentId ?? null,
          college: student.college ?? null,
          department: student.department ?? null,
          phone: student.phone ?? null,
          linkedinUrl: student.linkedinUrl ?? null,
          isActive: student.isActive ?? true,
          createdAt: student.createdAt ?? null,
          applicationCount: apps.length,
        };
      }),
    );
  },
});

export const getStudentDistributionByCollege = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();
    const counts: Record<string, number> = {};
    for (const s of students) {
      const college = s.college ?? "غير محدد";
      counts[college] = (counts[college] ?? 0) + 1;
    }
    return Object.entries(counts).map(([college, count]) => ({ college, count }));
  },
});

export const getMonthlyRegistrationStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();
    const now = Date.now();
    const msPerMonth = 30 * 24 * 60 * 60 * 1000;
    const months: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now - i * msPerMonth);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = 0;
    }
    for (const s of students) {
      if (!s.createdAt) continue;
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in months) months[key]++;
    }
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  },
});

export const getApplicationStatusStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [underReview, accepted, rejected, needsModification] = await Promise.all([
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "under_review")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "accepted")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "rejected")).collect(),
      ctx.db.query("applications").withIndex("by_status", (q) => q.eq("status", "needs_modification")).collect(),
    ]);
    return [
      { status: "قيد المراجعة", count: underReview.length },
      { status: "مقبول", count: accepted.length },
      { status: "مرفوض", count: rejected.length },
      { status: "يحتاج تعديل", count: needsModification.length },
    ];
  },
});

export const getSupervisorsManagement = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const supervisors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "supervisor"))
      .collect();
    const filtered = supervisors.filter((s) => {
      if (args.search) {
        const q = args.search.toLowerCase();
        return (
          (s.name ?? "").toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return filtered.map((s) => ({
      _id: s._id,
      name: s.name ?? null,
      email: s.email,
      department: s.department ?? null,
      phone: s.phone ?? null,
      linkedinUrl: s.linkedinUrl ?? null,
      isActive: s.isActive ?? true,
      createdAt: s.createdAt ?? null,
    }));
  },
});
