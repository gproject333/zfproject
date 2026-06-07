# الفصل السابع عشر: الأنماط المشتركة — lib/ كاملاً

> **قبل هذا الفصل يجب أن تعرف:** [الفصل السادس عشر — المميزات الأخرى](./16-features.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنلخّص أهم الأنماط المستخدمة في المشروع كله، مع شرح لماذا كل نمط موجود وما المشكلة التي يحلها.

---

## 1. نمط N+1 وحله — loadUsersMap

**مشكلة N+1:** عندك 50 طلباً، وتريد عرض اسم الطالب مع كل طلب.

```typescript
// ❌ الطريقة الخاطئة: N+1 queries
const apps = await ctx.db.query("applications").take(50);
const result = [];
for (const app of apps) {
  const student = await ctx.db.get(app.studentId);  // ← استعلام لكل طلب!
  result.push({ ...app, studentName: student?.name });
}
// النتيجة: 1 (للطلبات) + 50 (للطلاب) = 51 استعلاماً!
```

```typescript
// ✅ الطريقة الصحيحة: batch loading
// lib/users.ts
export async function loadUsersMap(ctx, ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const users = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));
  const map = new Map();
  uniqueIds.forEach((id, i) => {
    if (users[i]) map.set(id, users[i]);
  });
  return map;
}

// الاستخدام:
const apps = await ctx.db.query("applications").take(50);
const studentsMap = await loadUsersMap(ctx, apps.map((a) => a.studentId));
// ← استعلامات موازية لمستخدمين فريدين فقط

const result = apps.map((app) => ({
  ...app,
  studentName: studentsMap.get(app.studentId)?.name ?? "—",
}));
// النتيجة: 1 (طلبات) + n_unique_students (موازية) استعلامات
```

---

## 2. نمط State Machine — canTransition

**المشكلة:** كيف تمنع انتقالات غير منطقية؟

```typescript
// ❌ بدون State Machine: شروط متناثرة في كل مكان
if (app.status === "draft" || app.status === "needs_modification") {
  // ... في مكان
}
if (app.status !== "accepted" && app.status !== "rejected") {
  // ... في مكان آخر
}
```

```typescript
// ✅ مع State Machine: قاعدة مركزية واحدة
export const ALLOWED_TRANSITIONS = {
  draft: ["under_review"],
  needs_modification: ["under_review"],
  under_review: ["needs_modification", "accepted", "rejected"],
  accepted: [],   // نهائي
  rejected: [],   // نهائي
};

export function canTransition(from, to) {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

// الاستخدام في كل مكان:
if (!canTransition(app.status, newStatus)) {
  throw new Error("انتقال غير مسموح");
}
```

---

## 3. نمط Transactional Outbox

**المشكلة:** إرسال WhatsApp قد يفشل، لكن لا يجب أن يُلغي تحديث قاعدة البيانات.

```
المشكلة:
  mutation → تحديث DB + إرسال WhatsApp
  إذا فشل إرسال WhatsApp: هل نُلغي تحديث DB؟ لا!

الحل (Outbox):
  mutation → تحديث DB + إضافة "queued" في outbox  ← كل هذا transaction واحدة
  action  → يقرأ outbox + يُرسل WhatsApp            ← عملية منفصلة
  cron    → يُعيد محاولة "failed"                   ← شبكة أمان
```

```
┌──────────────────────────────────────────────────┐
│  Transaction واحدة:                              │
│  ctx.db.patch(applicationId, { status: "accepted" })
│  ctx.db.insert("whatsappOutbox", { status: "queued" })
│  ctx.scheduler.runAfter(0, sendAction, { outboxId })
└──────────────────────────────────────────────────┘
          إذا فشل أي شيء هنا: كل شيء يُلغى
```

---

## 4. نمط Audit Trail الأبدي

**المشكلة:** تُحدّث حالة الطلب → تخسر تاريخ من قرر ماذا.

```
الحل: جدولان
  applications     → آخر حالة (للعرض)
  applicationReviews → كل التاريخ (append-only)

عند كل تغيير:
  1. ctx.db.patch(applicationId, { status: newStatus })     ← يُحدّث آخر حالة
  2. ctx.db.insert("applicationReviews", { fromStatus, toStatus, reviewerId, notes })
                                                            ← يُضاف للتاريخ
```

```typescript
// مثال: تسجيل في activityLogs
await ctx.runMutation(internal.activityLogs.log, {
  actorId: supervisor._id,
  actorName: supervisor.name ?? "مشرف",  // ← مُخزَّن كنص (denormalization)
  actorRole: supervisor.role,             // ← لا يتأثر بتغيير الاسم لاحقاً
  action: "updated_status",
  entityType: "application",
  entityId: applicationId,
});
```

**لماذا نخزّن `actorName` كنص وليس ID؟** لأن المستخدم قد يغيّر اسمه لاحقاً. السجل التاريخي يجب أن يبقى كما كان وقت الحدث.

---

## 5. نمط Soft Delete

```typescript
// ❌ Hard delete — يكسر الـ Foreign Keys
await ctx.db.delete(userId);
// كل applicationReviews, activityLogs, meetings مرتبطة بهذا ID → مشكلة

// ✅ Soft delete — يحافظ على السلامة
await ctx.db.patch(userId, { isActive: false });

// الاستعلام يفلتر المجمّدين
const user = await getUserFromIdentity(ctx);
if (user.isActive === false) throw new ConvexError("حسابك مجمّد");
```

---

## 6. نمط Upsert

```typescript
// "إذا وُجد: حدّث. إذا لم يوجد: أضف"
const existing = await ctx.db
  .query("studentNotes")
  .withIndex("by_user", (q) => q.eq("userId", user._id))
  .unique();

if (existing) {
  await ctx.db.patch(existing._id, { content, updatedAt: now });
} else {
  await ctx.db.insert("studentNotes", { userId: user._id, content, updatedAt: now });
}
```

**يُستخدم في:** ملاحظات الطلاب، إدراج المشرف (insertSupervisor)، تأكيد الاهتمام (toggleSponsorInterest).

---

## 7. نمط Privacy by Default (إرجاع null بدلاً من خطأ)

```typescript
// ❌ يكشف معلومات حساسة
export const getApplication = query({
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("غير موجود");
    if (user.role === "sponsor" && app.status !== "accepted") {
      throw new Error("الطلب غير مقبول");
      // ← يُخبر الراعي أن طلباً بهذا ID موجود لكن غير مقبول
    }
  },
});

// ✅ لا يكشف شيئاً
export const getApplication = query({
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.id);
    if (!app) return null;
    if (user.role === "sponsor" && app.status !== "accepted") {
      return null;  // ← كأن الطلب لا يوجد من منظور الراعي
    }
    return app;
  },
});
```

---

## 8. نمط Minimum Exposure

عند إرجاع بيانات المستخدم لطرف ثالث:

```typescript
// ❌ إرجاع كل شيء
return student;
// يشمل: clerkId, isActive, whatsappOptOut, createdAt, ...

// ✅ إرجاع الحد الأدنى فقط
return {
  name: student.name,
  email: student.email,
  phone: student.phone,
  linkedinUrl: student.linkedinUrl,
  // فقط ما يحتاجه الراعي
};
```

---

## 9. نمط واحد لـ Date.now()

```typescript
// ❌ استدعاء Date.now() عدة مرات قد يعطي قيماً مختلفة
await ctx.db.patch(id, { updatedAt: Date.now() });
await ctx.db.insert("applicationReviews", { createdAt: Date.now() });
// ← وقتان مختلفان!

// ✅ استدعاء مرة واحدة وتخزينه
const now = Date.now();
await ctx.db.patch(id, { updatedAt: now });
await ctx.db.insert("applicationReviews", { createdAt: now });
// ← نفس الوقت بالضبط
```

---

## جدول ملخص الأنماط

| النمط | المشكلة التي يحل | أين يُستخدم |
|-------|-----------------|------------|
| Batch Loading (loadUsersMap) | N+1 queries | كل query يُثري بيانات المستخدمين |
| State Machine (canTransition) | انتقالات غير منطقية | applications |
| Transactional Outbox | الإرسال الموثوق | whatsappOutbox |
| Audit Trail (applicationReviews) | فقدان التاريخ | كل تغيير حالة |
| Soft Delete | كسر Foreign Keys | users |
| Upsert | سجل مكرر | studentNotes, insertSupervisor |
| Privacy by Default (null) | تسريب معلومات | getApplication |
| Minimum Exposure | بيانات زائدة | getStudentForAcceptedApplication |
| استدعاء Date.now() مرة | تناقض أوقات | كل mutation |

---

## ملخص الفصل السابع عشر

هذه الأنماط ليست مجرد "طرق" — هي **قرارات** تصميمية واعية بناها المشروع:

- **Batch Loading** = لا تدفع ثمن N+1 queries بدون داعٍ
- **State Machine** = الأعمال لها قوانين، طبّقها في كود مركزي
- **Outbox** = قاعدة البيانات أوثق من الشبكة
- **Audit Trail** = ما حدث لا يُمحى أبداً
- **Soft Delete** = البيانات ذات قيمة حتى بعد "الحذف"

---

**السابق:** [الفصل السادس عشر — المميزات الأخرى](./16-features.md)  
**التالي:** [الفصل الثامن عشر — النشر](./18-deployment.md)
