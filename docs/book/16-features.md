# الفصل السادس عشر: المميزات الأخرى

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الخامس عشر — إدارة المستخدمين](./15-users-admin.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنستعرض الملفات الأخرى في المشروع: الإعلانات، المقالات، اللقاءات، المورد التعليمي، وغيرها. كل واحدة تُعلّمنا نمطاً جديداً.

---

## banners.ts — الإعلانات المتقدمة

الإعلانات (Banners) يمكن أن تكون:
- نص عادي
- شريط متحرك (scrolling marquee)
- بطاقة بطولية (hero carousel) مع صورة/فيديو/يوتيوب

```typescript
export const listActive = query({
  args: {
    audience: v.union(
      v.literal("student"),
      v.literal("supervisor"),
      v.literal("landing")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const banners = await ctx.db
      .query("banners")
      .withIndex("by_audience_active", (q) =>
        q.eq("audience", args.audience).eq("isActive", true)
      )
      .collect();

    // إضافة إعلانات "all" (للجميع)
    const allAudience = await ctx.db
      .query("banners")
      .withIndex("by_audience_active", (q) =>
        q.eq("audience", "all").eq("isActive", true)
      )
      .collect();

    // دمج القائمتين وحذف المنتهية الصلاحية
    return [...banners, ...allAudience].filter((b) => {
      if (b.expiresAt && b.expiresAt < now) return false;  // منتهي
      if (b.bannerType === "scrolling") return false;       // نوع مختلف
      return true;
    });
  },
});
```

**نمط Expiry بدون Cron:** الإعلان لا يُحذف آلياً عند انتهاء صلاحيته — فقط يُفلتر عند الاستعلام. أبسط وأكثر مرونة.

---

### createBanner — إشعار عند الإعلان للطلاب

```typescript
export const createBanner = mutation({
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);

    const id = await ctx.db.insert("banners", {
      ...args,
      createdBy: supervisor._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // إذا كان إعلاناً scrolling للطلاب: أشعرهم جميعاً
    if (args.bannerType === "scrolling" &&
        (args.audience === "student" || args.audience === "all")) {
      await notifyAllStudents(ctx, {
        title: args.title,
        message: args.message,
        type: "announcement",
      });
    }

    return id;
  },
});
```

---

## articles.ts — مقالات Markdown

المقالات لها نظام نشر بسيط: المشرف يكتب مسودة ثم ينشر عند الجاهزية.

```typescript
export const listPublished = query({
  args: {
    audience: v.union(v.literal("student"), v.literal("supervisor")),
  },
  handler: async (ctx, args) => {
    // مقالات الجمهور المحدد
    const specific = await ctx.db
      .query("articles")
      .withIndex("by_audience_published", (q) =>
        q.eq("audience", args.audience).eq("isPublished", true)
      )
      .collect();

    // مقالات "all" المنشورة أيضاً
    const allAudience = await ctx.db
      .query("articles")
      .withIndex("by_audience_published", (q) =>
        q.eq("audience", "all").eq("isPublished", true)
      )
      .collect();

    // دمج وترتيب حسب تاريخ التعديل
    const combined = [...specific, ...allAudience];
    combined.sort((a, b) => b.updatedAt - a.updatedAt);

    // إثراء كل مقال بـ URL الصورة الغلاف وإسم الكاتب
    return await Promise.all(combined.map(async (article) => {
      const author = await ctx.db.get(article.createdBy);
      const coverUrl = article.coverStorageId
        ? await ctx.storage.getUrl(article.coverStorageId)
        : null;

      return {
        ...article,
        authorName: author?.name ?? "مشرف",
        coverUrl,
      };
    }));
  },
});
```

---

## meetings.ts — اللقاءات مع الإشعارات

```typescript
export const scheduleMeeting = mutation({
  args: {
    studentId: v.id("users"),
    scheduledAt: v.number(),       // Unix timestamp
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);

    // التحقق من وجود الطالب
    const student = await ctx.db.get(args.studentId);
    if (!student || student.role !== "student") {
      throw new Error("المستخدم غير موجود أو ليس طالباً");
    }

    // التحقق أن الموعد في المستقبل
    if (args.scheduledAt <= Date.now() + 60_000) {
      throw new Error("يجب أن يكون موعد الاجتماع في المستقبل");
    }

    const meetingId = await ctx.db.insert("meetings", {
      studentId: args.studentId,
      scheduledBy: supervisor._id,
      scheduledAt: args.scheduledAt,
      location: args.location,
      notes: args.notes,
      applicationId: args.applicationId,
      createdAt: Date.now(),
    });

    // إشعار داخلي للطالب (يحتاج تأكيداً)
    await ctx.db.insert("notifications", {
      userId: args.studentId,
      title: "موعد اجتماع جديد",
      message: `تم تحديد موعد اجتماع معك في: ${new Date(args.scheduledAt).toLocaleDateString("ar")}`,
      type: "meeting",
      read: false,
      requireAck: true,  // ← يجب أن يؤكد الطالب
      createdAt: Date.now(),
    });

    // محاولة إرسال WhatsApp
    await maybeSendWhatsapp(ctx, {
      userId: args.studentId,
      kind: "meeting",
      data: {
        scheduledAt: args.scheduledAt,
        location: args.location ?? "سيتم التحديد",
        supervisorName: supervisor.name ?? "المشرف",
      },
    });

    return meetingId;
  },
});
```

---

## studentNotes.ts — Upsert Pattern لملاحظة واحدة

كل طالب لديه ملاحظة واحدة فقط (دفتر ملاحظات شخصي). نستخدم Upsert:

```typescript
export const saveNote = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // هل يوجد ملاحظة مسبقة؟
    const existing = await ctx.db
      .query("studentNotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    if (existing) {
      // موجودة → حدّث
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: now,
      });
    } else {
      // لا توجد → أضف
      await ctx.db.insert("studentNotes", {
        userId: user._id,
        content: args.content,
        updatedAt: now,
      });
    }
  },
});
```

**لاحظ:** لا `createdAt` في جدول `studentNotes` — لأن كل طالب سجل واحد دائماً، ليس تاريخاً من السجلات.

---

## supervisorUpgradeRequests.ts — طلب الترقية

```typescript
export const submitRequest = mutation({
  args: { reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx);

    // يجب أن يكون إيميله من الجامعة (أعضاء هيئة التدريس)
    if (!student.email.endsWith("@zuj.edu.jo")) {
      throw new Error("هذه الميزة متاحة فقط لأعضاء هيئة التدريس");
    }

    if (!args.reason || args.reason.trim().length < 20) {
      throw new Error("يرجى كتابة سبب وافٍ (20 حرف على الأقل)");
    }

    // هل لديه طلب معلّق مسبقاً؟
    const pending = await ctx.db
      .query("supervisorUpgradeRequests")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();

    if (pending) {
      throw new Error("لديك طلب معلّق بالفعل");
    }

    const requestId = await ctx.db.insert("supervisorUpgradeRequests", {
      studentId: student._id,
      status: "pending",
      reason: args.reason,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // أشعر الأدمن
    await notifyAllAdmins(ctx, {
      title: "طلب ترقية جديد",
      message: `${student.name ?? "طالب"} يطلب الترقية لمشرف`,
      type: "upgrade_request",
    });

    return requestId;
  },
});
```

---

## entrepreneurialGuide.ts — سجل النشاط في كل عملية

```typescript
export const create = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("video"), v.literal("course"), v.literal("link")),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);

    assertMaxLength("guideTitle", args.title);
    assertMaxLength("guideUrl", args.url);

    const id = await ctx.db.insert("entrepreneurialGuide", {
      ...args,
      createdBy: supervisor._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // تسجيل في سجل النشاط — لكل عملية write
    await ctx.runMutation(internal.activityLogs.log, {
      actorId: supervisor._id,
      actorName: supervisor.name ?? "مشرف",
      actorRole: supervisor.role ?? "supervisor",
      action: "created",
      entityType: "entrepreneurialGuide",
      entityId: id,
    });

    return id;
  },
});
```

---

## ملخص الفصل السادس عشر

- `banners.ts` يستخدم فلترة Expiry في وقت الاستعلام — لا حاجة لـ cron
- `articles.ts` يدمج قائمتين (specific + "all") ويُثري بـ URLs وأسماء
- `meetings.ts` يُشغّل Notifications + WhatsApp معاً عند جدولة موعد
- `studentNotes.ts` يطبّق Upsert Pattern — سجل واحد per user
- `supervisorUpgradeRequests.ts` يتحقق من الإيميل ويمنع الطلبات المكررة
- `entrepreneurialGuide.ts` يُسجّل في `activityLogs` كل create/update/delete

---

**السابق:** [الفصل الخامس عشر — إدارة المستخدمين](./15-users-admin.md)  
**التالي:** [الفصل السابع عشر — الأنماط المشتركة](./17-lib-patterns.md)
