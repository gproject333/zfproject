# الفصل الثالث: بنية المشروع

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الثاني — ما هو Convex؟](./02-what-is-convex.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف منظّم المشروع، ما هو الـ Monorepo، لماذا قسّمنا المشروع لحزم منفصلة، وكيف تشغّل المشروع على جهازك.

---

## ما هو الـ Monorepo؟

**Monorepo** هي استراتيجية تخزين كود مشروع كامل في **مستودع Git واحد**، لكن مقسّم لحزم (packages) منفصلة.

**لماذا؟** لأن مشروعنا يحتوي على:
- فرونت اند (Next.js)
- باك اند (Convex)
- كود مشترك بينهما

لو كانوا في مستودعات منفصلة، ستحتاج نسخ الأنواع المشتركة يدوياً في كل مرة. مع Monorepo، الأنواع مشتركة تلقائياً.

---

## هيكل المشروع

```
zfproject/
├── packages/
│   ├── web/          ← فرونت اند (Next.js 16)
│   ├── convex/       ← باك اند (Convex)
│   └── core/         ← كود TypeScript مشترك
├── pnpm-workspace.yaml ← يُعرّف الحزم
└── package.json       ← أوامر المشروع الرئيسية
```

**ملاحظة:** نحن في هذا الكتاب نركز على `packages/convex/` فقط.

---

## داخل packages/convex/

```
packages/convex/
├── convex/                ← هذا هو قلب الباك اند
│   ├── schema.ts          ← تعريف قاعدة البيانات
│   ├── auth.config.ts     ← إعدادات المصادقة
│   ├── http.ts            ← نقاط HTTP (Webhooks)
│   ├── crons.ts           ← المهام المجدولة
│   │
│   ├── applications/      ← منطق الطلبات
│   │   ├── student.ts     ← وظائف الطالب
│   │   ├── supervisor.ts  ← وظائف المشرف
│   │   ├── sponsor.ts     ← وظائف الراعي
│   │   └── shared.ts      ← وظائف مشتركة
│   │
│   ├── users/             ← إدارة المستخدمين
│   │   ├── admin.ts       ← وظائف الأدمن
│   │   ├── adminActions.ts← Actions للأدمن
│   │   ├── shared.ts      ← الملف الشخصي
│   │   └── dev.ts         ← أدوات التطوير فقط
│   │
│   ├── lib/               ← مساعدات مشتركة
│   │   ├── auth.ts        ← نظام الصلاحيات
│   │   ├── notifications.ts← مساعدات الإشعارات
│   │   ├── statuses.ts    ← آلة حالة الطلبات
│   │   ├── uploads.ts     ← حدود الملفات
│   │   ├── users.ts       ← batch loading
│   │   └── validation.ts  ← حدود الحقول
│   │
│   ├── whatsapp/          ← تكامل WhatsApp
│   │
│   ├── articles.ts        ← المقالات
│   ├── banners.ts         ← الإعلانات
│   ├── colleges.ts        ← الكليات والأقسام
│   ├── meetings.ts        ← اللقاءات
│   ├── notifications.ts   ← الإشعارات
│   ├── files.ts           ← الملفات
│   ├── socialLinks.ts     ← روابط التواصل
│   ├── studentNotes.ts    ← ملاحظات الطالب
│   ├── entrepreneurialGuide.ts ← دليل ريادة الأعمال
│   ├── supervisorUpgradeRequests.ts ← طلبات الترقية
│   ├── activityLogs.ts    ← سجل النشاط
│   └── users.ts           ← مزامنة المستخدمين
│
├── package.json
└── deploy.sh              ← سكريبت النشر
```

---

## كيف يعمل Routing في Convex

هذا مهم جداً: Convex يستخدم **file-based routing** مثل Next.js تماماً.

```
ملف: convex/applications/student.ts
      ↓
تصبح وظائفه متاحة بـ: api.applications.student.myApplications
```

```
ملف: convex/notifications.ts
      ↓
تصبح وظائفه متاحة بـ: api.notifications.myNotifications
```

**القاعدة:** اسم الملف + اسم الوظيفة = عنوان API الكامل.

---

## Public vs Internal

في Convex يوجد نوعان من الوظائف:

```typescript
import { query, mutation } from "./_generated/server";
// ↑ هذه يمكن للفرونت اند استدعاؤها

import { internalQuery, internalMutation } from "./_generated/server";
// ↑ هذه للاستخدام الداخلي فقط (Mutations أخرى، Actions، Crons)
```

مثال من مشروعنا:

```typescript
// في users.ts — داخلي فقط، الفرونت اند لا يستطيع استدعاءه مباشرة
export const handleClerkWebhook = internalMutation({
  args: { type: v.string(), data: v.any() },
  handler: async (ctx, args) => { /* ... */ },
});
```

---

## الـ _generated — لا تلمسه أبداً

```
convex/_generated/
├── api.d.ts      ← أنواع كل الوظائف (auto-generated)
├── dataModel.d.ts← أنواع قاعدة البيانات (auto-generated)
└── server.ts     ← مساعدات الخادم (auto-generated)
```

هذه الملفات تُولَّد تلقائياً عند تشغيل `pnpm dev`. **لا تعدّلها يدوياً أبداً** — ستُستبدل عند التشغيل التالي.

---

## كيف تشغّل المشروع

```bash
# من مجلد المشروع الرئيسي
pnpm dev
```

هذا يشغّل:
1. Convex backend (يشاهد التغييرات في convex/)
2. Next.js frontend (يشاهد التغييرات في packages/web/)

للباك اند فقط:
```bash
cd packages/convex
pnpm dev
```

---

## ملاحظة على import

داخل ملفات Convex، تستورد هكذا:

```typescript
// الوظائف المولَّدة تلقائياً
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// الوصول للـ API من داخل الكود
import { api, internal } from "./_generated/api";
// api   → للوظائف العامة
// internal → للوظائف الداخلية

// الأنواع
import type { Doc, Id } from "./_generated/dataModel";
// Doc<"tableName"> → نوع سجل من جدول
// Id<"tableName">  → نوع مُعرّف سجل من جدول
```

---

## ملخص الفصل الثالث

- المشروع منظّم كـ Monorepo بثلاث حزم: web + convex + core
- الباك اند كله في `packages/convex/convex/`
- Convex يستخدم file-based routing: اسم الملف = عنوان API
- الوظائف إما `public` (للفرونت اند) أو `internal` (داخلية فقط)
- `_generated/` يُولَّد تلقائياً — لا تعدّله
- `lib/` للمساعدات المشتركة بين جميع الملفات

---

**السابق:** [الفصل الثاني — ما هو Convex؟](./02-what-is-convex.md)  
**التالي:** [الفصل الرابع — قاعدة البيانات](./04-schema.md)
