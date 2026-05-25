# Self-Hosted Deployment Guide

دليل النشر الذاتي (self-hosted) للتطبيق على VPS باستخدام Coolify + Convex + Clerk Production.

## نظرة عامة على البنية التحتية

| الخدمة | الرابط | البورت الداخلي |
|--------|--------|----------------|
| Web App (Next.js) | `https://app.yazeid.site` | 3000 |
| Convex API | `https://convex.yazeid.site` | 3210 |
| Convex HTTP Actions / Webhooks | `https://convex-http.yazeid.site` | 3211 |
| Convex Dashboard | `https://convex-dash.yazeid.site` | 6791 |
| Coolify Panel | `https://coolify.yazeid.site` | 8000 |
| Clerk Auth (Production) | `https://clerk.app.yazeid.site` | — |

**VPS:** Hostinger, IP `187.77.110.216`, Linux.

## DNS Records (Hostinger)

### للتطبيق
```
A   coolify        → 187.77.110.216
A   app            → 187.77.110.216
A   convex         → 187.77.110.216
A   convex-http    → 187.77.110.216
A   convex-dash    → 187.77.110.216
```

### للـ Clerk Production (CNAME)
```
CNAME clerk.app           → frontend-api.clerk.services
CNAME accounts.app        → accounts.clerk.services
CNAME clkmail.app         → mail.d8vinwgrn25m.clerk.services
CNAME clk._domainkey.app  → dkim1.d8vinwgrn25m.clerk.services
CNAME clk2._domainkey.app → dkim2.d8vinwgrn25m.clerk.services
```

> الـ `d8vinwgrn25m` قيمة خاصة بهذا الحساب — Clerk بيولّدها لكل instance.

## 1. إعداد Coolify

أول مرة على VPS فاضي، نصّبي Coolify عبر:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

ثم:
1. افتحي `http://<IP>:8000` وأنشئي حساب admin
2. **Settings → Instance's Domain:** `https://coolify.yazeid.site` → Save (يطلب SSL تلقائياً)

## 2. نشر Convex Self-Hosted

### Docker Compose

في Coolify: **Projects → my-first-project → production → + New Resource → Docker Compose Empty**.

ضعي الـ YAML التالي:

```yaml
services:
  convex-backend:
    image: ghcr.io/get-convex/convex-backend:latest
    restart: unless-stopped
    volumes:
      - type: bind
        source: /data/coolify/convex-storage
        target: /convex/data
    environment:
      - INSTANCE_NAME=smart-zuj
      - INSTANCE_SECRET=${INSTANCE_SECRET}
      - CONVEX_CLOUD_ORIGIN=https://convex.yazeid.site
      - CONVEX_SITE_ORIGIN=https://convex-http.yazeid.site
      - DISABLE_BEACON=true
      - RUST_LOG=info
    expose:
      - "3210"
      - "3211"
    labels:
      - traefik.enable=true
      - "traefik.http.routers.convex-api.rule=Host(`convex.yazeid.site`)"
      - traefik.http.routers.convex-api.entrypoints=https
      - traefik.http.routers.convex-api.tls=true
      - traefik.http.routers.convex-api.tls.certresolver=letsencrypt
      - traefik.http.routers.convex-api.service=convex-api
      - traefik.http.services.convex-api.loadbalancer.server.port=3210
      - "traefik.http.routers.convex-site.rule=Host(`convex-http.yazeid.site`)"
      - traefik.http.routers.convex-site.entrypoints=https
      - traefik.http.routers.convex-site.tls=true
      - traefik.http.routers.convex-site.tls.certresolver=letsencrypt
      - traefik.http.routers.convex-site.service=convex-site
      - traefik.http.services.convex-site.loadbalancer.server.port=3211
  convex-dashboard:
    image: ghcr.io/get-convex/convex-dashboard:latest
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_DEPLOYMENT_URL=https://convex.yazeid.site
    expose:
      - "6791"
    depends_on:
      - convex-backend
```

### Environment Variables (في Coolify)

```
INSTANCE_SECRET = <openssl rand -hex 32>
```

### Domains في Coolify UI

- **convex-backend:** خانة Domains فاضية (الـ labels في الـ compose بتظبط Traefik)
- **convex-dashboard:** `https://convex-dash.yazeid.site` في خانة Domains

Save → Deploy.

### تحقّق

```bash
# من السيرفر
docker logs convex-backend-<id> --tail 20
# لازم تشوفي: backend listening on 0.0.0.0:3210

# من المتصفح
https://convex.yazeid.site/version  → "unknown" (طبيعي)
https://convex-dash.yazeid.site     → لوحة Convex
```

## 3. توليد Admin Key ودفع كود Convex

### توليد الـ key

عبر SSH على الـ VPS:

```bash
docker exec -it convex-backend-<id> ./generate_admin_key.sh
```

النتيجة تبدأ بـ `smart-zuj|01...` — احفظيها في password manager.

### دفع الـ schema و functions

من جهاز التطوير:

```bash
cd packages/convex

# علقي CONVEX_DEPLOYMENT في .env.local عشان ما تتعارض مع self-hosted
sed -i 's/^CONVEX_DEPLOYMENT=/#CONVEX_DEPLOYMENT=/' .env.local

export CONVEX_SELF_HOSTED_URL="https://convex.yazeid.site"
export CONVEX_SELF_HOSTED_ADMIN_KEY='smart-zuj|01abc...'

# Convex env vars (محتاجة من Clerk وبعض الإعدادات)
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://clerk.app.yazeid.site"
npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."

# Deploy
npx convex deploy
```

> ⚠️ استخدمي **single quotes** للـ admin key عشان الـ `|` ما يتفسر بالـ shell.

## 4. نشر Next.js

### GitHub App في Coolify

1. **Sources → + Add Source → GitHub App**
2. Coolify بيحوّلك على GitHub لإنشاء app
3. ثبّتي الـ App على الـ repo `gproject333/zfproject`

### Application Resource

1. **+ New Resource → Private Repository (with GitHub App)**
2. Repository: `gproject333/zfproject`
3. Branch: `main`
4. Build Pack: **Nixpacks**

### Configuration

| Field | Value |
|-------|-------|
| Base Directory | `/` |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm --filter @smart-zuj/web build` |
| Start Command | `pnpm --filter @smart-zuj/web start` |
| Port | `3000` |
| Domain | `https://app.yazeid.site` |

### Environment Variables

| Name | Build Variable? | Value |
|------|-----------------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | `https://convex.yazeid.site` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | ✅ | `https://convex-http.yazeid.site` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | `pk_live_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | `/sign-in` |
| `CLERK_SECRET_KEY` | ❌ | `sk_live_...` |
| `CLERK_WEBHOOK_SECRET` | ❌ | `whsec_...` |

> 🔑 المتغيرات اللي بتبدأ بـ `NEXT_PUBLIC_` لازم تكون **Build Variable** لأنها بتنحقن داخل JavaScript bundle وقت الـ build.

Save → Deploy.

## 5. Clerk Production Setup

### إنشاء Production Instance

1. Clerk Dashboard → **Create production instance**
2. Application domain: `app.yazeid.site`
3. اختاري **Secondary application** (لأن `yazeid.site` الـ root مش للتطبيق)
4. أضيفي الـ 5 CNAME records في Hostinger (انظري قسم DNS فوق)
5. اضغطي **Verify** على Clerk حتى تظهر كل الـ records ✅ Verified
6. SSL certificates بتنصدر تلقائياً

### Production API Keys

في Clerk → **Configure → API Keys**:
- انسخي `pk_live_...` و `sk_live_...`
- حدّثيها في Coolify env vars (انظري الجدول فوق)
- **Force rebuild** للـ web app عشان الـ JS bundle يتجدد

### Webhook

في Clerk → **Configure → Webhooks → + Add Endpoint**:

| Field | Value |
|-------|-------|
| Endpoint URL | `https://convex-http.yazeid.site/clerk-user-webhook` |
| Events | `user.created`, `user.updated`, `user.deleted` |

> ⚠️ الـ path هو `/clerk-user-webhook` (singular `user`، مش `users`).

انسخي الـ Signing Secret (`whsec_...`) وحطّيها في:
1. Convex: `npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."`
2. Coolify: env var `CLERK_WEBHOOK_SECRET` للـ web app

## 6. إنشاء أول حساب Admin

في self-hosted Convex، الـ `users:dev:makeMeAdmin` بتعمل assertion على `NODE_ENV !== "production"`. الطريقة الأسهل:

### أ) أضيفي كلية وقسم يدوياً (لأن التسجيل بطلبهم)

في Convex Dashboard → جدول `colleges`:
```json
{ "name": "كلية تكنولوجيا المعلومات", "createdAt": 1748180000000 }
```

ثم في `departments`:
```json
{
  "name": "علم الحاسوب",
  "collegeId": "<انسخي _id من الـ college أعلاه>",
  "createdAt": 1748180000000
}
```

### ب) سجّلي حسابك العادي من الموقع

الـ Clerk webhook بتحفظ صف في `users` تلقائياً.

### ج) رقّي نفسك لـ admin

في Convex Dashboard → `users` → الصف تبعك → عدّلي `role` لـ `"admin"` → Save.

### د) سجّلي خروج ودخول

بصير معك صلاحيات admin، بتقدري تضيفي باقي الكليات والأقسام من لوحة الـ admin.

## 7. سير العمل اليومي

### تعديل Web (Next.js)

أوتوماتيك ✅ — أي push على `main` بعمل redeploy.

```bash
git push origin main
# Coolify بياخد 3-5 دقائق و ينشر النسخة الجديدة
```

### تعديل Convex (Backend)

يدوي ❌:

```bash
cd packages/convex
export CONVEX_SELF_HOSTED_URL="https://convex.yazeid.site"
export CONVEX_SELF_HOSTED_ADMIN_KEY='smart-zuj|...'
npx convex deploy
```

> 💡 اعملي `deploy-convex.sh` script (مع `.gitignore`) عشان ما تكرري الأوامر.

## 8. الصيانة

### النسخ الاحتياطية

```bash
# على VPS
tar -czf convex-backup-$(date +%F).tar.gz /data/coolify/convex-storage
```

اخزني الـ tarball في مكان خارجي (S3, Google Drive, إلخ).

### مراقبة المساحة

```bash
df -h
docker system df
```

لتنظيف images قديمة:
```bash
docker system prune -a --volumes
```

### السجلات (Logs)

```bash
# Convex backend
docker logs convex-backend-<id> --tail 100 -f

# Web app
docker logs <web-container-name> --tail 100 -f
```

## استكشاف الأخطاء

| الخطأ | السبب الأرجح | الحل |
|-------|--------------|------|
| `no available server` على `convex.yazeid.site` | Traefik labels مش مضبوطة | شيكي compose labels |
| `BadAdminKey` عند `npx convex deploy` | الـ key فيه prefix غلط مثل `convex-self-hosted\|` | استخدمي الـ key كما هو من `generate_admin_key.sh` (يبدأ بـ `smart-zuj\|`) |
| `Clerk loaded with development keys` بعد التحديث | الـ `NEXT_PUBLIC_*` ما اتعمل rebuild | في Coolify اعملي **Force rebuild without cache** |
| الـ users ما بتنحفظ في Convex بعد التسجيل | الـ webhook path غلط أو الـ secret غلط | تأكدي من path `/clerk-user-webhook` (singular) و `CLERK_WEBHOOK_SECRET` |
| CAPTCHA error 600010 | الدومين مش مسجّل في Clerk أو لسا dev keys | تأكدي إنه بتستخدمي `pk_live_...` |

## ملفات ذات صلة

- `packages/convex/convex/http.ts` — Clerk webhook handler
- `packages/convex/convex/auth.config.ts` — JWT issuer config
- `packages/convex/convex/users/dev.ts` — وظائف helper للتطوير (`makeMeAdmin`)
- `packages/convex/convex/schema.ts` — تعريف الجداول
