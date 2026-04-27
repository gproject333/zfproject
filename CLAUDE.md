# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Commands

```bash
# Start development (runs Convex backend + Next.js frontend concurrently)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Run Convex backend tests (requires vitest + convex-test setup)
npx vitest --environment edge-runtime
```

Use `pnpm` instead of `npm` if a `pnpm-lock.yaml` is present (it is here).

## Architecture

This is a **Next.js + Convex + Clerk** full-stack app using the Next.js App Router.

### Layers

**Frontend** (`app/`, `components/`)
- `app/layout.tsx` — root layout; wraps the entire tree in `<ConvexClientProvider>` (which in turn wraps Convex + Clerk providers)
- `app/page.tsx` — client component; shows authenticated/unauthenticated UI with real-time Convex data
- `app/server/page.tsx` + `app/server/inner.tsx` — demonstrates server-component preloading via `preloadQuery`
- `components/ConvexClientProvider.tsx` — wires `ConvexProviderWithClerk` so auth tokens are forwarded to Convex on every request

**Backend** (`convex/`)
- `convex/schema.ts` — single source of truth for database tables; edit here first when adding data
- `convex/myFunctions.ts` — example query (`listNumbers`), mutation (`addNumber`), and action (`myAction`)
- `convex/auth.config.ts` — Clerk JWT provider config; the `providers` array is currently commented out — uncomment and set the correct Clerk issuer URL before enabling auth-protected queries
- `convex/_generated/` — auto-generated; never edit manually; regenerated on `npx convex dev`

**Middleware** (`proxy.ts`)
- Clerk middleware protects the `/server` route; all other routes are public

### Auth flow

Client → `ConvexProviderWithClerk` fetches a Clerk JWT → Convex validates it against `auth.config.ts` → functions read identity via `ctx.auth.getUserIdentity()`. Use `identity.tokenIdentifier` (not `identity.subject`) as the stable user key.

### Convex function routing

File-based: `convex/foo/bar.ts` → `api.foo.bar.*` (public) or `internal.foo.bar.*` (internal). Always use `internalQuery/Mutation/Action` for functions that must not be callable from the client.

### Key constraints (from Convex guidelines)

- Always include argument validators (`v.*`) on every Convex function.
- Never use `.filter()` in queries — use indexed `.withIndex()` instead.
- Never use `.collect()` for unbounded tables — use `.take(n)` or paginate.
- Never pass a userId as a function argument for auth — derive it server-side with `ctx.auth.getUserIdentity()`.
- Actions cannot use `ctx.db`; keep Node.js-only code in separate files with `"use node";` at the top.
