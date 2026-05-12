import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireStudent, getOptionalUser } from "../lib/auth";
import { assertArrayItemsMaxLength, assertMaxLength } from "../lib/validation";
import { notifyAllSupervisors } from "../lib/notifications";

export const myApplications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return { page: [], isDone: true, continueCursor: "" };
    return await ctx.db
      .query("applications")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const createApplication = mutation({
  args: {
    type: v.union(
      v.literal("entrepreneurial_idea"),
      v.literal("it_graduation"),
      v.literal("university_entrepreneurial"),
    ),
    projectName: v.string(),
    description: v.string(),
    problemStatement: v.string(),
    targetAudience: v.string(),
    teamMembers: v.optional(
      v.array(v.object({ name: v.string(), phone: v.string() })),
    ),
    phone: v.optional(v.string()),
    projectGoals: v.optional(v.string()),
    projectCategory: v.optional(v.array(v.string())),
    targetLocation: v.optional(v.string()),
    supervisor: v.optional(v.string()),
    universityBenefit: v.optional(v.string()),
    pdfFileId: v.optional(v.id("_storage")),
    videoFileId: v.optional(v.id("_storage")),
    submitNow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    assertMaxLength("projectName", args.projectName);
    assertMaxLength("description", args.description);
    assertMaxLength("problemStatement", args.problemStatement);
    assertMaxLength("targetAudience", args.targetAudience);
    assertMaxLength("projectGoals", args.projectGoals);
    assertMaxLength("universityBenefit", args.universityBenefit);
    assertMaxLength("targetLocation", args.targetLocation);
    assertMaxLength("supervisor", args.supervisor);
    assertMaxLength("phone", args.phone);
    assertArrayItemsMaxLength("projectCategory", args.projectCategory);
    if (args.teamMembers) {
      for (const m of args.teamMembers) {
        assertMaxLength("teamMemberName", m.name);
        assertMaxLength("teamMemberPhone", m.phone);
      }
    }

    const now = Date.now();
    const { submitNow, ...data } = args;

    const applicationId = await ctx.db.insert("applications", {
      ...data,
      studentId: student._id,
      status: submitNow ? "under_review" : "draft",
      submitted: submitNow,
      createdAt: now,
      updatedAt: now,
      submittedAt: submitNow ? now : undefined,
    });

    if (submitNow) {
      await notifyAllSupervisors(ctx, {
        title: "طلب جديد بانتظار المراجعة",
        message: `قدّم ${student.name ?? "طالب"} طلباً جديداً: "${args.projectName}"`,
        type: "new_application",
        applicationId,
      });
    }

    return applicationId;
  },
});

export const updateApplication = mutation({
  args: {
    id: v.id("applications"),
    projectName: v.optional(v.string()),
    description: v.optional(v.string()),
    problemStatement: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    teamMembers: v.optional(
      v.array(v.object({ name: v.string(), phone: v.string() })),
    ),
    phone: v.optional(v.string()),
    projectGoals: v.optional(v.string()),
    projectCategory: v.optional(v.array(v.string())),
    targetLocation: v.optional(v.string()),
    supervisor: v.optional(v.string()),
    universityBenefit: v.optional(v.string()),
    pdfFileId: v.optional(v.id("_storage")),
    videoFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    assertMaxLength("projectName", args.projectName);
    assertMaxLength("description", args.description);
    assertMaxLength("problemStatement", args.problemStatement);
    assertMaxLength("targetAudience", args.targetAudience);
    assertMaxLength("projectGoals", args.projectGoals);
    assertMaxLength("universityBenefit", args.universityBenefit);
    assertMaxLength("targetLocation", args.targetLocation);
    assertMaxLength("supervisor", args.supervisor);
    assertMaxLength("phone", args.phone);
    assertArrayItemsMaxLength("projectCategory", args.projectCategory);
    if (args.teamMembers) {
      for (const m of args.teamMembers) {
        assertMaxLength("teamMemberName", m.name);
        assertMaxLength("teamMemberPhone", m.phone);
      }
    }

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("الطلب غير موجود");
    if (app.studentId !== student._id) throw new Error("غير مصرح");
    if (app.status !== "draft" && app.status !== "needs_modification")
      throw new Error("لا يمكن تعديل الطلب في هذه الحالة");

    const { id, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) cleanUpdates[key] = val;
    }

    await ctx.db.patch(id, cleanUpdates);
  },
});

export const submitApplication = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("الطلب غير موجود");
    if (app.studentId !== student._id) throw new Error("غير مصرح");
    if (app.status !== "draft" && app.status !== "needs_modification")
      throw new Error("لا يمكن تقديم طلب في هذه الحالة");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "under_review",
      submitted: true,
      updatedAt: now,
      submittedAt: now,
    });

    const isResubmission = app.status === "needs_modification";
    await notifyAllSupervisors(ctx, {
      title: isResubmission ? "إعادة تقديم بعد التعديل" : "طلب جديد بانتظار المراجعة",
      message: isResubmission
        ? `أعاد ${student.name ?? "طالب"} تقديم طلب "${app.projectName}" بعد التعديل`
        : `قدّم ${student.name ?? "طالب"} طلباً جديداً: "${app.projectName}"`,
      type: "new_application",
      applicationId: args.id,
    });
  },
});

export const deleteApplication = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("الطلب غير موجود");
    if (app.studentId !== student._id) throw new Error("غير مصرح");
    if (app.status !== "draft" && app.status !== "rejected")
      throw new Error("لا يمكن حذف طلب في هذه الحالة");

    await ctx.db.delete(args.id);
  },
});
