# الفصل السابع: ربط Clerk بـ Convex — http.ts و users.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل السادس — نظام الصلاحيات](./06-auth-lib.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم ما هو Webhook، كيف يُرسل Clerk إشعاراً عند إنشاء مستخدم جديد، وكيف نحفظ بياناته في قاعدة بياناتنا.

---

## المشكلة: قاعدتا بيانات مستقلتان

عندما يسجّل طالب جديد في المنصة:
1. **Clerk** يحفظ بيانات المستخدم في قاعدة بياناته (إيميل، كلمة مرور، اسم...)
2. **قاعدة بيانات Convex** لا تعلم بوجود هذا الطالب!

كيف نزامن البيانات بين النظامين؟

---

## الحل: Webhook

**Webhook** هو إشعار HTTP يُرسله نظام ما لنظام آخر عند حدوث حدث.

```
طالب يسجّل في المنصة عبر Clerk
              ↓
Clerk يُرسل HTTP POST لرابط محدد عندنا
              ↓
نقطة نهاية HTTP عندنا تستقبل الإشعار
              ↓
نحفظ بيانات الطالب في قاعدة Convex
```

---

## ملف http.ts — نقطة الاستقبال

```typescript
// packages/convex/convex/http.ts

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix"; // مكتبة التحقق من التوقيع

const http = httpRouter();

http.route({
  path: "/clerk-user-webhook",   // Clerk يُرسل لهذا الرابط
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // ...
  }),
});

export default http;
```

**httpAction** هو نوع خاص من الـ Action يستقبل طلبات HTTP خارجية.

---

## التحقق من التوقيع — Svix

قبل أن نعالج الإشعار، يجب التأكد أنه فعلاً من Clerk وليس من شخص آخر يحاول التلاعب.

Clerk يستخدم مكتبة **Svix** لتوقيع Webhooks.

```typescript
handler: httpAction(async (ctx, req) => {
  // خطوة 1: تأكد من وجود المفتاح السري
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  // خطوة 2: اجلب headers الأمان من الطلب
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // إذا غابت أي header: الطلب غير صالح
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // خطوة 3: اقرأ محتوى الطلب
  const body = await req.text();

  // خطوة 4: تحقق من التوقيع
  const wh = new Webhook(webhookSecret);
  let event: { type: string; data: Record<string, unknown> };

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof event;
  } catch {
    // التوقيع غير صالح — شخص يحاول التلاعب
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // خطوة 5: أرسل الحدث لـ Mutation داخلية للمعالجة
  await ctx.runMutation(internal.users.handleClerkWebhook, {
    type: event.type,  // مثال: "user.created"
    data: event.data,  // بيانات المستخدم من Clerk
  });

  return new Response(null, { status: 200 });
}),
```

**لماذا نفصل التحقق عن المعالجة؟**
- `http.ts` مسؤول فقط عن "هل الطلب حقيقي؟"
- `users.ts` مسؤول عن "ماذا نفعل بهذا الحدث؟"

---

## ملف users.ts — معالجة الأحداث

```typescript
// packages/convex/convex/users.ts

// يُشتق رقم الطالب من إيميله تلقائياً
// مثال: "20230001@std.zuj.edu.jo" → "20230001"
function extractStudentIdFromEmail(email: string): string | undefined {
  const match = email.toLowerCase().match(/^(\d{6,10})@std[-.]zuj\.edu\.jo$/);
  return match ? match[1] : undefined;
}

export const handleClerkWebhook = internalMutation({
  args: {
    type: v.string(),  // نوع الحدث: "user.created", "user.updated", "user.deleted"
    data: v.any(),     // بيانات المستخدم من Clerk (هيكل Clerk)
  },
  handler: async (ctx, { type, data }) => {

    if (type === "user.created" || type === "user.updated") {

      // خطوة 1: استخرج البيانات من payload Clerk
      const clerkId = data.id as string;
      const email = data.email_addresses[0]?.email_address ?? "";
      const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || undefined;
      const phone = data.phone_numbers?.[0]?.phone_number;

      // خطوة 2: استخرج رقم الطالب من الإيميل تلقائياً
      const studentId = extractStudentIdFromEmail(email);

      // خطوة 3: استخرج الكلية والقسم من metadata Clerk
      const meta = (data.unsafe_metadata ?? {}) as Record<string, string>;
      const college = meta.college as string | undefined;
      const department = meta.department as string | undefined;

      // خطوة 4: حوّل أسماء الكلية/القسم لمعرّفات في قاعدة البيانات
      let collegeId, departmentId;
      if (college) {
        const allColleges = await ctx.db.query("colleges").collect();
        const col = allColleges.find((c) => c.name === college);
        if (col) {
          collegeId = col._id;
          // ابحث عن القسم داخل هذه الكلية
          if (department) {
            const deps = await ctx.db
              .query("departments")
              .withIndex("by_college", (q) => q.eq("collegeId", col._id))
              .collect();
            departmentId = deps.find((d) => d.name === department)?._id;
          }
        }
      }

      // خطوة 5: هل المستخدم موجود مسبقاً؟
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique();

      if (existing) {
        // المستخدم موجود → حدّث بياناته
        await ctx.db.patch(existing._id, {
          email, name, phone, isActive: true,
          ...(studentId !== undefined && { studentId }),
          ...(collegeId !== undefined && { collegeId }),
          ...(departmentId !== undefined && { departmentId }),
          updatedAt: Date.now(),
        });
      } else {
        // مستخدم جديد → لكن فقط من نطاقات الجامعة
        if (!isUniversityEmail(email)) return;
        // من يسجّل تلقائياً = طالب دائماً
        // المشرفون والرعاة يُضافون يدوياً من الأدمن
        await ctx.db.insert("users", {
          clerkId, email, name, phone,
          role: "student",
          studentId, college, department, collegeId, departmentId,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    if (type === "user.deleted") {
      // لا نحذف — نجمّد الحساب (soft delete)
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", data.id as string))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { isActive: false, updatedAt: Date.now() });
      }
    }
  },
});
```

---

## منطق التسجيل: من يُسمح له بالتسجيل؟

```typescript
// نطاقات الجامعة المسموحة فقط
const UNIVERSITY_EMAIL_DOMAINS = [
  "@zuj.edu.jo",        // أعضاء هيئة التدريس
  "@std-zuj.edu.jo",    // الطلاب
  "@std.zuj.edu.jo",    // الطلاب (نطاق قديم)
];

function isUniversityEmail(email: string): boolean {
  return UNIVERSITY_EMAIL_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}
```

**إذا حاول شخص من إيميل gmail.com التسجيل:** يُنشئ Clerk الحساب، لكن عندما يصل الـ webhook لـ Convex، نتجاهله (`return;`) ولا نُضيف سجلاً في قاعدتنا.

نتيجة: الشخص سيسجّل دخوله في Clerk لكن يحصل على خطأ "غير مسجّل" في تطبيقنا لأن `ctx.auth.getUserIdentity()` ستنجح لكن لن يوجد سجل في `users`.

---

## Soft Delete — لماذا لا نحذف عند user.deleted؟

```typescript
// ❌ الطريقة الساذجة
await ctx.db.delete(existing._id);

// ✅ ما نفعله
await ctx.db.patch(existing._id, { isActive: false });
```

**لماذا؟**
- إذا حذفنا المستخدم، تنكسر جميع الـ Foreign Keys (applicationReviews, activityLogs, ...)
- يمكن للأدمن أن يُعيد تفعيله لاحقاً
- البيانات التاريخية تبقى سليمة

---

## ملخص الفصل السابع

- **Webhook** = إشعار HTTP يُرسله Clerk عند كل حدث (تسجيل، تعديل، حذف)
- `http.ts` يستقبل الـ Webhook ويتحقق من توقيعه بـ Svix
- `users.ts` يعالج الحدث ويحفظ البيانات في Convex
- التسجيل مقيّد بنطاقات إيميل الجامعة فقط
- من يسجّل تلقائياً يكون دائماً بدور `student`
- عند الحذف: soft delete (`isActive: false`) وليس حذفاً فعلياً

---

**السابق:** [الفصل السادس — نظام الصلاحيات](./06-auth-lib.md)  
**التالي:** [الفصل الثامن — التحقق من المدخلات](./08-validation.md)
