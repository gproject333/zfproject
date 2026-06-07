# الفصل الثالث عشر: نظام الإشعارات — notifications.ts و lib/notifications.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الثاني عشر — الرعاة](./12-sponsor.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف يعمل نظام الإشعارات الداخلي، الفرق بين "مقروء" و"مُؤكَّد"، وكيف يُنظَّف النظام تلقائياً.

---

## تصميم الإشعارات

كل إشعار له:
- **userId** — من يرى هذا الإشعار
- **type** — نوعه (يحدد الأيقونة والرابط في الواجهة)
- **read** — هل قرأه المستخدم؟
- **requireAck** — هل يحتاج تأكيداً صريحاً؟
- **ackedAt** — متى أكّده المستخدم

---

## أنواع الإشعارات وما تعني

```typescript
type: v.union(
  v.literal("status_change"),    // الطلب تغيّرت حالته
  v.literal("new_note"),         // المشرف كتب ملاحظة
  v.literal("new_application"),  // طلب جديد بانتظار المراجعة
  v.literal("assignment"),       // راعٍ اهتم بمشروع
  v.literal("announcement"),     // إعلان عام
  v.literal("system"),           // إشعار من النظام
  v.literal("upgrade_request"),  // طلب ترقية دور
  v.literal("meeting"),          // موعد اجتماع
)
```

**النوع مهم** لأن الفرونت اند يستخدمه لتحديد:
- الأيقونة المعروضة
- الرابط الذي تذهب إليه عند الضغط

---

## notifications.ts — ملف الوظائف

### myNotifications — جلب الإشعارات

```typescript
export const myNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")  // الأحدث أولاً
      .take(50);      // آخر 50 إشعار فقط
  },
});
```

**لماذا `.take(50)` وليس `.collect()`؟**
المستخدم لا يحتاج رؤية آلاف الإشعارات القديمة. 50 إشعار كافٍ للعرض، والكود الأسرع والأخف.

---

### unreadCount — رقم الـ Badge

```typescript
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});
```

هذا الرقم يظهر على أيقونة الجرس في الشريط العلوي. يتحدث Real-time عند وصول إشعار جديد.

---

### markAsRead وmarkAllAsRead

```typescript
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const notification = await ctx.db.get(args.id);
    if (!notification) return;

    // التحقق من الملكية — لا تقرأ إشعار شخص آخر
    if (notification.userId !== user._id) return;

    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    // جلب كل الإشعارات غير المقروءة
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    // تحديثها جميعاً
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});
```

---

## الفرق بين read وackedAt

```
read = false  →  الإشعار ظاهر بخلفية ملوّنة (غير مقروء)
read = true   →  الإشعار ظاهر بخلفية عادية (مقروء)

requireAck = true  →  يظهر modal "تأكيد القراءة" قبل التنقل
ackedAt = متى      →  تاريخ التأكيد (لمعرفة "متى عرف الطالب؟")
```

**لماذا الفصل؟**
- `read` للعرض البصري (هل رأى الإشعار؟)
- `ackedAt` للمسؤولية القانونية تقريباً (هل أقرّ بقرار الرفض؟)

مثال: إشعار رفض الطلب
- يظهر ملوّناً حتى يضغط عليه المستخدم (`read = false`)
- عند الضغط يظهر modal "تأكيد" (`requireAck = true`)
- بعد التأكيد يُسجَّل الوقت (`ackedAt = now`)

---

### acknowledgeNotification

```typescript
export const acknowledgeNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const notification = await ctx.db.get(args.id);
    if (!notification) return;
    if (notification.userId !== user._id) return;

    // يجب أن يكون من نوع يتطلب تأكيداً
    if (!notification.requireAck) return;

    await ctx.db.patch(args.id, {
      read: true,
      ackedAt: Date.now(),
    });
  },
});
```

---

## الأنواع التي تتطلب تأكيداً

```typescript
// lib/notifications.ts
export const ACK_REQUIRED_TYPES = [
  "status_change",    // قرار المشرف على طلبك
  "meeting",          // تم تحديد موعد لك
  "upgrade_request",  // قرار الأدمن على طلب الترقية
] as const;

export function typeRequiresAck(type): boolean {
  return ACK_REQUIRED_TYPES.includes(type);
}
```

هذه الأنواع تؤثر فعلياً على الطالب — يحتاج أن يعرف بها ويؤكد معرفته.

---

## lib/notifications.ts — Fan-out

```typescript
// إرسال إشعار لكل المشرفين
export async function notifyAllSupervisors(ctx, args) {
  const supervisors = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "supervisor"))
    .collect();

  const now = Date.now();
  for (const user of supervisors) {
    // استثنِ مستخدماً معيناً إذا كان هو من أرسل الحدث
    if (args.excludeUserId && user._id === args.excludeUserId) continue;

    await ctx.db.insert("notifications", {
      userId: user._id,
      title: args.title,
      message: args.message,
      type: args.type,
      applicationId: args.applicationId,
      read: false,
      requireAck: typeRequiresAck(args.type),
      createdAt: now,
    });
  }
}
```

"Fan-out" = إرسال نفس الرسالة لعدة أشخاص. المشروع يستخدمه لـ:
- `notifyAllSupervisors` — عند تقديم طلب جديد
- `notifyAllAdmins` — عند طلب ترقية
- `notifyAllStudents` — عند إعلان عام

---

## cleanupOld — صيانة دورية

هذه دالة داخلية (`internalMutation`) تُشغَّل يومياً بواسطة cron:

```typescript
export const cleanupOld = internalMutation({
  args: {},
  handler: async (ctx) => {
    // حذف الإشعارات الأقدم من 90 يوماً
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const old = await ctx.db
      .query("notifications")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
      .take(100);  // معالجة 100 في كل مرة

    let deleted = 0;
    for (const n of old) {
      // حماية: لا تحذف إشعاراً ينتظر تأكيداً
      if (n.requireAck && !n.ackedAt) continue;
      await ctx.db.delete(n._id);
      deleted++;
    }

    // إذا وُجدت 100 إشعار قديم، من المحتمل أن هناك المزيد
    // شغّل نفسك مرة أخرى في الخلفية
    if (old.length === 100) {
      await ctx.scheduler.runAfter(0, internal.notifications.cleanupOld, {});
    }
  },
});
```

**نقطتان مهمتان:**
1. **الحماية:** إشعار `requireAck = true` لم يُؤكَّد بعد → لا يُحذف حتى لو كان قديماً. لا نريد أن يضيع قرار مهم.
2. **Self-reschedule:** إذا وُجدت 100 إشعار قديم في دفعة واحدة، من المحتمل أن هناك المزيد. نُشغّل أنفسنا مرة أخرى تلقائياً.

---

## ملخص الفصل الثالث عشر

- كل إشعار له `type` يحدد الأيقونة والتصرف في الواجهة
- `read` للعرض البصري، `ackedAt` للتأكيد الصريح — لغرضين مختلفين
- إشعارات تغيير الحالة والاجتماعات تتطلب `requireAck = true`
- `notifyAllSupervisors` / `notifyAllAdmins` تُوزّع نفس الإشعار لجميع أصحاب الدور
- `cleanupOld` يُشغَّل يومياً لحذف الإشعارات القديمة مع حماية المهمة منها
- `take(100)` + self-reschedule لمعالجة كميات كبيرة بأمان

---

**السابق:** [الفصل الثاني عشر — الرعاة](./12-sponsor.md)  
**التالي:** [الفصل الرابع عشر — تكامل WhatsApp](./14-whatsapp.md)
