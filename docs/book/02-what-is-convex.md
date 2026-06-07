# الفصل الثاني: ما هو Convex ولماذا اخترناه؟

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الأول — ما هو المشروع؟](./01-project-intro.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم ما هو Convex كمنصة، كيف يختلف عن قواعد البيانات التقليدية، وما هي المفاهيم الأساسية: Query وMutation وAction.

---

## المشكلة التي يحلها Convex

تخيل أنك تريد بناء تطبيق ويب. تحتاج عادةً إلى:

1. **قاعدة بيانات** (PostgreSQL, MongoDB...)
2. **سيرفر خلفي** (Node.js, Express, FastAPI...)
3. **API** لربط الفرونت اند بالباك اند
4. **نظام مصادقة** (JWT, Sessions...)
5. **تخزين ملفات** (AWS S3...)
6. **جدولة مهام** (Cron jobs...)

هذا كثير! ومعظمه كود boilerplate ممل يتكرر في كل مشروع.

**Convex يجمع كل هذا في منصة واحدة.**

---

## ما هو Convex بكلمات بسيطة؟

Convex هو منصة backend كاملة. أنت تكتب الكود بـ TypeScript، وConvex يتولى:

- تشغيل الكود
- تخزين البيانات
- تحديث الفرونت اند تلقائياً عند أي تغيير (Real-time!)
- جدولة المهام
- تخزين الملفات

```
أنت تكتب دوال TypeScript
      ↓
Convex يشغّلها في السحابة
      ↓
Convex يحفظ البيانات تلقائياً
      ↓
الفرونت اند يستقبل التحديثات فوراً
```

---

## أنواع الدوال في Convex

### 1. Query — للقراءة فقط

الـ Query مثل سؤال تطرحه على قاعدة البيانات: "أعطني قائمة الطلبات"، "من هو المستخدم الحالي؟"

**الخصائص:**
- لا يمكنه تغيير أي بيانات (read-only)
- Convex يُحدّث الفرونت اند تلقائياً عند أي تغيير في البيانات المرتبطة
- يمكن للعميل الاشتراك فيه مثل "اشترك في تحديثات هذه القائمة"

```typescript
// مثال: جلب طلبات الطالب
export const myApplications = query({
  args: {},
  handler: async (ctx) => {
    // ctx.db هو الوصول لقاعدة البيانات
    return await ctx.db.query("applications").collect();
  },
});
```

### 2. Mutation — للتغيير

الـ Mutation مثل أمر تعطيه لقاعدة البيانات: "أضف طلباً جديداً"، "غيّر حالة الطلب"، "احذف هذا المستخدم"

**الخصائص:**
- يمكنه قراءة وكتابة وتعديل وحذف البيانات
- يعمل في "معاملة" (transaction) — إما ينجح كله أو يفشل كله
- لا يمكنه الاتصال بخدمات خارجية مباشرة (لهذا نستخدم Action)

```typescript
// مثال: تقديم طلب جديد
export const createApplication = mutation({
  args: {
    projectName: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // ctx.db.insert لإضافة بيانات جديدة
    const id = await ctx.db.insert("applications", {
      projectName: args.projectName,
      description: args.description,
      status: "draft",
      createdAt: Date.now(),
    });
    return id;
  },
});
```

### 3. Action — للعمليات المعقدة

الـ Action للعمليات التي تحتاج:
- الاتصال بـ APIs خارجية (WhatsApp, Clerk, ...)
- عمليات طويلة أو معقدة
- Node.js-only packages

**الخصائص:**
- **لا يمكنه** الوصول المباشر لـ `ctx.db`
- يستطيع استدعاء Queries وMutations أخرى
- يمكنه الاتصال بالإنترنت

```typescript
// مثال: إرسال رسالة واتساب
export const sendWhatsApp = action({
  args: { phone: v.string(), message: v.string() },
  handler: async (ctx, args) => {
    // يستطيع الاتصال بـ API خارجي
    await fetch("https://api.whatsapp.com/send", {
      method: "POST",
      body: JSON.stringify({ to: args.phone, text: args.message }),
    });
  },
});
```

---

## الفرق الجوهري: جدول المقارنة

| الميزة | Query | Mutation | Action |
|--------|-------|----------|--------|
| قراءة البيانات | ✅ | ✅ | ❌ (عبر runQuery) |
| كتابة البيانات | ❌ | ✅ | ❌ (عبر runMutation) |
| الاتصال بالإنترنت | ❌ | ❌ | ✅ |
| Real-time للعميل | ✅ | — | — |
| Transaction | ✅ | ✅ | ❌ |

---

## مفهوم `ctx` — السياق

في كل دالة Convex، تحصل على `ctx` (اختصار Context). هذا الكائن يعطيك صلاحية:

```typescript
ctx.db          // الوصول لقاعدة البيانات
ctx.auth        // الوصول لمعلومات المستخدم المسجّل
ctx.storage     // الوصول لتخزين الملفات
ctx.scheduler   // جدولة عمليات لاحقاً
ctx.runQuery    // (في Action) تشغيل Query
ctx.runMutation // (في Action) تشغيل Mutation
```

---

## مفهوم `v` — محقق القيم (Validator)

في Convex، كل argument لكل دالة **يجب** أن يُعرَّف نوعه بـ `v`:

```typescript
import { v } from "convex/values";

// v.string()       → نص
// v.number()       → رقم
// v.boolean()      → صح/خطأ
// v.optional(...)  → اختياري
// v.id("tableName")→ مُعرّف سجل من جدول معين
// v.union(...)     → أحد الخيارات المحددة
// v.array(...)     → قائمة
// v.object({...})  → كائن
```

**لماذا؟** لأن Convex يتحقق منها تلقائياً — إذا أرسل الفرونت اند نوعاً خاطئاً، يُرفض الطلب مباشرة قبل أن يصل لكودك.

---

## Real-time: الميزة الأقوى في Convex

هذا ما يميّز Convex عن غيره. تخيل:

```
المشرف يغيّر حالة الطلب إلى "مقبول"
         ↓
Convex يحفظ التغيير
         ↓
كل الـ Queries المرتبطة بهذا الطلب تُحدَّث تلقائياً
         ↓
شاشة الطالب تتحدث لحظياً دون تحديث الصفحة!
```

لا تحتاج WebSockets أو polling. Convex يتولى هذا كله.

---

## لماذا اخترنا Convex لهذا المشروع؟

1. **TypeScript من أول لآخر** — الفرونت اند والباك اند يشتركان في نفس الأنواع
2. **Real-time مجاني** — الإشعارات تظهر فوراً بدون كود إضافي
3. **Transaction آمنة** — لا تناسق في البيانات عند المشاكل
4. **Indexes مدمجة** — الاستعلامات سريعة بدون إعداد منفصل
5. **Self-hosting ممكن** — يمكن تشغيله على سيرفرك الخاص (مثل ما فعلنا)

---

## ملخص الفصل الثاني

- Convex هو منصة backend كاملة تجمع قاعدة بيانات + سيرفر + ملفات + جدولة
- هناك 3 أنواع دوال: **Query** (قراءة) و **Mutation** (تغيير) و **Action** (عمليات خارجية)
- كل دالة تحصل على `ctx` للوصول للبيانات والمصادقة والملفات
- كل argument يجب تعريف نوعه بـ `v` للحماية التلقائية
- أقوى ميزة: Real-time — الشاشات تتحدث فوراً عند أي تغيير

---

**السابق:** [الفصل الأول — ما هو المشروع؟](./01-project-intro.md)  
**التالي:** [الفصل الثالث — بنية المشروع](./03-project-structure.md)
