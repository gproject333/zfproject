# الفصل الرابع عشر: تكامل WhatsApp — whatsappOutbox و crons.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الثالث عشر — نظام الإشعارات](./13-notifications.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف يعمل Transactional Outbox Pattern، كيف نُرسل رسائل WhatsApp بشكل موثوق، وكيف تُجدول المهام في Convex.

---

## المشكلة: ماذا لو فشل الإرسال؟

تخيّل هذا السيناريو:
1. المشرف يقبل طلب الطالب
2. Mutation تُحدّث الحالة في قاعدة البيانات ✅
3. Mutation تحاول إرسال رسالة WhatsApp ❌ (فشل الاتصال)

النتيجة: الطالب لم يعلم بقبول طلبه، ولا سجل للمحاولة.

---

## الحل: Transactional Outbox Pattern

بدلاً من إرسال WhatsApp مباشرة من الـ Mutation:

```
❌ الطريقة الخاطئة:
mutation → تحديث قاعدة البيانات + إرسال WhatsApp مباشرة
           إذا فشل الإرسال: لا يمكن إعادة المحاولة

✅ Transactional Outbox Pattern:
mutation → تحديث قاعدة البيانات + إضافة سجل "queued" في outbox
action  → يقرأ السجل "queued" + يرسل WhatsApp
        → يحدّث السجل إلى "sent" أو "failed"
cron    → كل يوم يُعيد محاولة السجلات "failed"
```

---

## البنية المعمارية لـ WhatsApp

```
┌──────────────────────────────────────────────────────┐
│                     Convex                            │
│                                                       │
│  Mutation                                             │
│    → ctx.db.insert("whatsappOutbox", { status: "queued" })
│    → ctx.scheduler.runAfter(0, sendMeeting/sendStatusChange)
│                                                       │
│  Action (sendMeeting / sendStatusChange)              │
│    → يقرأ السجل من whatsappOutbox                    │
│    → يُرسل HTTP POST لـ n8n                           │
│    → يُحدّث السجل إلى "sent" أو "failed"             │
└──────────────────────────┬───────────────────────────┘
                           │ HTTP POST
                           ↓
                    ┌─────────────┐
                    │    n8n      │ (workflow automation)
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────────────┐
                    │  Evolution API      │ (WhatsApp gateway)
                    └─────────────────────┘
                           │
                           ↓
                    📱 هاتف الطالب
```

---

## maybeSendWhatsapp — نقطة الدخول

```typescript
// lib/notifications.ts
export async function maybeSendWhatsapp(ctx, args) {
  // جلب بيانات المستخدم
  const user = await ctx.db.get(args.userId);
  if (!user) return;

  // تحقق: فقط الطلاب الذين وثّقوا رقمهم
  if (user.role !== "student") return;
  if (user.whatsappVerified !== true) return;
  if (user.whatsappOptOut === true) return;   // اختار إيقاف الإشعارات
  if (!user.phone) return;

  const now = Date.now();

  // 1. أضف سجل "queued" في الـ outbox (ضمن نفس الـ transaction)
  const outboxId = await ctx.db.insert("whatsappOutbox", {
    userId: user._id,
    phone: user.phone,
    kind: args.kind,           // "meeting" أو "status_change"
    payload: args.data,        // بيانات الرسالة
    status: "queued",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  });

  // 2. جدول إرسال الرسالة لاحقاً (بعد 0 ثانية = في أقرب وقت)
  const actionRef = args.kind === "meeting"
    ? internal.whatsapp.actions.sendMeeting
    : internal.whatsapp.actions.sendStatusChange;

  await ctx.scheduler.runAfter(0, actionRef, { outboxId });
}
```

**لماذا `ctx.scheduler.runAfter` بدلاً من استدعاء مباشر؟**

لأن الـ Mutation لا تستطيع استدعاء API خارجية مباشرة (تذكر الفصل الثاني). الـ `scheduler` يُجدول Action لتشتغل بعد انتهاء الـ Mutation بنجاح.

---

## crons.ts — المهام المجدولة

```typescript
// packages/convex/convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// الساعة 3:00 UTC (6:00 صباحاً عمّان) — تنظيف الإشعارات القديمة
crons.daily(
  "cleanup-old-notifications",
  { hourUTC: 3, minuteUTC: 0 },
  internal.notifications.cleanupOld,
);

// الساعة 4:00 UTC (7:00 صباحاً عمّان) — إعادة محاولة رسائل WhatsApp الفاشلة
crons.daily(
  "whatsapp-retry-failed",
  { hourUTC: 4, minuteUTC: 0 },
  internal.whatsapp.internal.retryFailed,
);

export default crons;
```

**كيف تعمل الـ Crons في Convex؟**
- هذا الملف يُكتشف تلقائياً بواسطة Convex عند النشر
- لا تحتاج إعداداً إضافياً أو سيرفر خارجي
- Convex يُشغّل الوظائف بالجدول المحدد تلقائياً

---

## OTP Hash — أمان كلمات المرور المؤقتة

عند إرسال كود تحقق WhatsApp:

```typescript
// لا نخزّن الكود نفسه — نخزّن hash له فقط
const codeHash = await crypto.subtle.digest("SHA-256", encoder.encode(code));
// الكود الحقيقي يُرسل لـ n8n فقط (في معامل الـ scheduler)
// لا يوجد في قاعدة البيانات

await ctx.db.insert("whatsappVerifications", {
  userId: user._id,
  phone,
  codeHash: hashToHex(codeHash),  // SHA-256 hash فقط
  expiresAt: Date.now() + 10 * 60 * 1000,  // ينتهي بعد 10 دقائق
  attempts: 0,
  consumed: false,
  createdAt: Date.now(),
});
```

**لماذا نخزّن hash وليس الكود مباشرة؟**
لو اخترق شخص قاعدة البيانات، لن يجد الكود الحقيقي — فقط الـ hash الذي لا يمكن عكسه لمعرفة الكود الأصلي.

---

## retryFailed — إعادة محاولة الفاشلة

```typescript
// يُشغَّل يومياً بواسطة cron
export const retryFailed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // جلب الرسائل الفاشلة من آخر 3 أيام
    const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;

    const failed = await ctx.db
      .query("whatsappOutbox")
      .withIndex("by_status_created", (q) =>
        q.eq("status", "failed").gt("createdAt", cutoff)
      )
      .take(50);

    for (const msg of failed) {
      // أعد وضعها كـ "queued" وجدول إعادة الإرسال
      await ctx.db.patch(msg._id, {
        status: "queued",
        updatedAt: Date.now(),
      });

      const actionRef = msg.kind === "meeting"
        ? internal.whatsapp.actions.sendMeeting
        : internal.whatsapp.actions.sendStatusChange;

      await ctx.scheduler.runAfter(0, actionRef, { outboxId: msg._id });
    }
  },
});
```

---

## الرسائل المُرسَلة

يوجد نوعان من الرسائل:

| النوع | متى يُرسَل | المحتوى |
|-------|-----------|---------|
| `status_change` | عند تغيير حالة الطلب | اسم المشروع، الحالة الجديدة، ملاحظات المشرف |
| `meeting` | عند تحديد موعد اجتماع | التاريخ، المكان، الملاحظات |

---

## ملخص الفصل الرابع عشر

- **Transactional Outbox Pattern**: اكتب في قاعدة البيانات أولاً، ثم جدول الإرسال
- `maybeSendWhatsapp` تتحقق من الشروط قبل إضافة للـ outbox
- `ctx.scheduler.runAfter(0, action, args)` يُجدول Action بعد انتهاء الـ Mutation
- `crons.ts` يُعرّف المهام المجدولة — تُكتشف تلقائياً من Convex
- OTP يُخزَّن كـ SHA-256 hash فقط في قاعدة البيانات — لا نخزّن الكود الحقيقي
- `retryFailed` يُعيد محاولة الرسائل الفاشلة يومياً في الساعة 4 فجراً

---

**السابق:** [الفصل الثالث عشر — نظام الإشعارات](./13-notifications.md)  
**التالي:** [الفصل الخامس عشر — إدارة المستخدمين](./15-users-admin.md)
