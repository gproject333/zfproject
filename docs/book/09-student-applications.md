# الفصل التاسع: تقديم الطلبات — applications/student.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الثامن — التحقق من المدخلات](./08-validation.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنقرأ ملف `applications/student.ts` كاملاً: كيف يُنشئ الطالب طلباً، يُعدّله، يُقدّمه، ويحذفه.

---

## الوظائف في هذا الملف

| الوظيفة | النوع | الوصف |
|---------|-------|-------|
| `myApplications` | Query | جلب طلبات الطالب الحالي |
| `createApplication` | Mutation | إنشاء طلب جديد |
| `updateApplication` | Mutation | تعديل طلب موجود |
| `submitApplication` | Mutation | تقديم الطلب للمراجعة |
| `deleteApplication` | Mutation | حذف الطلب |

---

## myApplications — جلب طلبات الطالب

```typescript
export const myApplications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    // getOptionalUser: يُعيد null إذا لم يكن مسجّلاً (بدلاً من خطأ)
    const user = await getOptionalUser(ctx);

    if (!user) {
      // غير مسجّل → نتيجة فارغة وليس خطأ
      return { page: [], isDone: true, continueCursor: "" };
    }

    // استعلام بالـ index by_student للكفاءة
    return await ctx.db
      .query("applications")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")          // الأحدث أولاً
      .paginate(args.paginationOpts);  // تقسيم إلى صفحات
  },
});
```

**لماذا `getOptionalUser` وليس `requireStudent`؟**
لأن الـ Query يجب أن يعمل حتى عند تحديث الصفحة أثناء تسجيل الخروج — يُعيد قائمة فارغة بدلاً من إلقاء خطأ يُكسر الواجهة.

**لماذا `paginate` وليس `collect`؟**
`collect()` يجلب **كل** السجلات دفعة واحدة. إذا كان للطالب 1000 طلب، هذا مشكلة. `paginate()` يجلب صفحة صفحة.

---

## createApplication — إنشاء طلب جديد

```typescript
export const createApplication = mutation({
  args: {
    // نوع المشروع — مطلوب
    type: v.union(
      v.literal("entrepreneurial_idea"),
      v.literal("it_graduation"),
      v.literal("university_entrepreneurial"),
    ),
    // حقول مطلوبة
    projectName: v.string(),
    description: v.string(),
    problemStatement: v.string(),
    targetAudience: v.string(),

    // حقول اختيارية
    teamMembers: v.optional(v.array(v.object({ name: v.string(), phone: v.string() }))),
    phone: v.optional(v.string()),
    projectGoals: v.optional(v.string()),
    projectCategory: v.optional(v.array(v.string())),
    targetLocation: v.optional(v.string()),
    supervisor: v.optional(v.string()),
    universityBenefit: v.optional(v.string()),
    pdfFileId: v.optional(v.id("_storage")),
    videoFileId: v.optional(v.id("_storage")),

    // هل تريد التقديم فوراً بدلاً من الحفظ كمسودة؟
    submitNow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. تحقق من الصلاحية: طالب مسجّل
    const student = await requireStudent(ctx);

    // 2. تحقق من الحقول النصية
    assertMaxLength("projectName", args.projectName);
    assertMaxLength("description", args.description);
    assertMaxLength("problemStatement", args.problemStatement);
    assertMaxLength("targetAudience", args.targetAudience);
    // ... باقي الحقول

    // 3. تحقق من الملفات إذا وُجدت
    if (args.pdfFileId) await assertPdfWithinLimit(ctx, args.pdfFileId);
    if (args.videoFileId) await assertVideoWithinLimit(ctx, args.videoFileId);

    // 4. إذا أراد التقديم فوراً: يجب وجود الملفين
    if (args.submitNow) assertAttachmentsPresent(args.pdfFileId, args.videoFileId);

    const now = Date.now();

    // 5. افصل submitNow عن باقي البيانات
    //    submitNow يتحكم في المنطق، لكنه لا يُخزَّن في قاعدة البيانات
    const { submitNow, ...data } = args;

    // 6. أدخل الطلب في قاعدة البيانات
    const applicationId = await ctx.db.insert("applications", {
      ...data,
      studentId: student._id,
      // الحالة تعتمد على submitNow
      status: submitNow ? "under_review" : "draft",
      createdAt: now,
      updatedAt: now,
      // submittedAt يُسجَّل فقط إذا قُدِّم فوراً
      submittedAt: submitNow ? now : undefined,
    });

    // 7. إذا قُدِّم فوراً: أشعر كل المشرفين
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
```

**النمط الذكي: `const { submitNow, ...data } = args`**

هذا يفصل `submitNow` عن باقي البيانات. `data` الآن يحتوي كل شيء إلا `submitNow`. عندما نكتب `...data` في `insert`، نتجنب إدخال `submitNow` في قاعدة البيانات حيث لا معنى له.

---

## updateApplication — تعديل الطلب

```typescript
export const updateApplication = mutation({
  args: {
    id: v.id("applications"),  // معرّف الطلب المراد تعديله
    // كل حقل اختياري — يُعدَّل فقط ما يُرسَل
    projectName: v.optional(v.string()),
    description: v.optional(v.string()),
    // ...
  },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    // نفس تحققات الحجم والطول...

    // جلب الطلب للتحقق من الملكية والحالة
    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("الطلب غير موجود");
    if (app.studentId !== student._id) throw new Error("غير مصرح");

    // فقط draft أو needs_modification يمكن تعديلهما
    if (app.status !== "draft" && app.status !== "needs_modification") {
      throw new Error("لا يمكن تعديل الطلب في هذه الحالة");
    }

    // بناء كائن التحديث — فقط الحقول الموجودة
    const { id, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = { updatedAt: Date.now() };

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) cleanUpdates[key] = val;
      // ← نتجاهل undefined لنتجنب مسح حقول غير مرادة
    }

    await ctx.db.patch(id, cleanUpdates);
  },
});
```

**النقطة المهمة:** `ctx.db.patch` يُعدّل فقط الحقول المرسَلة ولا يمس الباقي. بخلاف `ctx.db.replace` الذي يستبدل السجل كاملاً.

---

## submitApplication — تقديم الطلب

```typescript
export const submitApplication = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("الطلب غير موجود");
    if (app.studentId !== student._id) throw new Error("غير مصرح");

    // فقط draft أو needs_modification يمكن تقديمهما
    if (app.status !== "draft" && app.status !== "needs_modification") {
      throw new Error("لا يمكن تقديم طلب في هذه الحالة");
    }

    // ضمان وجود الملفين قبل التقديم
    assertAttachmentsPresent(app.pdfFileId, app.videoFileId);

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "under_review",
      updatedAt: now,
      submittedAt: now,
    });

    // رسالة مختلفة حسب ما إذا كان تقديماً أولياً أم إعادة تقديم
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
```

---

## deleteApplication — حذف الطلب

```typescript
export const deleteApplication = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("الطلب غير موجود");
    if (app.studentId !== student._id) throw new Error("غير مصرح");

    // فقط draft أو rejected يمكن حذفهما
    // لا يمكن حذف طلب قيد المراجعة أو مقبول
    if (app.status !== "draft" && app.status !== "rejected") {
      throw new Error("لا يمكن حذف طلب في هذه الحالة");
    }

    await ctx.db.delete(args.id);
  },
});
```

---

## تدفق آلة الحالة للطالب

```
createApplication(submitNow: false) → draft
createApplication(submitNow: true) → under_review
              ↓
submitApplication() → under_review
              ↓
    (ينتظر قرار المشرف)
              ↓
     needs_modification
              ↓
updateApplication() + submitApplication() → under_review مرة ثانية
```

---

## ملخص الفصل التاسع

- `myApplications` يستخدم `getOptionalUser` لإرجاع فارغ بدلاً من خطأ
- `createApplication` يدعم `submitNow` للتقديم الفوري أو الحفظ كمسودة
- التحقق يحدث **قبل** أي write لقاعدة البيانات
- `updateApplication` يُعدّل فقط الحقول غير الـ undefined
- `submitApplication` يتحقق من وجود الملفين ويُعلم المشرفين
- الطالب يمكنه فقط حذف `draft` أو `rejected`

---

**السابق:** [الفصل الثامن — التحقق من المدخلات](./08-validation.md)  
**التالي:** [الفصل العاشر — مراجعة الطلبات](./10-supervisor-applications.md)
