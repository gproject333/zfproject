import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUser } from "./lib/auth";
import { internal } from "./_generated/api";

export const submitRequest = mutation({
  args: {},
  handler: async (ctx) => {
    const student = await requireUser(ctx);
    if (student.role !== "student") throw new Error("متاح للطلاب فقط");
    if (!student.email.endsWith("@zuj.edu.jo")) {
      throw new Error("هذه الميزة متاحة لأعضاء هيئة التدريس فقط (@zuj.edu.jo)");
    }

    // التحقق من وجود طلب سابق معلق
    const existing = await ctx.db
      .query("supervisorUpgradeRequests")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .order("desc")
      .first();
    if (existing && existing.status === "pending") {
      throw new Error("لديك طلب ترقية معلق بالفعل");
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("supervisorUpgradeRequests", {
      studentId: student._id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // إشعار لجميع الادمن
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();
    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        title: "طلب ترقية جديد",
        message: `${student.name ?? student.email} يطلب الترقية إلى مشرف`,
        type: "upgrade_request",
        read: false,
        createdAt: now,
      });
    }

    return requestId;
  },
});

export const getMyRequest = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("supervisorUpgradeRequests")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")
      .first();
  },
});

export const listRequests = query({
  args: {
    status: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let requests;
    if (args.status) {
      requests = await ctx.db
        .query("supervisorUpgradeRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("supervisorUpgradeRequests")
        .order("desc")
        .collect();
    }

    return await Promise.all(
      requests.map(async (req) => {
        const student = await ctx.db.get(req.studentId);
        return {
          ...req,
          studentName: student?.name ?? null,
          studentEmail: student?.email ?? "",
          studentCollege: student?.college ?? null,
          studentDepartment: student?.department ?? null,
        };
      }),
    );
  },
});

export const reviewRequest = mutation({
  args: {
    requestId: v.id("supervisorUpgradeRequests"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("الطلب غير موجود");
    if (request.status !== "pending") throw new Error("تم البت في هذا الطلب مسبقاً");

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: args.decision,
      reviewedBy: admin._id,
      updatedAt: now,
    });

    if (args.decision === "approved") {
      await ctx.db.patch(request.studentId, { role: "supervisor" });
    }

    // إشعار للطالب
    const student = await ctx.db.get(request.studentId);
    if (student) {
      await ctx.db.insert("notifications", {
        userId: student._id,
        title: args.decision === "approved" ? "تمت الموافقة على طلبك" : "تم رفض طلبك",
        message:
          args.decision === "approved"
            ? "تهانينا! تمت الموافقة على طلب ترقيتك إلى مشرف."
            : "عذراً، تم رفض طلب ترقيتك إلى مشرف.",
        type: "upgrade_request",
        read: false,
        createdAt: now,
      });
    }

    // تسجيل النشاط
    await ctx.runMutation(internal.activityLogs.log, {
      actorId: admin._id,
      actorName: admin.name ?? admin.email,
      actorRole: "admin",
      action:
        args.decision === "approved"
          ? `وافق على ترقية ${student?.name ?? student?.email ?? ""} إلى مشرف`
          : `رفض طلب ترقية ${student?.name ?? student?.email ?? ""}`,
      entityType: "upgradeRequest",
      entityId: args.requestId,
    });
  },
});
