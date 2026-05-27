# حاضنة الزيتونة — ZUJ Incubator

> منصّة احتضان المشاريع الريادية والتقنية والأكاديمية لطلبة **جامعة الزيتونة الأردنية** — من مرحلة الفكرة إلى مشروع مكتمل الدعم.

A full-stack incubator platform for Zarqa University students to submit, track, and get supervisor feedback on entrepreneurial / IT graduation / university-serving projects. Includes WhatsApp notifications, a sponsor interest matchmaking surface, and an admin control plane.

---

## ما توفّره المنصّة

### للطلاب
- تقديم طلب احتضان بأحد ثلاثة مسارات: **فكرة ريادية**، **مشروع تخرج IT**، **مشروع يخدم الجامعة**.
- نموذج رقمي متغيّر الحقول حسب نوع المشروع، يدعم رفع المستندات والفيديو.
- متابعة الحالة فوريًّا (قيد المراجعة، مقبول، يحتاج تعديل، مرفوض) + سجل ملاحظات المشرف.
- إشعارات **واتساب** عند جدولة لقاء أو صدور قرار، مع رمز تحقق OTP لربط الرقم.

### للمشرفين الأكاديميين
- مراجعة الطلبات بمحاور تعديل / قبول / رفض مع ملاحظات.
- جدولة لقاءات وإرسالها مباشرةً للطالب على واتساب.
- إدارة الإعلانات والمقالات والدليل الريادي.

### للداعمين (Sponsors)
- استكشاف مشاريع مقبولة وإبداء اهتمام.
- صفحة اهتمامات لمتابعة المشاريع المختارة.

### للإدارة (Admin)
- إنشاء حسابات المشرفين والداعمين.
- إدارة الكليات والتخصصات.
- مراجعة طلبات الترقية من طالب إلى مشرف.
- سجلات النشاط ورسائل الواتساب المرسلة.
- روابط التواصل الاجتماعي للمنصة.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) — frontend
- **Convex** (self-hosted) — database, server functions, scheduled jobs, file storage
- **Clerk** — authentication & user management
- **pnpm workspaces** — monorepo
- **Tailwind + HeroUI** — design system + primitives
- **n8n + Evolution API** — WhatsApp message delivery pipeline
- **TypeScript** end-to-end
- **Vitest** — unit & integration tests
- Deployed via **Coolify** to a self-hosted server.

## Monorepo layout

```
packages/
├── web/      → @smart-zuj/web      Next.js 16 frontend
├── convex/   → @smart-zuj/convex   Convex backend (schema, queries, mutations, actions, crons)
└── core/     → @smart-zuj/core     Shared types & utilities (validators, formatters, role helpers)
```

See [`CLAUDE.md`](./CLAUDE.md) for a deeper architectural walkthrough.

---

## Quick start

```bash
# 1. Install
pnpm install

# 2. Copy env files and fill them in
cp packages/web/.env.example packages/web/.env.local
# packages/convex/.env.local is auto-managed by `npx convex dev`

# 3. Start everything in dev (Convex backend + Next.js)
pnpm dev
```

Then open `http://localhost:3000`.

### Required environment variables

**`packages/web/.env.local`:**
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `NEXT_PUBLIC_CONVEX_SITE_URL` — Convex HTTP site URL
- `CONVEX_DEPLOYMENT` — dev deployment name
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

**Convex deployment env (set via `npx convex env set …`):**
- `CLERK_JWT_ISSUER_DOMAIN`
- `N8N_BASE_URL` — for WhatsApp notifications
- `N8N_WEBHOOK_SECRET` — HMAC signing for outbound webhooks

---

## Commands

```bash
pnpm dev               # All packages in parallel
pnpm build             # Web production build (Convex deploy is separate)
pnpm build:convex      # Push backend functions to a Convex deployment
pnpm build:all         # build:convex then build (use locally with env vars set)
pnpm lint              # Workspace-wide
pnpm test              # Workspace-wide
```

For Convex backend changes you usually want:

```bash
cd packages/convex
npx convex dev         # Watches and pushes to your dev deployment
pnpm test              # Vitest (unit tests + convex-test integration)
```

---

## WhatsApp pipeline

A verified student receives an OTP + meeting + status_change notifications on WhatsApp:

```
Convex mutation ─► whatsappOutbox row ─► ctx.scheduler.runAfter
                                          │
                                          ▼
                                   Node action (HMAC sign)
                                          │
                                          ▼
                                  POST n8n webhook
                                          │
                                          ▼
                                  Evolution API → WhatsApp
```

- All function code lives under `packages/convex/convex/whatsapp/`.
- n8n workflow JSONs are version-controlled in `docs/n8n/`.

---

## Architecture highlights

- **Role-scoped routing:** `(auth)/`, `student/`, `supervisor/`, `admin/`, `sponsor/` route groups in `packages/web/src/app/`. Role guards live in `src/components/RoleGuard.tsx`.
- **Feature-based frontend:** `packages/web/src/features/<domain>/` contains components + hooks + types per domain.
- **Single source of truth for data:** `packages/convex/convex/schema.ts` — every table is defined there.
- **Auth bridge:** `ConvexProviderWithClerk` forwards Clerk JWTs to Convex; backend reads identity via `ctx.auth.getUserIdentity()`.
- **Shared types via `@smart-zuj/convex`:** the convex package re-exports `Doc<>`, `Id<>`, and `api` so the web app gets full end-to-end type safety.

---

## Deployment

The repo deploys via **Coolify** on a self-hosted server. The default `pnpm build` builds only the web app (Coolify path). Convex backend changes are pushed separately:

```bash
cd packages/convex
export CONVEX_SELF_HOSTED_URL="https://convex.yazeid.site"
export CONVEX_SELF_HOSTED_ADMIN_KEY="<from-self-hosted-admin-key-script>"
npx convex deploy -y
```

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full self-hosted setup (Convex, n8n, Evolution, Clerk).

---

## Contributing

1. Branch off `main`: `git checkout -b feat/<short-name>`
2. Run `pnpm lint && pnpm test && pnpm --filter @smart-zuj/web exec tsc --noEmit` before pushing
3. Open a PR; auto-deploy on `main` after merge handles the web side

---

## License

Internal project for جامعة الزيتونة الأردنية.
