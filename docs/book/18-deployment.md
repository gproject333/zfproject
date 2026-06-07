# الفصل الثامن عشر: النشر — deploy.sh

> **قبل هذا الفصل يجب أن تعرف:** [الفصل السابع عشر — الأنماط المشتركة](./17-lib-patterns.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف يُنشر الباك اند على بيئتين مستقلتين، ما هي متغيرات البيئة المطلوبة، وكيف يعمل سكريبت النشر.

---

## البيئتان

المشروع يعمل على **بيئتين إنتاجيتين في نفس الوقت:**

| البيئة | الرابط | الوصف |
|--------|--------|-------|
| ☁️ Convex Cloud | `https://trustworthy-sheep-722.eu-west-1.convex.cloud` | مستضافة على سحابة Convex |
| 🏠 Self-Hosted | `https://convex.yazeid.site` | مستضافة على Coolify (سيرفر خاص) |

**لماذا بيئتان؟**
- الـ Cloud للإتاحة العالية والسرعة
- الـ Self-Hosted للخصوصية والتحكم الكامل بالبيانات (قد تشترطه بعض الجهات الجامعية)

---

## متغيرات البيئة

قبل النشر، تحتاج ملفي `.env`:

### packages/web/.env.local (للـ Cloud)

```env
NEXT_PUBLIC_CONVEX_URL=https://trustworthy-sheep-722.eu-west-1.convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://clerk.yourapp.com
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### packages/convex/.env.selfhosted (للـ Self-Hosted)

```env
CONVEX_SELF_HOSTED_URL=https://convex.yazeid.site
CONVEX_SELF_HOSTED_ADMIN_KEY=<admin-key-from-coolify>
```

**لا تُضف هذا الملف لـ Git أبداً!** هو في `.gitignore` بالفعل.

---

## سكريبت النشر deploy.sh

```bash
#!/bin/bash
# =============================================================
# Smart-ZUJ — Convex Deploy Script
# =============================================================

set -e  # ← أوقف السكريبت فوراً عند أي خطأ

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SELFHOSTED_ENV="$SCRIPT_DIR/.env.selfhosted"

echo "🚀 Smart-ZUJ Convex Deploy"

# ── الخطوة 1: النشر على Convex Cloud ──────────────────────
echo "📡 [1/2] رفع على Convex Cloud..."
npx convex deploy --env-file "$SCRIPT_DIR/../web/.env.local"

# ── الخطوة 2: النشر على Self-Hosted ───────────────────────
echo "🏠 [2/2] رفع على Self-Hosted..."

# تحقق من وجود ملف الـ .env
if [ ! -f "$SELFHOSTED_ENV" ]; then
  echo "❌ ملف .env.selfhosted غير موجود!"
  exit 1
fi

npx convex deploy --env-file "$SELFHOSTED_ENV"

echo "✅ تم الرفع بنجاح على كلا البيئتين!"
```

**`set -e`** = إذا فشلت أي خطوة (مثلاً فشل النشر على Cloud)، يتوقف السكريبت ولا يُحاول النشر على Self-Hosted. هذا مهم لتفادي نشر نسخ غير متزامنة.

---

## كيف يعمل `npx convex deploy`؟

```
npx convex deploy --env-file .env.local

↓ يقرأ CONVEX_URL من الـ .env
↓ يُحلّل كل ملفات convex/ ويتأكد من صحتها
↓ يُولّد ملفات _generated/ المحلية إذا احتاج
↓ يُرسل الكود لسيرفر Convex
↓ Convex يُشغّل الكود الجديد
↓ تُحدَّث قاعدة البيانات (schema migrations تلقائياً)
```

---

## النشر على Cloud فقط

```bash
cd packages/convex
npx convex deploy --env-file ../web/.env.local
```

---

## النشر على Self-Hosted فقط

```bash
cd packages/convex
npx convex deploy --env-file .env.selfhosted
```

---

## النشر على الاثنين (الطريقة العادية)

```bash
cd packages/convex
bash deploy.sh
```

---

## Schema Migrations تلقائية

عند تغيير `schema.ts`، Convex يُطبّق التغييرات تلقائياً:
- إضافة جدول جديد → يُنشأ فوراً
- إضافة حقل جديد (optional) → لا تأثير على السجلات القديمة
- حذف حقل → يُحذف من السجلات الجديدة فقط

**لكن انتبه:** تغيير نوع حقل موجود (مثلاً من `v.string()` لـ `v.number()`) يحتاج migration يدوية. هذا السبب في وجود الحقول القديمة (`college`, `department`) بجانب الجديدة (`collegeId`, `departmentId`) في مشروعنا.

---

## بيئة التطوير

للتطوير المحلي:

```bash
# من مجلد المشروع الرئيسي
pnpm dev

# أو للباك اند فقط
cd packages/convex
pnpm dev
```

Convex يُشغّل على `http://127.0.0.1:3210` محلياً، مع لوحة تحكم على `http://127.0.0.1:3210/dashboard`.

---

## نصائح لأمان النشر

1. **لا تُضف .env.selfhosted لـ Git أبداً** (في .gitignore)
2. **لا تُضف الـ CLERK_SECRET_KEY في الكود** — استخدم متغيرات البيئة
3. **الـ deploy.sh يتوقف عند أي خطأ** (بفضل `set -e`)
4. **اختبر محلياً أولاً** قبل أي نشر على الإنتاج

---

## ملخص الفصل الثامن عشر

- المشروع يُنشر على بيئتين: Convex Cloud + Self-Hosted
- `deploy.sh` ينشر على الاثنتين بترتيب: Cloud أولاً ثم Self-Hosted
- `set -e` يضمن التوقف فوراً عند أي فشل
- Schema migrations تلقائية لإضافة الجداول والحقول الاختيارية
- لا تُضف ملفات .env لـ Git أبداً

---

## تهانيّ — أنهيت الكتاب!

لقد قرأت كيف تُبنى منصة كاملة من الصفر باستخدام Convex. الآن تعرف:

- ✅ كيف تُعرّف قاعدة بيانات بـ schema.ts
- ✅ كيف تربط المصادقة بـ Clerk عبر Webhooks
- ✅ كيف تكتب نظام صلاحيات متعدد الأدوار
- ✅ كيف تُبني state machine للطلبات
- ✅ كيف تُرسل إشعارات (داخلية + WhatsApp)
- ✅ كيف تحذف البيانات بأمان مع الـ cascade
- ✅ أهم الأنماط: Outbox، Audit Trail، Batch Loading
- ✅ كيف تنشر على بيئات متعددة

**الخطوة التالية:** اقرأ الكود الحقيقي في `packages/convex/convex/` مع هذا الكتاب كمرجع.

---

**السابق:** [الفصل السابع عشر — الأنماط المشتركة](./17-lib-patterns.md)  
**الفهرس:** [README — فهرس الكتاب](./README.md)
