# الفصل العاشر: مراجعة الطلبات — applications/supervisor.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل التاسع — تقديم الطلبات](./09-student-applications.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنقرأ ملف المشرف: كيف يجلب الطلبات بكفاءة، كيف يُغيّر حالتها مع تطبيق آلة الحالة، وكيف يُحدّث دفعة منها معاً.

---

## الوظائف في هذا الملف

| الوظيفة | النوع | الوصف |
|---------|-------|-------|
| `nextPendingApplication` | Query | الطلب التالي في قائمة المراجعة |
| `listApplications` | Query | قائمة الطلبات مع فلترة |
| `listApplicationsWithStudent` | Query | نفس القائمة لكن مع بيانات الطالب |
| `applicationsByStatus` | Query | كل الطلبات بحالة معينة |
| `recentActivity` | Query | آخر النشاطات على المنصة |
| `filterFacets` | Query | خيارات الفلاتر (الأقسام) |
| `updateApplicationStatus` | Mutation | تغيير حالة طلب واحد |
| `bulkUpdateStatus` | Mutation | تغيير حالة عدة طلبات دفعة واحدة |
| `getReviewHistory` | Query | تاريخ المراجعات لطلب معين |

---

## استراتيجية الـ Indexes في listApplications

هذه الوظيفة تُعلّمنا كيف نختار الـ Index المناسب حسب الفلتر:

```typescript
export const listApplications = query({
  args: {
    status: v.optional(v.union(/* ... */)),
    type: v.optional(v.union(/* ... */)),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getOptionalSupervisor(ctx);
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    // حالة 1: فلتر بالنوع والحالة معاً → استخدم composite index
    if (args.type && args.status) {
      return await ctx.db
        .query("applications")
        .withIndex("by_type_status", (q) =>
          q.eq("type", args.type!).eq("status", args.status!),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // حالة 2: فلتر بالحالة فقط → index by_status
    if (args.status) {
      return await ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // حالة 3: فلتر بالنوع فقط → index by_type + استثناء المسودات
    if (args.type) {
      return await ctx.db
        .query("applications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .filter((q) => q.neq(q.field("status"), "draft"))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // حالة 4: بدون فلتر → كل الطلبات عدا المسودات
    return await ctx.db
      .query("applications")
      .filter((q) => q.neq(q.field("status"), "draft"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

**مفهوم مهم:** `filter()` يعمل بعد جلب النتائج من الـ index. لذا يجب أن يكون الـ index هو الفلتر الأساسي، و`filter()` للتصفية الإضافية الخفيفة فقط.

---

## listApplicationsWithStudent — نمط Batch Loading

```typescript
export const listApplicationsWithStudent = query({
  handler: async (ctx, args) => {
    // ... نفس منطق listApplications ...

    const result = await /* استعلام الطلبات */;

    // جلب بيانات الطلاب بدفعة واحدة (وليس واحداً واحداً)
    const studentsMap = await loadStudentsMap(ctx, result.page);

    // دمج بيانات الطالب مع الطلب
    return {
      ...result,
      page: result.page.map((app) => {
        const student = studentsMap.get(app.studentId);
        return {
          ...app,
          studentName: student?.name ?? "—",
          studentDepartment: student?.department ?? "—",
        };
      }),
    };
  },
});
```

**لماذا `loadStudentsMap` بدلاً من `ctx.db.get` في كل iteration؟**

```
❌ الطريقة السيئة (N+1 Problem):
   لكل طلب في القائمة (100 طلب):
     ctx.db.get(طلب.studentId)  → 100 استعلام منفصل

✅ الطريقة الجيدة (Batch Loading):
   loadStudentsMap(ctx, الطلبات)  → استعلام واحد لكل الطلاب
   studentsMap.get(طلب.studentId) → O(1) من الـ Map
```

---

## updateApplicationStatus — قلب المشرف

هذه أهم Mutation في الملف:

```typescript
export const updateApplicationStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.union(/* under_review, needs_modification, accepted, rejected */),
    supervisorNotes: v.optional(v.string()),
    supervisorRating: v.optional(v.union(/* excellent, good, average, poor */)),
  },
  handler: async (ctx, args) => {
    const reviewer = await requireSupervisor(ctx);
    assertMaxLength("supervisorNotes", args.supervisorNotes);

    const app = await ctx.db.get(args.id);
    if (!app) throw new ConvexError("الطلب غير موجود");

    // ✅ تحقق من صحة الانتقال (State Machine)
    if (!canTransition(app.status, args.status)) {
      throw new ConvexError(
        `لا يمكن الانتقال من "${STATUS_LABELS[app.status]}" إلى "${STATUS_LABELS[args.status]}"`,
      );
    }

    // ✅ تحقق من وجود الملاحظة عند الرفض أو طلب التعديل
    const effectiveNotes = args.supervisorNotes ?? app.supervisorNotes ?? "";
    if (requiresStudentNote(args.status) && effectiveNotes.trim().length === 0) {
      throw new ConvexError("يجب كتابة ملاحظة للطالب عند الرفض أو طلب التعديل.");
    }

    const now = Date.now();

    // ✅ تحديث الطلب نفسه
    await ctx.db.patch(args.id, {
      status: args.status,
      reviewerId: reviewer._id,
      reviewedAt: now,
      updatedAt: now,
      ...(args.supervisorNotes !== undefined && { supervisorNotes: args.supervisorNotes }),
      ...(args.supervisorRating !== undefined && { supervisorRating: args.supervisorRating }),
    });

    // ✅ تسجيل الحدث في جدول المراجعات (Audit Trail — لا يُحذف أبداً)
    await ctx.db.insert("applicationReviews", {
      applicationId: args.id,
      reviewerId: reviewer._id,
      fromStatus: app.status,  // الحالة السابقة
      toStatus: args.status,   // الحالة الجديدة
      notes: args.supervisorNotes,
      rating: args.supervisorRating,
      createdAt: now,
    });

    // ✅ إشعار الطالب (يجب تأكيده — requireAck: true)
    await ctx.db.insert("notifications", {
      userId: app.studentId,
      title: "تحديث حالة الطلب",
      message: `تم تغيير حالة طلب "${app.projectName}" إلى: ${STATUS_LABELS[args.status]}`,
      type: "status_change",
      applicationId: args.id,
      read: false,
      requireAck: true,   // ← الطالب يجب أن يضغط "تأكيد"
      createdAt: now,
    });

    // ✅ محاولة إرسال واتساب (best-effort — لا يفشل إذا لم يكن مسجّلاً)
    await maybeSendWhatsapp(ctx, {
      userId: app.studentId,
      kind: "status_change",
      data: {
        applicationName: app.projectName,
        newStatus: args.status,
        supervisorNotes: args.supervisorNotes ?? "",
      },
    });
  },
});
```

**لاحظ السلسلة:** تغيير حالة → تسجيل في audit → إشعار داخلي → محاولة واتساب. كل هذا في mutation واحدة وهي إما تنجح كلها أو تفشل كلها.

---

## bulkUpdateStatus — تحديث جماعي

```typescript
export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("applications")),  // مصفوفة من المعرفات
    status: v.union(/* ... */),
    notes: v.optional(v.string()),
    rating: v.optional(v.union(/* ... */)),
  },
  handler: async (ctx, args) => {
    const reviewer = await requireSupervisor(ctx);

    if (args.ids.length === 0) return { succeeded: [], skipped: [] };
    if (args.ids.length > 100) throw new ConvexError("لا يمكن تحديث أكثر من 100 طلب");

    const succeeded: Id<"applications">[] = [];
    const skipped: { id: Id<"applications">; reason: string }[] = [];

    for (const id of args.ids) {
      const app = await ctx.db.get(id);

      if (!app) {
        skipped.push({ id, reason: "الطلب غير موجود" });
        continue;  // ← تخطّ هذا ولا تفشل الكل
      }

      if (!canTransition(app.status, args.status)) {
        skipped.push({ id, reason: `انتقال غير مسموح من "${STATUS_LABELS[app.status]}"` });
        continue;
      }

      // ... نفس منطق updateApplicationStatus ...
      succeeded.push(id);
    }

    return { succeeded, skipped };
  },
});
```

**نمط "Soft Failures":** بدلاً من فشل العملية كلها عند وجود طلب واحد إشكالي، نتخطّاه ونكمل الباقي. نُعيد `{ succeeded, skipped }` ليعرف الأدمن ما حدث.

---

## getReviewHistory — الحساب الشفاف

```typescript
export const getReviewHistory = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];

    const app = await ctx.db.get(args.applicationId);
    if (!app) return [];

    // التحقق من الصلاحية: الطالب يرى طلبه فقط، المشرف يرى الكل
    const isOwner = user.role === "student" && app.studentId === user._id;
    const isSupervisor = user.role === "supervisor" || user.role === "admin";
    if (!isOwner && !isSupervisor) return [];

    const reviews = await ctx.db
      .query("applicationReviews")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();

    // جلب أسماء المراجعين بدفعة واحدة
    const reviewersMap = await loadUsersMap(ctx, reviews.map((r) => r.reviewerId));

    return reviews.map((r) => ({
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      notes: r.notes,
      rating: r.rating,
      createdAt: r.createdAt,
      reviewerName: reviewersMap.get(r.reviewerId)?.name ?? "مشرف",
    }));
  },
});
```

---

## ملخص الفصل العاشر

- `listApplications` يختار الـ Index المناسب حسب الفلاتر المُعطاة
- `loadStudentsMap` يحل مشكلة N+1 بجلب كل المستخدمين دفعة واحدة
- `updateApplicationStatus` يتحقق من صحة الانتقال بـ `canTransition`
- يتطلب ملاحظة للطالب عند الرفض أو طلب التعديل (`requiresStudentNote`)
- كل تغيير حالة يُسجَّل في `applicationReviews` كـ audit trail أبدي
- `bulkUpdateStatus` يستخدم soft failures — يتخطّى الإشكاليات ويكمل الباقي

---

**السابق:** [الفصل التاسع — تقديم الطلبات](./09-student-applications.md)  
**التالي:** [الفصل الحادي عشر — الأجزاء المشتركة وآلة الحالة](./11-shared-applications.md)
