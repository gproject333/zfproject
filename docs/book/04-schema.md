# الفصل الرابع: قاعدة البيانات — schema.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الثالث — بنية المشروع](./03-project-structure.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنقرأ ملف `schema.ts` كاملاً ونفهم كيف يُعرَّف كل جدول، ما هي الـ indexes ولماذا نحتاجها، وكيف ربطنا الجداول ببعضها.

---

## ما هو schema.ts؟

هو الملف الذي يُعرّف **شكل قاعدة البيانات بالكامل**. فكّر فيه كمخطط البناء — قبل أن تبني، ترسم الخطة.

في Convex، قاعدة البيانات NoSQL (مثل MongoDB)، لكن Convex يجبرك على تعريف الـ schema مسبقاً لتحصل على:
- Type safety (TypeScript يعرف شكل كل جدول)
- التحقق التلقائي من البيانات قبل الحفظ
- Indexes سريعة

---

## بنية الملف

```typescript
// packages/convex/convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // الجداول هنا...
  users: defineTable({ ... }),
  applications: defineTable({ ... }),
  // ...
});
```

**كل جدول = `defineTable({ ... })`** يحتوي على تعريف الحقول.

---

## الجدول الأول: users

```typescript
users: defineTable({
  // هوية المستخدم في Clerk
  clerkId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),

  // الدور — يتحكم بكل صلاحيات المنصة
  role: v.optional(v.union(
    v.literal("student"),
    v.literal("supervisor"),
    v.literal("admin"),
    v.literal("sponsor")
  )),

  // حقول الطالب
  studentId: v.optional(v.string()),
  collegeId: v.optional(v.id("colleges")),    // FK إلى جدول colleges
  departmentId: v.optional(v.id("departments")), // FK إلى جدول departments

  // حقول الاتصال
  phone: v.optional(v.string()),
  avatar: v.optional(v.id("_storage")),       // FK إلى تخزين Convex
  linkedinUrl: v.optional(v.string()),

  // إعدادات النظام
  isActive: v.optional(v.boolean()),
  whatsappVerified: v.optional(v.boolean()),
  whatsappOptOut: v.optional(v.boolean()),

  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_clerkId", ["clerkId"])   // للبحث بـ Clerk ID
  .index("email", ["email"])           // للبحث بالإيميل
  .index("phone", ["phone"])           // للبحث برقم الهاتف
  .index("by_role", ["role"])          // لجلب كل الطلاب أو كل المشرفين
  .index("by_studentId", ["studentId"])// للبحث برقم الطالب الجامعي
```

**لاحظ:**
- `v.id("colleges")` = مرجع لسجل في جدول `colleges` (مثل Foreign Key)
- `v.id("_storage")` = مرجع لملف في Convex Storage
- `v.optional(...)` = الحقل يمكن أن يكون غائباً (لا نستخدم `null` أو string فارغة)

---

## الجدول الأهم: applications

```typescript
applications: defineTable({
  studentId: v.id("users"),    // من قدّم الطلب

  // نوع المشروع
  type: v.union(
    v.literal("entrepreneurial_idea"),
    v.literal("it_graduation"),
    v.literal("university_entrepreneurial"),
  ),

  // الحالة — آلة الحالة (State Machine)
  status: v.union(
    v.literal("draft"),
    v.literal("under_review"),
    v.literal("needs_modification"),
    v.literal("accepted"),
    v.literal("rejected")
  ),

  // حقول مشتركة لكل الأنواع
  projectName: v.string(),
  description: v.string(),
  problemStatement: v.string(),
  targetAudience: v.string(),
  teamMembers: v.optional(v.array(v.object({
    name: v.string(),
    phone: v.string(),
  }))),

  // حقول اختيارية حسب النوع
  projectGoals: v.optional(v.string()),       // للـ entrepreneurial + it_graduation
  supervisor: v.optional(v.string()),         // للـ it_graduation فقط
  universityBenefit: v.optional(v.string()),  // للـ university_entrepreneurial فقط

  // الملفات المرفقة
  pdfFileId: v.optional(v.id("_storage")),
  videoFileId: v.optional(v.id("_storage")),

  // بيانات المراجعة (آخر مراجعة فقط — التاريخ الكامل في applicationReviews)
  reviewerId: v.optional(v.id("users")),
  supervisorNotes: v.optional(v.string()),
  supervisorRating: v.optional(v.union(
    v.literal("excellent"), v.literal("good"),
    v.literal("average"), v.literal("poor")
  )),

  createdAt: v.number(),
  updatedAt: v.number(),
  submittedAt: v.optional(v.number()),
})
  .index("by_student", ["studentId"])
  .index("by_status", ["status"])
  .index("by_type", ["type"])
  .index("by_reviewer", ["reviewerId"])
  .index("by_student_status", ["studentId", "status"])
  .index("by_type_status", ["type", "status"])
```

---

## ما هي الـ Indexes ولماذا نحتاجها؟

تخيّل عندك 100,000 طلب في قاعدة البيانات. إذا أردت جلب طلبات طالب معين **بدون index**:

```
Convex يفحص كل 100,000 طلب واحداً واحداً ← بطيء جداً
```

**مع index:**
```
Convex يذهب مباشرة للطلبات المرتبطة بهذا الطالب ← سريع جداً
```

```typescript
.index("by_student", ["studentId"])
//      ↑ اسم الـ index    ↑ الحقل المفهرس
```

الاسم التقليدي في مشروعنا: `by_<اسم_الحقل>` أو `by_<حقل1>_<حقل2>` للـ composite index.

**Composite index** (فهرس مركّب) يسمح بالبحث بحقلين معاً بكفاءة:
```typescript
.index("by_student_status", ["studentId", "status"])
// يسمح بـ: "أعطني طلبات الطالب X التي حالتها draft"
```

---

## Audit Trail: جدول applicationReviews

هذا الجدول مثير للاهتمام. لاحظ أن جدول `applications` يحتفظ بـ `reviewerId` و `supervisorNotes` — لكن هذه تُمثّل **آخر** مراجعة فقط. ماذا لو أراد الأدمن رؤية تاريخ كل القرارات؟

الحل: جدول منفصل **append-only** (لا تُحذف منه أبداً):

```typescript
applicationReviews: defineTable({
  applicationId: v.id("applications"),
  reviewerId: v.id("users"),
  fromStatus: v.union(/* الحالات */),
  toStatus: v.union(/* الحالات بدون draft */),
  notes: v.optional(v.string()),
  rating: v.optional(v.union(/* التقييمات */)),
  createdAt: v.number(),
})
  .index("by_application", ["applicationId"])
  .index("by_reviewer", ["reviewerId"])
```

**كل تغيير حالة = سجل جديد هنا.** يمكنك دائماً معرفة "من قرر ماذا ومتى".

---

## نمط Outbox: جدول whatsappOutbox

```typescript
whatsappOutbox: defineTable({
  userId: v.id("users"),
  phone: v.string(),
  kind: v.union(
    v.literal("otp"),
    v.literal("meeting"),
    v.literal("status_change"),
  ),
  payload: v.any(),        // بيانات الرسالة
  status: v.union(
    v.literal("queued"),   // في الانتظار
    v.literal("sent"),     // أُرسلت
    v.literal("failed"),   // فشلت
  ),
  attempts: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_status_created", ["status", "createdAt"])
```

هذا يُسمى **Transactional Outbox Pattern**. الفكرة:
1. عند الرغبة بإرسال واتساب، أضف سجلاً بـ `status: "queued"` أولاً
2. ثم حاول الإرسال
3. إذا نجح: غيّر لـ `"sent"`، إذا فشل: غيّر لـ `"failed"`

لماذا؟ لأن الـ Mutation تعمل في transaction — إذا فشل الإرسال بعدها، يبقى السجل `"queued"` وستحاول مرة أخرى. لن تضيع أي رسالة.

---

## باقي الجداول — نظرة سريعة

| الجدول | الوصف |
|--------|-------|
| `notifications` | صندوق الإشعارات لكل مستخدم |
| `sponsorAssignments` | many-to-many: راعي ↔ مشروع |
| `studentNotes` | ملاحظة خاصة واحدة لكل طالب |
| `banners` | الإعلانات على الموقع |
| `articles` | مقالات يكتبها المشرف |
| `meetings` | اللقاءات بين المشرف والطالب |
| `colleges` | الكليات |
| `departments` | الأقسام (كل قسم تابع لكلية) |
| `activityLogs` | سجل audit لكل الأحداث |
| `supervisorUpgradeRequests` | طلبات الطلاب لتصبح مشرفين |
| `whatsappVerifications` | رموز OTP للتحقق من واتساب |
| `entrepreneurialGuide` | موارد تعليمية للطلاب |
| `socialLinks` | روابط التواصل الاجتماعي |

---

## قاعدة تصميم مهمة: v.optional() وليس sentinel values

في قواعد البيانات التقليدية، بعض المطوّرين يستخدمون:
- string فارغة `""` لتمثيل "غير موجود"
- الرقم `-1` لتمثيل "غير محدد"

في مشروعنا نتجنب هذا تماماً:

```typescript
// ❌ خاطئ
phone: v.string()  // وتخزّن "" إذا لم يُعطَ

// ✅ صحيح
phone: v.optional(v.string())  // غائب تماماً إذا لم يُعطَ
```

لماذا؟ لأن `null`/`undefined`/`""` تعني أشياء مختلفة وتسبب bugs غير واضحة.

---

## ملخص الفصل الرابع

- `schema.ts` هو مخطط قاعدة البيانات — يُعرّف كل جدول وحقوله
- `v.id("tableName")` = مرجع (Foreign Key) لجدول آخر
- `v.optional(...)` = الحقل غير إجباري — لا نستخدم strings فارغة
- **Indexes** تجعل الاستعلامات سريعة — كل جدول له indexes استناداً لكيفية استخدامه
- **Composite indexes** تسمح بالبحث بحقلين معاً
- `applicationReviews` جدول audit append-only
- `whatsappOutbox` يطبّق نمط Transactional Outbox

---

**السابق:** [الفصل الثالث — بنية المشروع](./03-project-structure.md)  
**التالي:** [الفصل الخامس — المصادقة مع Clerk](./05-auth-clerk.md)
