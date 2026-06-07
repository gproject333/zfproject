# الفصل الثامن: التحقق من المدخلات — lib/validation.ts و lib/uploads.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل السابع — ربط Clerk بـ Convex](./07-webhook-clerk.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم لماذا يجب التحقق من المدخلات مرتين (فرونت اند + باك اند)، وكيف نتحقق من أطوال الحقول وأحجام الملفات في Convex.

---

## لماذا نتحقق مرتين؟

**الفرونت اند يتحقق** لعرض أخطاء فورية للمستخدم (تجربة مستخدم جيدة).

**لكن الفرونت اند وحده لا يكفي!** أي شخص يستطيع:
- فتح أدوات المطوّر في المتصفح
- إرسال طلب مباشرة للـ API بدون استخدام الواجهة

لذا **الباك اند دائماً يتحقق بنفسه** — الباك اند هو الحارس الأخير.

```
المستخدم يملأ الاستمارة
        ↓
الفرونت اند يتحقق → يُظهر خطأ فوري (UX جيد)
        ↓
المستخدم يضغط "إرسال"
        ↓
الباك اند يتحقق مرة أخرى → الحارس الحقيقي
```

---

## lib/validation.ts — حدود الحقول

```typescript
// packages/convex/convex/lib/validation.ts

// جدول ثابت: كل حقل وعدد أقصى محروفه
export const FIELD_LIMITS = {
  // حقول الطلبات
  projectName: 120,
  description: 3000,
  problemStatement: 2000,
  targetAudience: 1000,
  projectGoals: 2000,
  supervisorNotes: 2000,
  phone: 20,
  teamMemberName: 80,

  // حقول المقالات
  articleTitle: 200,
  articleSummary: 500,
  articleBody: 50000,
  articleTag: 40,

  // حقول الإعلانات
  bannerTitle: 200,
  bannerMessage: 1000,

  // وغيرها...
} as const;
```

**`as const`** يجعل هذا الكائن للقراءة فقط — لا يمكن تغيير القيم بالخطأ.

---

### الدوال المساعدة للتحقق

```typescript
// ترجمة أسماء الحقول للعربية (للرسائل الخطأ)
const FIELD_LABELS: Record<FieldLimitKey, string> = {
  projectName: "اسم المشروع",
  description: "وصف المشروع",
  problemStatement: "المشكلة",
  // ...
};

// التحقق من حقل واحد
export function assertMaxLength(
  key: FieldLimitKey,
  value: string | undefined | null,
): void {
  if (value == null) return;  // الحقل غير موجود → لا مشكلة

  const cap = FIELD_LIMITS[key];

  if (value.length > cap) {
    // رسالة خطأ بالعربي تصل مباشرة للمستخدم
    throw new Error(`${FIELD_LABELS[key]} طويل جداً (الحد الأقصى ${cap} محرف)`);
  }
}

// التحقق من كل عناصر قائمة (مثل: قائمة الوسوم)
export function assertArrayItemsMaxLength(
  key: FieldLimitKey,
  values: readonly string[] | undefined | null,
): void {
  if (!values) return;
  for (const v of values) assertMaxLength(key, v);
}
```

---

## كيف يُستخدم في الكود الفعلي

```typescript
// في applications/student.ts
export const createApplication = mutation({
  args: { projectName: v.string(), description: v.string(), /* ... */ },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    // التحقق من كل الحقول قبل أي شيء آخر
    assertMaxLength("projectName", args.projectName);
    assertMaxLength("description", args.description);
    assertMaxLength("problemStatement", args.problemStatement);
    assertMaxLength("targetAudience", args.targetAudience);
    assertMaxLength("projectGoals", args.projectGoals);
    assertMaxLength("phone", args.phone);

    // إذا كان هناك أعضاء فريق: تحقق من كل عضو
    if (args.teamMembers) {
      for (const m of args.teamMembers) {
        assertMaxLength("teamMemberName", m.name);
        assertMaxLength("teamMemberPhone", m.phone);
      }
    }

    // تحقق من قائمة الوسوم إذا وُجدت
    assertArrayItemsMaxLength("projectCategory", args.projectCategory);

    // الآن يمكن المتابعة بأمان
    // ...
  },
});
```

**لاحظ:** إذا فشل أي `assertMaxLength`، يُرمى خطأ فوراً ويتوقف تنفيذ باقي الكود. لا حاجة لـ `if/else` معقدة.

---

## lib/uploads.ts — حدود الملفات

```typescript
// packages/convex/convex/lib/uploads.ts

// حدود أحجام الملفات
export const UPLOAD_LIMITS = {
  pdfBytes: 10 * 1024 * 1024,   // 10 ميجابايت
  videoBytes: 100 * 1024 * 1024, // 100 ميجابايت
};
```

```typescript
// جلب حجم الملف من Convex Storage
export async function fileSize(ctx: QueryCtx, fileId: Id<"_storage">): Promise<number> {
  const metadata = await ctx.storage.getMetadata(fileId);
  return metadata?.size ?? 0;
}

// التأكد من وجود كلا الملفين (PDF وفيديو)
export function assertAttachmentsPresent(
  pdfFileId: Id<"_storage"> | undefined,
  videoFileId: Id<"_storage"> | undefined,
): void {
  if (!pdfFileId || !videoFileId) {
    throw new Error("يجب إرفاق ملف PDF وفيديو تعريفي");
  }
}

// التحقق من حجم PDF
export async function assertPdfWithinLimit(
  ctx: QueryCtx,
  fileId: Id<"_storage">
): Promise<void> {
  const size = await fileSize(ctx, fileId);
  if (size > UPLOAD_LIMITS.pdfBytes) {
    throw new Error("ملف PDF يتجاوز الحد الأقصى (10 ميجابايت)");
  }
}

// التحقق من حجم الفيديو
export async function assertVideoWithinLimit(
  ctx: QueryCtx,
  fileId: Id<"_storage">
): Promise<void> {
  const size = await fileSize(ctx, fileId);
  if (size > UPLOAD_LIMITS.videoBytes) {
    throw new Error("ملف الفيديو يتجاوز الحد الأقصى (100 ميجابايت)");
  }
}
```

---

## كيف يُستخدم في الكود

```typescript
export const createApplication = mutation({
  handler: async (ctx, args) => {
    // ...

    // إذا كان هناك PDF: تحقق من حجمه
    if (args.pdfFileId) await assertPdfWithinLimit(ctx, args.pdfFileId);

    // إذا كان هناك فيديو: تحقق من حجمه
    if (args.videoFileId) await assertVideoWithinLimit(ctx, args.videoFileId);

    // إذا كان التقديم فورياً: يجب وجود كلا الملفين
    if (args.submitNow) assertAttachmentsPresent(args.pdfFileId, args.videoFileId);

    // ...
  },
});
```

---

## Convex Validators: طبقة الحماية الأولى

قبل حتى أن يصل الكود لـ `assertMaxLength`، Convex نفسه يتحقق من الأنواع:

```typescript
export const createApplication = mutation({
  args: {
    projectName: v.string(),  // ← Convex يتحقق أن هذا string
    pdfFileId: v.optional(v.id("_storage")), // ← وأن هذا ID صالح أو غائب
  },
  handler: async (ctx, args) => {
    // args.projectName هنا مضمون أنه string بفضل v.string()
  },
});
```

إذا أرسل الفرونت اند `projectName: 123` (رقم بدلاً من نص)، Convex يرفضه **قبل** أن يصل لكودك.

---

## طبقات التحقق في مشروعنا

```
طبقة 1: Convex Validators (v.string, v.number, ...)
    ← التحقق من النوع

طبقة 2: assertMaxLength / assertPdfWithinLimit
    ← التحقق من القيم

طبقة 3: منطق العمل (Business Logic)
    ← مثل: "لا يمكن تقديم طلب مرفوض"
```

---

## ملخص الفصل الثامن

- الباك اند دائماً يتحقق بنفسه — لا تعتمد على الفرونت اند وحده
- `FIELD_LIMITS` جدول ثابت لأقصى طول لكل حقل — مصدر حقيقة واحد
- `assertMaxLength(key, value)` تُرمي خطأ عربياً مباشرة إذا تجاوز الحد
- `assertAttachmentsPresent` تضمن وجود الملفين قبل التقديم
- `assertPdfWithinLimit` / `assertVideoWithinLimit` تتحقق من الأحجام
- Convex validators (v.*) هي الطبقة الأولى من الحماية

---

**السابق:** [الفصل السابع — ربط Clerk بـ Convex](./07-webhook-clerk.md)  
**التالي:** [الفصل التاسع — تقديم الطلبات](./09-student-applications.md)
