# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `packages/convex/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install` from inside `packages/convex/`.
<!-- convex-ai-end -->

## Monorepo layout

This is a **pnpm workspace** monorepo (`pnpm-workspace.yaml` → `packages/*`):

- `packages/web/` — Next.js 16 App Router frontend (`@smart-zuj/web`)
- `packages/convex/` — Convex backend: schema, queries, mutations, actions, HTTP routes, crons (`@smart-zuj/convex`)
- `packages/core/` — shared TypeScript code consumed by web + convex (`@smart-zuj/core`)

## Commands (run from repo root)

```bash
# Start all packages in dev concurrently (Convex backend + Next.js)
pnpm dev

# Production build (deploys Convex first, then builds web)
pnpm build

# Lint all packages
pnpm lint

# Tests across all packages
pnpm test

# Backend-only: cd packages/convex && pnpm dev     (or `pnpm test` for vitest)
# Web-only:     cd packages/web     && pnpm dev
```

## Architecture

This is a **Next.js + Convex + Clerk** full-stack app using the Next.js App Router. Web and backend live in separate workspace packages.

### Frontend — `packages/web/`

- `src/app/layout.tsx` — root layout; wraps the tree in `<ClerkProvider>` → `<ThemeProvider>` → `<Providers>` → `<TooltipProvider>` → `<ConvexClientProvider>`
- `src/app/ConvexClientProvider.tsx` — wires `ConvexProviderWithClerk` so Clerk JWTs are forwarded to Convex on every request
- `src/app/(auth)/`, `src/app/student/`, `src/app/supervisor/`, `src/app/admin/`, `src/app/sponsor/` — role-scoped route groups
- `src/features/<domain>/` — feature-based architecture (components, hooks, utils, types per domain). Large components are split into directories with an `index.tsx` entry; sibling files hold sub-components.
- `src/proxy.ts` — Clerk middleware

### Backend — `packages/convex/convex/`

- `schema.ts` — single source of truth for database tables; edit here first when adding data
- `auth.config.ts` — Clerk JWT provider config (uses `CLERK_JWT_ISSUER_DOMAIN` env var)
- `http.ts` — HTTP endpoints (e.g. Clerk webhooks via svix)
- `crons.ts` — scheduled jobs
- Feature files at the root: `articles.ts`, `banners.ts`, `colleges.ts`, `meetings.ts`, `notifications.ts`, `socialLinks.ts`, `entrepreneurialGuide.ts`, `studentNotes.ts`, `supervisorUpgradeRequests.ts`, `activityLogs.ts`, `files.ts`, `users.ts`
- Feature folders for larger domains:
  - `applications/` — `student.ts`, `supervisor.ts`, `sponsor.ts`, `shared.ts`
  - `users/` — `admin.ts`, `adminActions.ts`, `dev.ts`, `shared.ts`
- `lib/` — shared helpers (`auth.ts`, `notifications.ts`, `statuses.ts`, `uploads.ts`, `users.ts`, `validation.ts`)
- `_generated/` — auto-generated; never edit manually; regenerated on `pnpm --filter @smart-zuj/convex dev`
- Tests are colocated as `*.test.ts` (run with vitest)

The Convex package's `src/index.ts` re-exports types/utilities so other packages can import them as `@smart-zuj/convex`.

### Auth flow

Client → `ConvexProviderWithClerk` fetches a Clerk JWT → Convex validates it against `auth.config.ts` → functions read identity via `ctx.auth.getUserIdentity()`. Use `identity.tokenIdentifier` (not `identity.subject`) as the stable user key.

### Convex function routing

File-based: `packages/convex/convex/foo/bar.ts` → `api.foo.bar.*` (public) or `internal.foo.bar.*` (internal). Always use `internalQuery/Mutation/Action` for functions that must not be callable from the client.

### Key constraints (from Convex guidelines)

- Always include argument validators (`v.*`) on every Convex function.
- Never use `.filter()` in queries — use indexed `.withIndex()` instead.
- Never use `.collect()` for unbounded tables — use `.take(n)` or paginate.
- Never pass a userId as a function argument for auth — derive it server-side with `ctx.auth.getUserIdentity()`.
- Actions cannot use `ctx.db`; keep Node.js-only code in separate files with `"use node";` at the top.

## Convex Deployment

This project runs Convex on **two separate environments** that must both be updated after any schema or function change:

| البيئة | الرابط | الوصف |
|--------|--------|-------|
| ☁️ Convex Cloud | `https://trustworthy-sheep-722.eu-west-1.convex.cloud` | Production on Convex hosted cloud |
| 🏠 Self-Hosted | `https://convex.yazeid.site` | Production on Coolify (self-hosted) |
| 🖥️ Dev (local) | `http://127.0.0.1:3210` | Local development machine |

### One-command deploy to both environments

```bash
cd packages/convex
bash deploy.sh
```

This script (`packages/convex/deploy.sh`) deploys to **Cloud first**, then **Self-Hosted**.

### Setup (first time on a new machine)

1. Create `packages/convex/.env.selfhosted` (already in `.gitignore`, never commit):
   ```env
   CONVEX_SELF_HOSTED_URL=https://convex.yazeid.site
   CONVEX_SELF_HOSTED_ADMIN_KEY=<admin-key-from-coolify>
   ```
2. The Convex Cloud credentials are in `packages/web/.env.local` (already configured).

### Deploy to Cloud only

```bash
cd packages/convex
npx convex deploy --env-file ../web/.env.local
```

### Deploy to Self-Hosted only

```bash
cd packages/convex
npx convex deploy --env-file .env.selfhosted
```

> **Note:** The Self-Hosted dashboard is available at https://convex-dash.yazeid.site/
> The Admin Key is stored in Coolify under the Convex service environment variables.
