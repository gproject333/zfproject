# الفصل الحادي عشر: الأجزاء المشتركة وآلة الحالة — shared.ts و statuses.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل العاشر — مراجعة الطلبات](./10-supervisor-applications.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف تعمل آلة الحالة (State Machine) وكيف تُطبَّق في الكود، وسنرى الوظائف المشتركة بين الأدوار.

---

## lib/statuses.ts — قانون الانتقالات

هذا الملف هو "القانون" الذي يحكم حالات الطلبات:

```typescript
// packages/convex/convex/lib/statuses.ts

// الحالات الممكنة
export const APPLICATION_STATUSES = [
  "draft",
  "under_review",
  "needs_modification",
  "accepted",
  "rejected",
] as const;

// ترجمات عربية للعرض للمستخدم
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "مسودة",
  under_review: "قيد المراجعة",
  needs_modification: "يحتاج تعديل",
  accepted: "مقبول",
  rejected: "مرفوض",
};

// الحالات التي يختارها المشرف (الطالب لا يختار under_review مباشرة — يُقدّم فيصبح تلقائياً)
export const SUPERVISOR_STATUS_KEYS = [
  "under_review",
  "needs_modification",
  "accepted",
  "rejected",
] as const;
```

---

### جدول الانتقالات المسموحة

```typescript
export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft:              ["under_review"],          // الطالب يقدّم → يصبح under_review
  needs_modification: ["under_review"],          // الطالب يُعيد التقديم → يصبح under_review
  under_review:       ["needs_modification", "accepted", "rejected"], // المشرف يقرر
  accepted:           [],   // نهائي — لا انتقال ممكن
  rejected:           [],   // نهائي — لا انتقال ممكن
};

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
```

هذا الجدول هو **مصدر حقيقة واحد** — أي مكان في الكود يريد التحقق من انتقال يستخدم `canTransition()` وليس منطقاً مكرراً.

```
// مثال على الاستخدام في supervisor.ts
if (!canTransition(app.status, args.status)) {
  throw new ConvexError("انتقال غير مسموح");
}
```

---

### الحالات التي تتطلب ملاحظة للطالب

```typescript
// الحالتان اللتان يجب فيهما شرح القرار للطالب
export const NOTE_REQUIRED_STATUSES = [
  "needs_modification",  // "عدّل هذا وهذا"
  "rejected",            // "تم الرفض لأن..."
] as const;

export function requiresStudentNote(
  status: ApplicationStatus | null | undefined,
): boolean {
  return status != null && NOTE_REQUIRED_STATUSES.includes(status as any);
}
```

الفكرة: لا يجوز رفض طلب أو طلب تعديل **بدون** شرح. الطالب يستحق أن يعرف السبب.

---

## applications/shared.ts — الوظائف المشتركة

```typescript
// packages/convex/convex/applications/shared.ts

export const getApplication = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return null;

    const app = await ctx.db.get(args.id);
    if (!app) return null;

    // صلاحيات مختلفة حسب الدور:
    if (user.role === "student") {
      // الطالب يرى طلبه هو فقط
      if (app.studentId !== user._id) return null;
    } else if (user.role === "sponsor") {
      // الراعي يرى فقط الطلبات المقبولة
      if (app.status !== "accepted") return null;
    }
    // المشرف والأدمن يرون كل الطلبات

    return app;
  },
});
```

**نمط مهم:** بدلاً من رمي خطأ عند عدم الصلاحية، نُعيد `null`. هذا يتجنب تسريب معلومات (لا نُخبر الراعي بأن طلباً بـ ID معين موجود لكن غير مقبول).

---

### applicationStats — إحصاءات مختلفة حسب الدور

```typescript
export const applicationStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return null;

    const stats = {
      total: 0,
      underReview: 0,
      accepted: 0,
      rejected: 0,
      needsModification: 0,
    };

    if (user.role === "student") {
      // الطالب يرى إحصاءات طلباته هو فقط
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_student", (q) => q.eq("studentId", user._id))
        .collect();

      for (const app of apps) {
        stats.total++;
        if (app.status === "under_review") stats.underReview++;
        else if (app.status === "accepted") stats.accepted++;
        else if (app.status === "rejected") stats.rejected++;
        else if (app.status === "needs_modification") stats.needsModification++;
      }
    } else {
      // المشرف والأدمن يرون إحصاءات المنصة كلها (بدون المسودات)
      const apps = await ctx.db
        .query("applications")
        .filter((q) => q.neq(q.field("status"), "draft"))
        .collect();

      for (const app of apps) {
        stats.total++;
        // ... نفس العدّ
      }
    }

    return stats;
  },
});
```

---

## آلة الحالة — رسم بياني كامل

```
┌─────────────────────────────────────────────────────────────────┐
│                      دورة حياة الطلب                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  createApplication()          submitApplication()               │
│       ↓                              ↓                          │
│   [draft]  ─────────────────→  [under_review]                   │
│       ↑                              │                          │
│       │                     المشرف يراجع                        │
│       │                              │                          │
│       │               ┌─────────────┼─────────────┐            │
│       │               ↓             ↓             ↓            │
│       │         [needs_mod]     [accepted]    [rejected]        │
│       │               │          (نهائي)       (نهائي)         │
│       │               ↓                                        │
│       └──── الطالب يعدّل ويُعيد تقديم ────────────────→        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**الحالات النهائية:** `accepted` و `rejected` لا يمكن تغييرهما. إذا أراد الأدمن الاستثناء، يحتاج تعديلاً مباشراً في قاعدة البيانات.

---

## ملخص الفصل الحادي عشر

- `lib/statuses.ts` هو مصدر حقيقة واحد لآلة الحالة
- `canTransition(from, to)` يتحقق من صحة أي انتقال
- `requiresStudentNote(status)` يُعيد true للحالات التي تتطلب شرحاً
- `STATUS_LABELS` تُترجم الحالات للعربية في كل مكان
- `getApplication` يُعيد null بدلاً من خطأ للوصول غير المصرح (privacy by default)
- `applicationStats` تُعيد بيانات مختلفة حسب الدور

---

**السابق:** [الفصل العاشر — مراجعة الطلبات](./10-supervisor-applications.md)  
**التالي:** [الفصل الثاني عشر — الرعاة](./12-sponsor.md)
