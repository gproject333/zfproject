import { query, mutation, internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin, requireSupervisor, getOptionalSupervisor } from "../lib/auth";
import { internal } from "../_generated/api";

export const getStudentByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const caller = await getOptionalSupervisor(ctx);
    if (!caller) return null;

    const app = await ctx.db.get(args.applicationId);
    if (!app) return null;

    const student = await ctx.db.get(app.studentId);
    if (!student) return null;

    const avatarUrl = student.avatar ? await ctx.storage.getUrl(student.avatar) : null;

    // Resolve college/department name: prefer ID lookup, fall back to string.
    let collegeName: string | null = student.college ?? null;
    let deptName: string | null = student.department ?? null;
    if (student.collegeId) {
      const col = await ctx.db.get(student.collegeId);
      if (col) collegeName = col.name;
    }
    if (student.departmentId) {
      const dep = await ctx.db.get(student.departmentId);
      if (dep) deptName = dep.name;
    }

    return {
      _id: student._id,
      name: student.name ?? null,
      email: student.email,
      studentId: student.studentId ?? null,
      college: collegeName,
      department: deptName,
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
    const caller = await getOptionalSupervisor(ctx);
    if (!caller) return null;
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

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.userId);
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

// Soft cap on `.take()` for admin scans. Set high enough to cover realistic
// university size; if the dataset grows past this we switch to a denormalized
// stats document maintained by mutations.
const ADMIN_SCAN_LIMIT = 5000;

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [students, supervisors, sponsors, allApps, allAssignments] = await Promise.all([
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "student")).take(ADMIN_SCAN_LIMIT),
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "supervisor")).take(ADMIN_SCAN_LIMIT),
      ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "sponsor")).take(ADMIN_SCAN_LIMIT),
      ctx.db.query("applications").take(ADMIN_SCAN_LIMIT),
      ctx.db.query("sponsorAssignments").take(ADMIN_SCAN_LIMIT),
    ]);

    let underReview = 0, accepted = 0, rejected = 0;
    for (const a of allApps) {
      if (a.status === "under_review") underReview++;
      else if (a.status === "accepted") accepted++;
      else if (a.status === "rejected") rejected++;
    }

    return {
      totalStudents: students.length,
      totalSupervisors: supervisors.length,
      totalSponsors: sponsors.length,
      totalApplications: allApps.length,
      underReviewApplications: underReview,
      acceptedApplications: accepted,
      rejectedApplications: rejected,
      totalAssignments: allAssignments.length,
    };
  },
});

/** Counts admins that are still active — used to protect the last admin. */
async function countActiveAdmins(ctx: MutationCtx): Promise<number> {
  const admins = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .collect();
  return admins.filter((a) => a.isActive !== false).length;
}

export const toggleUserActive = mutation({
  args: { userId: v.id("users"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("المستخدم غير موجود");

    // Freezing guards: an admin must not lock themselves out, and the
    // platform must always keep at least one active admin who can manage it.
    if (!args.isActive) {
      if (args.userId === admin._id) {
        throw new ConvexError("لا يمكنك تجميد حسابك الخاص.");
      }
      if (target.role === "admin" && (await countActiveAdmins(ctx)) <= 1) {
        throw new ConvexError("لا يمكن تجميد آخر مدير فعّال في المنصّة.");
      }
    }

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

export const updateUserByAdmin = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("المستخدم غير موجود");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.department !== undefined) updates.department = args.department;
    if (args.phone !== undefined) updates.phone = args.phone;
    await ctx.db.patch(args.userId, updates);

    await ctx.runMutation(internal.activityLogs.log, {
      actorId: admin._id,
      actorName: admin.name ?? admin.email,
      actorRole: "admin",
      action: `عدّل بيانات حساب ${args.name ?? target.name ?? target.email}`,
      entityType: "user",
      entityId: args.userId,
    });
  },
});

/**
 * Hard-deletes a user and every row that belongs to them, branching by role.
 * Internal-only — the public path is the `deleteUserByAdmin` action, which
 * also removes the Clerk account and enforces the admin/self/last-admin
 * guards. Storage files (PDFs, videos, avatars) are removed too so we don't
 * leak orphaned blobs.
 */
export const deleteUserCascade = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const deleteFile = async (id: typeof user.avatar) => {
      if (id) {
        try {
          await ctx.storage.delete(id);
        } catch {
          // Blob already gone — nothing to clean up.
        }
      }
    };

    if (user.role === "student") {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_student", (q) => q.eq("studentId", args.userId))
        .collect();
      for (const app of apps) {
        const reviews = await ctx.db
          .query("applicationReviews")
          .withIndex("by_application", (q) => q.eq("applicationId", app._id))
          .collect();
        for (const r of reviews) await ctx.db.delete(r._id);

        const assignments = await ctx.db
          .query("sponsorAssignments")
          .withIndex("by_application", (q) => q.eq("applicationId", app._id))
          .collect();
        for (const a of assignments) await ctx.db.delete(a._id);

        await deleteFile(app.pdfFileId);
        await deleteFile(app.videoFileId);
        await ctx.db.delete(app._id);
      }

      const meetings = await ctx.db
        .query("meetings")
        .withIndex("by_student", (q) => q.eq("studentId", args.userId))
        .collect();
      for (const m of meetings) await ctx.db.delete(m._id);

      const upgrades = await ctx.db
        .query("supervisorUpgradeRequests")
        .withIndex("by_student", (q) => q.eq("studentId", args.userId))
        .collect();
      for (const u of upgrades) await ctx.db.delete(u._id);

      const notes = await ctx.db
        .query("studentNotes")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      for (const n of notes) await ctx.db.delete(n._id);
    } else if (user.role === "supervisor" || user.role === "admin") {
      // Don't delete students' applications they reviewed — just detach the
      // current-reviewer pointer so it isn't left dangling.
      const reviewed = await ctx.db
        .query("applications")
        .withIndex("by_reviewer", (q) => q.eq("reviewerId", args.userId))
        .collect();
      for (const app of reviewed) {
        await ctx.db.patch(app._id, { reviewerId: undefined });
      }
    } else if (user.role === "sponsor") {
      const assignments = await ctx.db
        .query("sponsorAssignments")
        .withIndex("by_sponsor", (q) => q.eq("sponsorId", args.userId))
        .collect();
      for (const a of assignments) await ctx.db.delete(a._id);
    }

    // Common per-user cleanup for every role.
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const n of notifications) await ctx.db.delete(n._id);

    const whatsappVerifications = await ctx.db
      .query("whatsappVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const w of whatsappVerifications) await ctx.db.delete(w._id);

    const whatsappOutbox = await ctx.db
      .query("whatsappOutbox")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const w of whatsappOutbox) await ctx.db.delete(w._id);

    await deleteFile(user.avatar);
    await ctx.db.delete(args.userId);
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

    // Build lookup maps to resolve IDs → names without N+1 queries.
    const allColleges = await ctx.db.query("colleges").collect();
    const allDepts = await ctx.db.query("departments").collect();
    const collegeMap = new Map(allColleges.map((c) => [c._id as string, c.name]));
    const deptMap = new Map(allDepts.map((d) => [d._id as string, d.name]));

    const filtered = students.filter((s) => {
      if (args.search) {
        const q = args.search.toLowerCase();
        if (
          !(s.name ?? "").toLowerCase().includes(q) &&
          !s.email.toLowerCase().includes(q)
        )
          return false;
      }
      // Resolve the effective college name for filtering.
      const effectiveCollege = s.collegeId
        ? (collegeMap.get(s.collegeId) ?? s.college)
        : s.college;
      const effectiveDept = s.departmentId
        ? (deptMap.get(s.departmentId) ?? s.department)
        : s.department;
      if (args.college && effectiveCollege !== args.college) return false;
      if (args.department && effectiveDept !== args.department) return false;
      return true;
    });

    // Avoid the N+1 of one applications query per student: fetch
    // applications once (bounded), then group counts in-memory.
    const allApps = await ctx.db.query("applications").take(ADMIN_SCAN_LIMIT);
    const countByStudent = new Map<string, number>();
    for (const a of allApps) {
      countByStudent.set(a.studentId, (countByStudent.get(a.studentId) ?? 0) + 1);
    }

    return filtered.map((student) => ({
      _id: student._id,
      name: student.name ?? null,
      email: student.email,
      studentId: student.studentId ?? null,
      college: student.collegeId
        ? (collegeMap.get(student.collegeId) ?? student.college ?? null)
        : (student.college ?? null),
      department: student.departmentId
        ? (deptMap.get(student.departmentId) ?? student.department ?? null)
        : (student.department ?? null),
      phone: student.phone ?? null,
      linkedinUrl: student.linkedinUrl ?? null,
      isActive: student.isActive ?? true,
      createdAt: student.createdAt ?? null,
      applicationCount: countByStudent.get(student._id) ?? 0,
    }));
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

    // Build ID → name map to resolve FK references.
    const allColleges = await ctx.db.query("colleges").collect();
    const collegeMap = new Map(allColleges.map((c) => [c._id as string, c.name]));

    const counts: Record<string, number> = {};
    for (const s of students) {
      const college = s.collegeId
        ? (collegeMap.get(s.collegeId) ?? s.college ?? "غير محدد")
        : (s.college ?? "غير محدد");
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
    const apps = await ctx.db.query("applications").take(ADMIN_SCAN_LIMIT);
    const counts = {
      under_review: 0,
      accepted: 0,
      rejected: 0,
      needs_modification: 0,
      draft: 0,
    };
    for (const a of apps) {
      if (a.status in counts) counts[a.status as keyof typeof counts]++;
    }
    return [
      { status: "قيد المراجعة", count: counts.under_review },
      { status: "مقبول", count: counts.accepted },
      { status: "مرفوض", count: counts.rejected },
      { status: "يحتاج تعديل", count: counts.needs_modification },
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

export const backfillCollegeIds = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const allColleges = await ctx.db.query("colleges").collect();
    const allDepts = await ctx.db.query("departments").collect();

    let migrated = 0;
    let skipped = 0;
    let unmatched = 0;

    for (const user of users) {
      if (user.collegeId) {
        skipped++;
        continue;
      }
      if (!user.college) {
        skipped++;
        continue;
      }
      const col = allColleges.find((c) => c.name === user.college);
      if (!col) {
        console.warn(
          `[collegeToId] No match for college="${user.college}" (user ${user._id})`
        );
        unmatched++;
        continue;
      }

      let departmentId = undefined;
      if (user.department) {
        const dep = allDepts.find(
          (d) => d.collegeId === col._id && d.name === user.department
        );
        if (dep) departmentId = dep._id;
        else {
          console.warn(
            `[collegeToId] No match for department="${user.department}" in college="${user.college}" (user ${user._id})`
          );
        }
      }

      await ctx.db.patch(user._id, {
        collegeId: col._id,
        ...(departmentId && { departmentId }),
        college: undefined,
        department: undefined,
      });
      migrated++;
    }

    const resultMsg = `[collegeToId] Done: migrated=${migrated}, skipped=${skipped}, unmatched=${unmatched}`;
    console.log(resultMsg);
    return { migrated, skipped, unmatched, message: resultMsg };
  },
});
