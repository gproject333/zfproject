# الفصل الخامس عشر: إدارة المستخدمين — users/admin.ts و adminActions.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الرابع عشر — تكامل WhatsApp](./14-whatsapp.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف يُنشئ الأدمن مستخدمين جديدين عبر Clerk، كيف يحذف بياناتهم بشكل آمن، وكيف نحمي النظام من الحذف الخاطئ.

---

## الفرق بين Mutation وAction هنا

ملف `users/admin.ts` → Mutations (read/write قاعدة البيانات)  
ملف `users/adminActions.ts` → Actions (Mutations + Clerk API الخارجي)

```
createSupervisor (Action في adminActions.ts)
    │
    ├── 1. يتحقق من صلاحية الأدمن (عبر runQuery)
    │
    ├── 2. يستدعي Clerk API لإنشاء حساب
    │
    └── 3. يستدعي internal.users.admin.insertSupervisor (Mutation)
                        │
                        └── يحفظ البيانات في Convex
```

---

## createSupervisor — إنشاء مشرف جديد

```typescript
// users/adminActions.ts
export const createSupervisor = action({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. التحقق من صلاحية الأدمن
    const admin = await ctx.runQuery(api.users.shared.currentUser);
    if (!admin || admin.role !== "admin") {
      throw new Error("غير مصرح");
    }

    // 2. إنشاء حساب في Clerk
    const clerkUser = await createClerkUser(
      process.env.CLERK_SECRET_KEY!,
      args.email,
      args.password,
      args.name,
    );

    // 3. حفظ بيانات المشرف في قاعدة Convex
    await ctx.runMutation(internal.users.admin.insertSupervisor, {
      clerkId: clerkUser.id,
      email: args.email,
      name: args.name,
      department: args.department,
      phone: args.phone,
    });
  },
});
```

---

## createClerkUser — مساعد الـ Clerk API

```typescript
async function createClerkUser(secretKey, email, password, name) {
  const { createClerkClient } = await import("@clerk/backend");
  const clerk = createClerkClient({ secretKey });

  try {
    const user = await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" "),
    });
    return user;
  } catch (err: any) {
    // Clerk يُعطي رسائل خطأ مفيدة (كلمة مرور ضعيفة، إيميل مكرر...)
    const message = err.errors?.[0]?.longMessage
      ?? err.errors?.[0]?.message
      ?? "فشل إنشاء الحساب";
    throw new Error(message);
  }
}
```

**لماذا `await import(...)` وليس import في الأعلى؟**
`@clerk/backend` مكتبة Node.js-only لا تعمل إلا في Actions. Dynamic import يضمن أنها تُحمَّل فقط عند الحاجة.

---

## insertSupervisor — Upsert Pattern

```typescript
// users/admin.ts (Internal Mutation)
export const insertSupervisor = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // هل المستخدم موجود مسبقاً؟ (قد يكون وصل Webhook من Clerk أولاً)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      // موجود → حدّث الدور فقط
      await ctx.db.patch(existing._id, {
        role: "supervisor",
        updatedAt: Date.now(),
      });
    } else {
      // جديد → أضف
      await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        phone: args.phone,
        role: "supervisor",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
```

**Upsert Pattern:** "إذا وُجد: حدّث. إذا لم يوجد: أضف." يحل مشكلة race condition بين الـ webhook وإنشاء المستخدم.

---

## deleteUserByAdmin — حذف آمن

```typescript
// users/adminActions.ts (Action)
export const deleteUserByAdmin = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // 1. تحقق من الصلاحية
    const admin = await ctx.runQuery(api.users.shared.currentUser);
    if (!admin || admin.role !== "admin") throw new Error("غير مصرح");

    // 2. جلب المستخدم المراد حذفه
    const target = await ctx.runQuery(/* جلب المستخدم بالـ ID */);

    // 3. حمايات ضرورية
    if (target._id === admin._id) throw new Error("لا يمكنك حذف نفسك");

    // 4. احذف بيانات Convex أولاً (cascade)
    await ctx.runMutation(internal.users.admin.deleteUserCascade, {
      userId: args.userId,
    });

    // 5. احذف من Clerk (best-effort — إذا فشل لا يوقف العملية)
    await deleteClerkUser(process.env.CLERK_SECRET_KEY!, target.clerkId);
  },
});
```

**لماذا نحذف من Convex أولاً ثم Clerk؟**

لأن الأولوية هي إلغاء الوصول. حتى لو فشل حذف Clerk، المستخدم محذوف من قاعدتنا ولن يتمكن من الوصول. العكس (حذف Clerk أولاً) قد يترك بيانات "يتيمة" في Convex.

---

## deleteUserCascade — حذف متسلسل

```typescript
// users/admin.ts (Internal Mutation)
export const deleteUserCascade = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    // حذف يعتمد على الدور
    if (user.role === "student") {
      // احذف كل طلباته
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_student", (q) => q.eq("studentId", args.userId))
        .collect();

      for (const app of apps) {
        // احذف ملفاتهم أولاً
        if (app.pdfFileId) await ctx.storage.delete(app.pdfFileId);
        if (app.videoFileId) await ctx.storage.delete(app.videoFileId);
        // احذف السجلات المرتبطة
        const reviews = await ctx.db.query("applicationReviews")
          .withIndex("by_application", (q) => q.eq("applicationId", app._id))
          .collect();
        for (const r of reviews) await ctx.db.delete(r._id);
        await ctx.db.delete(app._id);
      }

      // احذف ملاحظاته، طلبات الترقية، اللقاءات...
    }

    if (user.role === "supervisor" || user.role === "admin") {
      // المشرف لا يُحذف من الطلبات — فقط يُفصل (reviewerId = null)
      const reviewed = await ctx.db
        .query("applications")
        .withIndex("by_reviewer", (q) => q.eq("reviewerId", args.userId))
        .collect();
      for (const app of reviewed) {
        await ctx.db.patch(app._id, { reviewerId: undefined });
      }
    }

    // حذف مشترك لكل الأدوار
    // الإشعارات، رسائل WhatsApp، التحقق من الهاتف...

    // حذف الصورة
    if (user.avatar) await ctx.storage.delete(user.avatar);

    // أخيراً: احذف المستخدم نفسه
    await ctx.db.delete(args.userId);
  },
});
```

---

## الحماية من حذف آخر أدمن

```typescript
// في toggleUserActive:
if (!isActive && target.role === "admin") {
  // احسب عدد الأدمن النشطين
  const activeAdmins = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .filter((q) => q.neq(q.field("isActive"), false))
    .collect();

  if (activeAdmins.length <= 1) {
    throw new Error("لا يمكن تجميد آخر أدمن نشط في النظام");
  }
}
```

هذا يمنع "قفل النفس خارجاً" — إذا جُمِّد آخر أدمن، لا أحد يستطيع إدارة المنصة.

---

## ملخص الفصل الخامس عشر

- Actions تربط Convex بـ Clerk API — المنطق في Action، الكتابة في Mutation داخلية
- **Upsert Pattern** (`insertSupervisor`): إذا وُجد حدّث، إذا لم يوجد أضف
- الحذف يبدأ من Convex أولاً (إلغاء الوصول) ثم Clerk (best-effort)
- `deleteUserCascade` يتعامل مع كل دور بشكل مختلف — الطالب تُحذف كل بياناته، المشرف يُفصل فقط
- حماية "آخر أدمن" تمنع إغلاق النظام على نفسه

---

**السابق:** [الفصل الرابع عشر — تكامل WhatsApp](./14-whatsapp.md)  
**التالي:** [الفصل السادس عشر — المميزات الأخرى](./16-features.md)
