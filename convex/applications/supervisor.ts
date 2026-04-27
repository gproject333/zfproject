import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import { getOptionalUser, requireSupervisor } from "../lib/auth";
import { STATUS_LABELS, canTransition } from "../lib/statuses";
import { assertMaxLength } from "../lib/validation";
import { loadUsersMap, loadStudentsMap } from "../lib/users";

export const listApplications = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("under_review"),
        v.literal("needs_modification"),
        v.literal("accepted"),
        v.literal("rejected"),
      ),
    ),
    type: v.optional(
      v.union(
        v.literal("entrepreneurial_idea"),
        v.literal("it_graduation"),
        v.literal("university_entrepreneurial"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return { page: [], isDone: true, continueCursor: "" };
    if (user.role !== "supervisor" && user.role !== "admin") {
      throw new Error("غير مصرح — هذه الصفحة للمشرفين فقط");
    }

    if (args.type && args.status) {
      return await ctx.db
        .query("applications")
        .withIndex("by_type_status", (q) =>
          q.eq("type", args.type!).eq("status", args.status!),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }
    if (args.status) {
      return await ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    if (args.type) {
      return await ctx.db
        .query("applications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .filter((q) => q.neq(q.field("status"), "draft"))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("applications")
      .filter((q) => q.neq(q.field("status"), "draft"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listApplicationsWithStudent = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("under_review"),
        v.literal("needs_modification"),
        v.literal("accepted"),
        v.literal("rejected"),
      ),
    ),
    type: v.optional(
      v.union(
        v.literal("entrepreneurial_idea"),
        v.literal("it_graduation"),
        v.literal("university_entrepreneurial"),
      ),
    ),
    sortDir: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) {
      return {
        page: [] as (Doc<"applications"> & {
          studentName: string;
          studentDepartment: string;
        })[],
        isDone: true,
        continueCursor: "",
      };
    }
    if (user.role !== "supervisor" && user.role !== "admin") {
      throw new Error("غير مصرح — هذه الصفحة للمشرفين فقط");
    }

    const order: "asc" | "desc" = args.sortDir ?? "desc";
    let result;

    if (args.type && args.status) {
      result = await ctx.db
        .query("applications")
        .withIndex("by_type_status", (q) =>
          q.eq("type", args.type!).eq("status", args.status!),
        )
        .order(order)
        .paginate(args.paginationOpts);
    } else if (args.status) {
      result = await ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order(order)
        .paginate(args.paginationOpts);
    } else if (args.type) {
      result = await ctx.db
        .query("applications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .filter((q) => q.neq(q.field("status"), "draft"))
        .order(order)
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db
        .query("applications")
        .filter((q) => q.neq(q.field("status"), "draft"))
        .order(order)
        .paginate(args.paginationOpts);
    }

    const studentsMap = await loadStudentsMap(ctx, result.page);
    return {
      ...result,
      page: result.page.map((a) => {
        const student = studentsMap.get(a.studentId);
        return {
          ...a,
          studentName: student?.name ?? "—",
          studentDepartment: student?.department ?? "—",
        };
      }),
    };
  },
});

export const applicationsByStatus = query({
  args: {
    status: v.union(
      v.literal("under_review"),
      v.literal("needs_modification"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];
    if (user.role !== "supervisor" && user.role !== "admin") {
      throw new Error("غير مصرح — هذه الصفحة للمشرفين فقط");
    }
    return await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const recentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];
    if (user.role !== "supervisor" && user.role !== "admin") return [];

    const limit = args.limit ?? 10;
    const apps = await ctx.db
      .query("applications")
      .order("desc")
      .take(Math.max(limit * 4, 20));
    const nonDraft = apps.filter((a) => a.status !== "draft").slice(0, limit);

    const studentsMap = await loadStudentsMap(ctx, nonDraft);
    const reviewersMap = await loadUsersMap(ctx, nonDraft.map((a) => a.reviewerId));

    return nonDraft.map((a) => {
      const student = studentsMap.get(a.studentId);
      const reviewer = a.reviewerId ? reviewersMap.get(a.reviewerId) : null;
      return {
        _id: a._id,
        projectName: a.projectName,
        studentName: student?.name ?? "طالب",
        reviewerName: reviewer?.name ?? null,
        status: a.status,
        type: a.type,
        updatedAt: a.updatedAt,
        submittedAt: a.submittedAt,
        reviewedAt: a.reviewedAt,
      };
    });
  },
});

export const filterFacets = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return { departments: [] as string[] };
    if (user.role !== "supervisor" && user.role !== "admin") {
      return { departments: [] as string[] };
    }

    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();

    const departments = Array.from(
      new Set(
        students
          .map((s) => s.department)
          .filter((d): d is string => typeof d === "string" && d.length > 0),
      ),
    ).sort();

    return { departments };
  },
});

export const updateApplicationStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.union(
      v.literal("under_review"),
      v.literal("needs_modification"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    supervisorNotes: v.optional(v.string()),
    supervisorRating: v.optional(
      v.union(
        v.literal("excellent"),
        v.literal("good"),
        v.literal("average"),
        v.literal("poor"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const reviewer = await requireSupervisor(ctx);
    assertMaxLength("supervisorNotes", args.supervisorNotes);

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("الطلب غير موجود");

    if (!canTransition(app.status, args.status)) {
      throw new Error(
        `لا يمكن الانتقال من حالة "${STATUS_LABELS[app.status]}" إلى "${STATUS_LABELS[args.status]}"`,
      );
    }

    const now = Date.now();
    const patch: Record<string, unknown> = {
      status: args.status,
      reviewerId: reviewer._id,
      reviewedAt: now,
      updatedAt: now,
    };
    if (args.supervisorNotes !== undefined) patch.supervisorNotes = args.supervisorNotes;
    if (args.supervisorRating !== undefined) patch.supervisorRating = args.supervisorRating;

    await ctx.db.patch(args.id, patch);

    await ctx.db.insert("applicationReviews", {
      applicationId: args.id,
      reviewerId: reviewer._id,
      fromStatus: app.status,
      toStatus: args.status,
      notes: args.supervisorNotes,
      rating: args.supervisorRating,
      createdAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: app.studentId,
      title: "تحديث حالة الطلب",
      message: `تم تغيير حالة طلب "${app.projectName}" إلى: ${STATUS_LABELS[args.status]}`,
      type: "status_change",
      applicationId: args.id,
      read: false,
      createdAt: now,
    });
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("applications")),
    status: v.union(
      v.literal("under_review"),
      v.literal("needs_modification"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    notes: v.optional(v.string()),
    rating: v.optional(
      v.union(
        v.literal("excellent"),
        v.literal("good"),
        v.literal("average"),
        v.literal("poor"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const reviewer = await requireSupervisor(ctx);
    assertMaxLength("supervisorNotes", args.notes);

    if (args.ids.length === 0) {
      return { succeeded: [] as Id<"applications">[], skipped: [] as { id: Id<"applications">; reason: string }[] };
    }
    if (args.ids.length > 100) throw new Error("لا يمكن تحديث أكثر من 100 طلب دفعة واحدة");

    const succeeded: Id<"applications">[] = [];
    const skipped: { id: Id<"applications">; reason: string }[] = [];
    const now = Date.now();

    for (const id of args.ids) {
      const app = await ctx.db.get(id);
      if (!app) { skipped.push({ id, reason: "الطلب غير موجود" }); continue; }
      if (!canTransition(app.status, args.status)) {
        skipped.push({ id, reason: `انتقال غير مسموح من "${STATUS_LABELS[app.status]}"` });
        continue;
      }

      const patch: Record<string, unknown> = {
        status: args.status,
        reviewerId: reviewer._id,
        reviewedAt: now,
        updatedAt: now,
      };
      if (args.notes !== undefined) patch.supervisorNotes = args.notes;
      if (args.rating !== undefined) patch.supervisorRating = args.rating;

      await ctx.db.patch(id, patch);

      await ctx.db.insert("applicationReviews", {
        applicationId: id,
        reviewerId: reviewer._id,
        fromStatus: app.status,
        toStatus: args.status,
        notes: args.notes,
        rating: args.rating,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: app.studentId,
        title: "تحديث حالة الطلب",
        message: `تم تغيير حالة طلب "${app.projectName}" إلى: ${STATUS_LABELS[args.status]}`,
        type: "status_change",
        applicationId: id,
        read: false,
        createdAt: now,
      });

      succeeded.push(id);
    }

    return { succeeded, skipped };
  },
});

export const getReviewHistory = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];

    const app = await ctx.db.get(args.applicationId);
    if (!app) return [];

    const isOwner = user.role === "student" && app.studentId === user._id;
    const isSupervisor = user.role === "supervisor" || user.role === "admin";
    if (!isOwner && !isSupervisor) return [];

    const reviews = await ctx.db
      .query("applicationReviews")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();

    const reviewersMap = await loadUsersMap(ctx, reviews.map((r) => r.reviewerId));

    return reviews.map((r) => {
      const reviewer = reviewersMap.get(r.reviewerId);
      return {
        _id: r._id,
        fromStatus: r.fromStatus,
        toStatus: r.toStatus,
        notes: r.notes,
        rating: r.rating,
        createdAt: r.createdAt,
        reviewerName: reviewer?.name ?? "مشرف",
      };
    });
  },
});
