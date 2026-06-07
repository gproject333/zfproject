# الفصل الخامس: المصادقة مع Clerk

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الرابع — قاعدة البيانات](./04-schema.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف يعمل نظام تسجيل الدخول، ما هو Clerk، كيف يتحقق Convex من هوية المستخدم، وما هو الـ JWT.

---

## المشكلة: كيف نعرف من المستخدم؟

عندما يُرسل المستخدم طلباً للباك اند، يجب أن يُثبت هويته. لكن كيف؟

**الحل الكلاسيكي:** يسجّل المستخدم دخوله بإيميل وكلمة مرور، يحفظ السيرفر جلسة (session)، ويُرسل الفرونت اند cookie في كل طلب.

**مشكلة الحل الكلاسيكي:** تطبيقه صحيحاً وآمناً صعب جداً ويحتاج الكثير من الكود.

**الحل الحديث:** استخدام خدمة مصادقة جاهزة مثل **Clerk**.

---

## ما هو Clerk؟

Clerk هي خدمة تتولى كل مهمة المصادقة:
- واجهات تسجيل الدخول والتسجيل
- التحقق من الإيميل
- الجلسات (Sessions)
- إدارة المستخدمين
- تسجيل الدخول بـ Google/GitHub/...

أنت فقط تُضيف مكوناتهم في الفرونت اند، وهم يتولون الباقي.

---

## ما هو JWT؟

**JWT (JSON Web Token)** هو وثيقة رقمية مشفّرة تحتوي معلومات عن المستخدم.

تخيّله كبطاقة هوية رقمية:

```
┌─────────────────────────────────────────────────────┐
│                     JWT Token                        │
├─────────────────────────────────────────────────────┤
│ من أنا:    user_2abc123xyz                          │
│ متى انتهت: 1735000000 (Unix timestamp)             │
│ صادر من:   Clerk                                    │
│ توقيع:     abcdef123... (لا يمكن تزويره)           │
└─────────────────────────────────────────────────────┘
```

**كيف يُستخدم في مشروعنا:**

```
الفرونت اند يطلب JWT من Clerk
        ↓
Clerk يُعطيه JWT موقّع
        ↓
الفرونت اند يُرسل الطلب + JWT إلى Convex
        ↓
Convex يتحقق من التوقيع
        ↓
إذا صالح: يتعامل مع الطلب
```

---

## ملف auth.config.ts

هذا الملف هو "الجسر" بين Convex وClerk. بسيط جداً:

```typescript
// packages/convex/convex/auth.config.ts
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

**شرح السطور:**

- `domain` = عنوان Clerk الخاص بمشروعنا (مثل: `https://clerk.yourapp.com`)
  - يؤخذ من متغير البيئة `CLERK_JWT_ISSUER_DOMAIN`
  - Convex يستخدمه للتحقق من أن الـ JWT فعلاً صادر من Clerk وليس من أي شخص آخر

- `applicationID: "convex"` = اسم التطبيق داخل Clerk

- `satisfies AuthConfig` = TypeScript يتحقق أن الكائن يتوافق مع النوع الصحيح

هذا الملف يعمل مرة واحدة عند بدء تشغيل Convex. لا تحتاج لكود إضافي — Convex يتولى التحقق من كل JWT تلقائياً.

---

## كيف تحصل على معلومات المستخدم في الكود؟

في أي Query أو Mutation، يمكنك الوصول لهوية المستخدم:

```typescript
export const someQuery = query({
  args: {},
  handler: async (ctx) => {
    // جلب هوية المستخدم من الـ JWT
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      // المستخدم غير مسجّل دخول
      return null;
    }

    // identity.subject = معرّف المستخدم في Clerk (مثل: "user_2abc123xyz")
    // هذا هو clerkId في جدول users لدينا
    console.log(identity.subject);  // "user_2abc123xyz"
    console.log(identity.email);    // "student@std.zuj.edu.jo"
    console.log(identity.name);     // "Ahmed Mohammed"
  },
});
```

**مهم:** `identity.subject` هو المفتاح الثابت للمستخدم. نستخدمه (وليس الإيميل) للبحث في قاعدة البيانات.

---

## لماذا نستخدم identity.subject وليس identity.email؟

لأن المستخدم يمكنه **تغيير إيميله** في Clerk، لكن الـ `subject` (المُعرّف الداخلي) لا يتغير أبداً.

في جدول `users`:
```typescript
clerkId: v.string()
// يُخزّن هنا: identity.subject
// مثال: "user_2abc123xyz"
```

وعند البحث:
```typescript
const user = await ctx.db
  .query("users")
  .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
  .unique();
```

---

## كيف يربط الفرونت اند Clerk بـ Convex؟

في الفرونت اند (خارج نطاق هذا الكتاب)، يوجد مكوّن خاص:

```tsx
// packages/web/src/app/ConvexClientProvider.tsx
<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
  {children}
</ConvexProviderWithClerk>
```

هذا المكوّن يتولى تلقائياً:
1. جلب JWT من Clerk
2. إرفاقه مع كل طلب لـ Convex
3. تجديده عند انتهاء صلاحيته

أنت لا تحتاج لكتابة هذا — `convex-react` يفعله تلقائياً.

---

## ماذا يحدث عند انتهاء صلاحية الـ JWT؟

```
JWT انتهت صلاحيته (عادةً بعد 1-24 ساعة)
        ↓
Clerk يُصدر JWT جديداً تلقائياً (في الخلفية)
        ↓
ConvexProviderWithClerk يُرسله تلقائياً
        ↓
المستخدم لا يلاحظ شيئاً
```

---

## ملخص الفصل الخامس

- **Clerk** يتولى كل تفاصيل المصادقة (تسجيل، تحقق، جلسات)
- **JWT** هو بطاقة هوية رقمية مشفّرة يُرسلها الفرونت اند مع كل طلب
- **auth.config.ts** يُخبر Convex "ثق بـ JWT الصادرة من Clerk"
- `ctx.auth.getUserIdentity()` يُعيد هوية المستخدم من الـ JWT
- `identity.subject` هو الـ clerkId الثابت — استخدمه وليس الإيميل
- الفرونت اند يُرفق الـ JWT تلقائياً عبر `ConvexProviderWithClerk`

---

**السابق:** [الفصل الرابع — قاعدة البيانات](./04-schema.md)  
**التالي:** [الفصل السادس — نظام الصلاحيات](./06-auth-lib.md)
