# الفصل السادس: نظام الصلاحيات — lib/auth.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الخامس — المصادقة مع Clerk](./05-auth-clerk.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنقرأ ملف `lib/auth.ts` ونفهم كيف نتحقق من صلاحيات المستخدم في كل دالة، وما الفرق بين الدوال المختلفة.

---

## المشكلة: كل وظيفة تحتاج تحقق مختلف

في المنصة لدينا:
- بعض الوظائف للطلاب فقط (تقديم طلب)
- بعضها للمشرفين فقط (مراجعة طلب)
- بعضها للأدمن فقط (حذف مستخدم)
- بعضها لأي شخص مسجّل

بدلاً من كتابة نفس كود التحقق في كل وظيفة، خلقنا `lib/auth.ts` كمكان مركزي.

---

## الملف كاملاً مع الشرح

```typescript
// packages/convex/convex/lib/auth.ts

import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

// نوع مساعد: يقبل كلاً من Query context و Mutation context
type AnyCtx = QueryCtx | MutationCtx;
```

### الدالة الداخلية: getUserFromIdentity

```typescript
async function getUserFromIdentity(ctx: AnyCtx): Promise<Doc<"users"> | null> {
  // خطوة 1: اجلب هوية المستخدم من الـ JWT
  const identity = await ctx.auth.getUserIdentity();

  // إذا لا يوجد JWT أو غير صالح: المستخدم غير مسجّل
  if (!identity) return null;

  // خطوة 2: ابحث عن المستخدم في قاعدة البيانات بالـ clerkId
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
    // .unique() → يُعيد null إذا لم يجد، أو الكائن الوحيد إذا وجد
}
```

هذه الدالة `private` (لا تُصدَّر). كل الدوال الأخرى تمر عبرها.

---

### requireUser — قاعدة كل شيء

```typescript
export async function requireUser(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await getUserFromIdentity(ctx);

  // إذا لم يجد مستخدماً: إرمِ خطأ
  if (!user) throw new Error("غير مسجل دخول");

  // إذا كان الحساب مجمَّداً: إرمِ خطأ خاص
  if (user.isActive === false) {
    throw new ConvexError("حسابك مجمّد. يُرجى مراجعة إدارة المنصّة.");
  }

  return user;
}
```

**النقطة المحورية:** كل الدوال الأخرى (`requireStudent`, `requireSupervisor`, ...) تمر عبر `requireUser` أولاً.

هذا يعني: **نقطة تحقق واحدة** للحسابات المجمّدة. إذا جمّد الأدمن حساباً، فهو محجوب من **كل** العمليات تلقائياً.

---

### requireSupervisor وrequireAdmin وrequireStudent

```typescript
// يسمح للمشرفين والأدمن
export async function requireSupervisor(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx); // ← يمر عبر requireUser أولاً
  if (user.role !== "supervisor" && user.role !== "admin") {
    throw new Error("غير مصرح — هذه الصفحة للمشرفين فقط");
  }
  return user;
}

// للأدمن فقط
export async function requireAdmin(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new Error("غير مصرح — هذه الصفحة للمدراء فقط");
  }
  return user;
}

// للطلاب فقط
export async function requireStudent(ctx: AnyCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "student") {
    throw new Error("يجب أن تكون طالباً للقيام بهذا الإجراء");
  }
  return user;
}
```

**الفرق بين requireSupervisor وrequireAdmin:**
- `requireSupervisor` يقبل `supervisor` **أو** `admin`
- `requireAdmin` يقبل `admin` فقط

هذا منطقي: الأدمن "أعلى" من المشرف، فيجب أن يستطيع القيام بكل ما يقوم به المشرف وأكثر.

---

### دوال getOptional — للحالات الهادئة

هذه الدوال لا تُرمي خطأ — تُعيد `null` بدلاً من ذلك:

```typescript
// أي مستخدم مسجّل — null إذا لم يكن مسجّلاً
export async function getOptionalUser(ctx: AnyCtx): Promise<Doc<"users"> | null> {
  return getUserFromIdentity(ctx); // لا يتحقق من isActive
}

// المشرف أو الأدمن — null لأي سبب آخر
export async function getOptionalSupervisor(ctx: AnyCtx): Promise<Doc<"users"> | null> {
  const user = await getUserFromIdentity(ctx);
  if (!user) return null;
  if (user.isActive === false) return null; // حساب مجمّد → null وليس خطأ
  if (user.role !== "supervisor" && user.role !== "admin") return null;
  return user;
}

// الأدمن فقط — null لأي سبب آخر
export async function getOptionalAdmin(ctx: AnyCtx): Promise<Doc<"users"> | null> {
  const user = await getUserFromIdentity(ctx);
  if (!user) return null;
  if (user.isActive === false) return null;
  if (user.role !== "admin") return null;
  return user;
}
```

---

## متى تستخدم require وmتى getOptional؟

| الحالة | استخدم |
|--------|--------|
| Mutation تحتاج مستخدماً مسجّلاً | `requireUser` |
| Mutation للطلاب فقط | `requireStudent` |
| Mutation للمشرفين فقط | `requireSupervisor` |
| Mutation للأدمن فقط | `requireAdmin` |
| Query يُعيد empty إذا لم يكن مسجّلاً | `getOptionalUser` |
| Query للوحة تحكم قد تُعرض لغير مسجّل | `getOptionalSupervisor` |

---

## مثال عملي: كيف يُستخدم في الكود

```typescript
// في applications/student.ts
export const myApplications = query({
  args: {},
  handler: async (ctx) => {
    // استخدام getOptionalUser لأن الـ Query يجب أن يعمل حتى للزوار
    // (يُعيد قائمة فارغة بدلاً من خطأ)
    const user = await getOptionalUser(ctx);
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    return await ctx.db
      .query("applications")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

```typescript
// في applications/student.ts
export const createApplication = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // requireStudent: إذا لم يكن طالباً مسجّلاً، يرمي خطأ فوراً
    const student = await requireStudent(ctx);

    // الآن نعرف أن student موثوق وهو طالب نشط
    // ...
  },
});
```

---

## ConvexError vs Error — ما الفرق؟

```typescript
// Error عادي — يظهر في الـ console لكن الـ message قد لا يصل للعميل
throw new Error("غير مسجل دخول");

// ConvexError — الـ message يصل للعميل مباشرة
throw new ConvexError("حسابك مجمّد. يُرجى مراجعة إدارة المنصّة.");
```

نستخدم `ConvexError` للرسائل التي يجب أن يراها المستخدم (مثل "حسابك مجمّد"). الـ `Error` العادي للأخطاء الداخلية.

---

## ملخص الفصل السادس

- `lib/auth.ts` هو نقطة تحقق الصلاحيات المركزية
- كل الدوال تمر عبر `getUserFromIdentity` ثم `requireUser`
- `isActive === false` يعني الحساب مجمّد — يُحجب من كل العمليات في نقطة واحدة
- `require*` تُرمي خطأ إذا لم تتحقق الشروط
- `getOptional*` تُعيد `null` هادئاً بدلاً من الرمي
- `ConvexError` للرسائل المرئية للمستخدم، `Error` للأخطاء الداخلية

---

**السابق:** [الفصل الخامس — المصادقة مع Clerk](./05-auth-clerk.md)  
**التالي:** [الفصل السابع — ربط Clerk بـ Convex](./07-webhook-clerk.md)
