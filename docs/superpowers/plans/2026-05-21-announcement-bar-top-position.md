# Announcement Bar — Move to Top of Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the `ScrollingAnnouncementBar` so it is the topmost element of every layout (above the navbar) and scrolls away with the page while the navbar sticks to the top — exactly like Udemy's promo bar.

**Architecture:** The bar becomes a plain normal-flow element placed before the navbar in each layout. All navbars/headers are (or become) `position: sticky top-0`, so the bar scrolls off naturally and the navbar then sticks. The dashboard and supervisor navbars are already sticky; the landing navbar is converted from `fixed` to `sticky`, with offset and `overflow-x` adjustments so the cinematic hero and sticky positioning keep working.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript.

---

## Notes for the implementer

- **Branch:** Do this work on a feature branch (e.g. `feat/announcement-bar-top`), not on `main`.
- **Spec:** `docs/superpowers/specs/2026-05-21-announcement-bar-top-position-design.md`.
- **No unit tests in this plan.** This is a pure layout/CSS-positioning change. Asserting on Tailwind class strings would test implementation details, not behavior, and would be brittle. Verification for every task is: (1) `tsc` clean, (2) `eslint` clean on touched files, (3) a manual visual check in the running dev server.
- **`tsc` baseline:** `npx tsc --noEmit -p tsconfig.json` currently reports ONE pre-existing unrelated error in `convex/colleges.test.ts` (`Property 'glob' does not exist on type 'ImportMeta'`). That one is expected — any OTHER error is a regression.
- **Dev server:** assumed running at `http://localhost:3000` (`pnpm dev`).
- **Task order matters:** Tasks 1–3 only relocate the bar / adjust layouts; the `variant` prop stays optional and untouched so `tsc` stays green. Task 4 removes the now-unused prop last.

---

## Task 1: Move the announcement bar above the navbar in `DashboardLayout`

`DashboardLayout` has two layout branches; the bar must move to the top in BOTH. The bar currently renders *after* the navbar/header in each branch. Both navbars/headers are already `sticky top-0`, so only the bar's position in the JSX changes.

**Files:**
- Modify: `src/components/layout/DashboardLayout.tsx`

- [ ] **Step 1: Sidebar branch — move the bar before the `<header>`**

In the sidebar branch, find this block (the bar currently sits *after* `</header>`):

```tsx
            </header>

            <ScrollingAnnouncementBar audience="student" />

            <main className="flex-1 p-4 md:p-6">
```

Replace it with (bar removed from here):

```tsx
            </header>

            <main className="flex-1 p-4 md:p-6">
```

Then find the start of that same content column:

```tsx
            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-card nb-border border-t-0 border-x-0 px-4 py-3 flex items-center justify-between">
```

Replace it with (bar inserted before the header):

```tsx
            <ScrollingAnnouncementBar audience="student" />

            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-card nb-border border-t-0 border-x-0 px-4 py-3 flex items-center justify-between">
```

- [ ] **Step 2: Non-sidebar branch — move the bar before the `<nav>`**

In the non-sidebar branch, find this block (the bar currently sits *after* `</nav>`):

```tsx
        </nav>

        <ScrollingAnnouncementBar audience="student" />

        {/* Content */}
```

Replace it with (bar removed from here):

```tsx
        </nav>

        {/* Content */}
```

Then find the start of the navbar in that branch:

```tsx
        {/* Top Navbar */}
        <nav className="sticky top-0 z-50 bg-card nb-border-thick border-t-0 border-x-0">
```

Replace it with (bar inserted before the navbar):

```tsx
        <ScrollingAnnouncementBar audience="student" />

        {/* Top Navbar */}
        <nav className="sticky top-0 z-50 bg-card nb-border-thick border-t-0 border-x-0">
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: only the pre-existing `convex/colleges.test.ts` error. No error in `DashboardLayout.tsx`.

- [ ] **Step 4: Lint**

Run: `npx eslint src/components/layout/DashboardLayout.tsx`
Expected: no output (clean).

- [ ] **Step 5: Visual check**

Sign in as a student, open `/student`. Expected: the green announcement bar (if an active announcement exists for this audience) is now ABOVE the navbar. Scroll down — the bar scrolls away and the navbar sticks to the top. Repeat for an admin at `/admin` (sidebar layout): the bar sits above the slim top header inside the content column.
Note: if no active announcement exists, the bar renders nothing — this is correct; verify only that nothing is broken.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/DashboardLayout.tsx
git commit -m "refactor: move announcement bar above navbar in DashboardLayout

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Move the announcement bar above the header in `SupervisorSidebarLayout`

The supervisor layout has a right-aligned sidebar and a slim sticky top `<header>`. The bar currently renders after the header; move it before.

**Files:**
- Modify: `src/components/layout/SupervisorSidebarLayout.tsx`

- [ ] **Step 1: Move the bar before the `<header>`**

Find this block (bar currently *after* `</header>`):

```tsx
          </header>

          <ScrollingAnnouncementBar audience="supervisor" />

          <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
```

Replace it with (bar removed from here):

```tsx
          </header>

          <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
```

Then find the start of the content column's header:

```tsx
          {/* Slim top bar with action buttons pinned to the left edge */}
          <header className="sticky top-0 z-30 bg-card nb-border-thick border-t-0 border-x-0 px-4 py-2.5 flex items-center gap-3">
```

Replace it with (bar inserted before the header):

```tsx
          <ScrollingAnnouncementBar audience="supervisor" />

          {/* Slim top bar with action buttons pinned to the left edge */}
          <header className="sticky top-0 z-30 bg-card nb-border-thick border-t-0 border-x-0 px-4 py-2.5 flex items-center gap-3">
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: only the pre-existing `convex/colleges.test.ts` error.

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/layout/SupervisorSidebarLayout.tsx`
Expected: no output (clean).

- [ ] **Step 4: Visual check**

Sign in as a supervisor, open `/supervisor`. Expected: the announcement bar sits above the slim top header in the content column. Scroll down — the bar scrolls away, the header sticks.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/SupervisorSidebarLayout.tsx
git commit -m "refactor: move announcement bar above header in supervisor layout

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Put the announcement bar at the top of the landing page

This is the delicate task. The landing navbar is `fixed`; convert it to `sticky`, place the bar above it, drop the now-unneeded top padding, and relocate `overflow-x-hidden` (which would otherwise break `position: sticky`).

**Files:**
- Modify: `src/features/landing/components/LandingPage.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: `globals.css` — move `overflow-x: hidden` onto `<body>`**

In `src/app/globals.css`, find the `body` rule:

```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-tajawal), sans-serif;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
```

Replace it with (one line added):

```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-tajawal), sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
```

- [ ] **Step 2: `LandingPage.tsx` — drop `overflow-x-hidden` and `pt-[68px]` from the page wrapper**

Find the page wrapper opening tag:

```tsx
    <div className="min-h-screen bg-pattern flex flex-col overflow-x-hidden pt-[68px]" dir="rtl">
```

Replace it with:

```tsx
    <div className="min-h-screen bg-pattern flex flex-col" dir="rtl">
```

- [ ] **Step 3: `LandingPage.tsx` — insert the bar as the first child, above the navbar**

Immediately after the wrapper `<div>` from Step 2, the next line is `{/* Navbar */}`. Find:

```tsx
    <div className="min-h-screen bg-pattern flex flex-col" dir="rtl">
      {/* Navbar */}
      <nav
```

Replace it with (bar added as the first child):

```tsx
    <div className="min-h-screen bg-pattern flex flex-col" dir="rtl">
      <ScrollingAnnouncementBar audience="landing" />

      {/* Navbar */}
      <nav
```

- [ ] **Step 4: `LandingPage.tsx` — convert the navbar from `fixed` to `sticky`**

Find the navbar's `className` opening (the positioning utilities are on the first line of the template literal):

```tsx
      <nav
        className={`fixed top-0 right-0 left-0 w-full z-50 transition-colors duration-300 ${
```

Replace it with:

```tsx
      <nav
        className={`sticky top-0 w-full z-50 transition-colors duration-300 ${
```

- [ ] **Step 5: `LandingPage.tsx` — remove the old fixed announcement bar**

Further down, find the OLD bar usage (it sits between `<AmbientOlives />` and the cinematic hero comment):

```tsx
      <AmbientOlives />
      <ScrollingAnnouncementBar audience="landing" variant="fixed" />

      {/* Cinematic full-bleed photo hero. Not wrapped in RevealOnScroll;
```

Replace it with (old bar removed; `AmbientOlives` stays):

```tsx
      <AmbientOlives />

      {/* Cinematic full-bleed photo hero. Not wrapped in RevealOnScroll;
```

Note: `CinematicHero`'s `-mt-[68px]` is intentionally NOT changed — it still pulls the hero up under the 68px-tall sticky navbar, preserving the transparent-overlay look for guests.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: only the pre-existing `convex/colleges.test.ts` error. `LandingPage.tsx` still passes `<ScrollingAnnouncementBar audience="landing" />` with no `variant` — valid because `variant` is still an optional prop at this point.

- [ ] **Step 7: Lint**

Run: `npx eslint src/features/landing/components/LandingPage.tsx`
Expected: no output (clean).

- [ ] **Step 8: Visual check (most important — see spec Risks)**

In the dev server, check the landing page `/` in ALL of these states:
1. **Guest, at top:** bar is the topmost strip; navbar sits right below it, transparent over the cinematic hero; hero photo still fills the screen behind the navbar.
2. **Guest, scrolled down:** bar has scrolled away; navbar is stuck to the very top and switched to its glass background.
3. **Signed-in, at top:** bar on top; navbar below it with the solid `bg-card` style.
4. **Signed-in, scrolled down:** bar gone; solid navbar stuck to top.
5. **Dismiss the bar** (✕): bar disappears; navbar moves up to the very top; no leftover gap.
There must be no double gap, no overlap between bar and navbar, and no horizontal scrollbar.

- [ ] **Step 9: Commit**

```bash
git add src/features/landing/components/LandingPage.tsx src/app/globals.css
git commit -m "feat: announcement bar sits at top of landing page (Udemy-style)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Remove the now-unused `variant` prop from `ScrollingAnnouncementBar`

After Tasks 1–3, no caller passes `variant`. Simplify the component: it is now always a plain normal-flow element. Remove the `variant` prop, the `isFixed` branch, the fixed positioning, and the spacer.

**Files:**
- Modify: `src/features/banners/components/ScrollingAnnouncementBar.tsx`

- [ ] **Step 1: Replace the whole file**

Replace the entire contents of `src/features/banners/components/ScrollingAnnouncementBar.tsx` with:

```tsx
"use client";

import { Component, type ReactNode } from "react";
import { X } from "lucide-react";
import { useScrollingAnnouncements } from "../hooks/useScrollingAnnouncements";

interface ScrollingAnnouncementBarProps {
  audience: "student" | "landing" | "supervisor";
}

/**
 * Lightweight error boundary that silently swallows failures (e.g. if
 * the Convex function hasn't been deployed yet) so the rest of the
 * layout keeps working.
 */
class SafeBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function ScrollingAnnouncementBarInner({
  audience,
}: ScrollingAnnouncementBarProps) {
  const { announcement, dismiss } = useScrollingAnnouncements(audience);

  if (!announcement) return null;

  const hasLink = !!announcement.linkHref && !!announcement.linkLabel;

  const textContent = (
    <span className="inline-flex items-center gap-6 whitespace-nowrap px-8">
      <span>{announcement.message}</span>
      {hasLink && (
        <a
          href={announcement.linkHref!}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 font-extrabold hover:opacity-80 transition-opacity"
        >
          {announcement.linkLabel}
        </a>
      )}
    </span>
  );

  return (
    <div
      className="relative w-full bg-primary text-white z-40 overflow-hidden"
      role="marquee"
      aria-label="إعلان"
    >
      {/* Close button */}
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-md flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors"
        aria-label="إغلاق الإعلان"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Marquee track */}
      <div className="nb-marquee-track py-2.5 pr-10">
        <div className="animate-marquee motion-reduce:hidden font-bold text-sm">
          {textContent}
          {textContent}
        </div>

        <div className="hidden motion-reduce:block font-bold text-sm text-center truncate px-10">
          {announcement.message}
          {hasLink && (
            <>
              {" "}
              <a
                href={announcement.linkHref!}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 font-extrabold"
              >
                {announcement.linkLabel}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Full-width marquee bar showing the most recent active scrolling
 * announcement for the given audience. Rendered as the topmost element
 * of each layout — it sits above the navbar and scrolls away with the
 * page.
 *
 * Wrapped in an error boundary so a missing Convex deployment won't
 * crash the entire layout.
 */
export default function ScrollingAnnouncementBar(
  props: ScrollingAnnouncementBarProps,
) {
  return (
    <SafeBoundary>
      <ScrollingAnnouncementBarInner {...props} />
    </SafeBoundary>
  );
}
```

- [ ] **Step 2: Confirm no remaining `variant` references**

Run: `grep -rn "variant" src/features/banners/components/ScrollingAnnouncementBar.tsx`
Expected: no output.

Run: `grep -rn "ScrollingAnnouncementBar" src/ --include=*.tsx | grep "variant"`
Expected: no output (no caller passes `variant` anymore).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: only the pre-existing `convex/colleges.test.ts` error.

- [ ] **Step 4: Lint**

Run: `npx eslint src/features/banners/components/ScrollingAnnouncementBar.tsx`
Expected: no output (clean).

- [ ] **Step 5: Visual check**

Re-open `/`, `/student`, `/supervisor` — the bar still renders and behaves identically to the end of Task 3 (above the navbar, scrolls away, dismissable). Nothing changed visually; this task only deleted dead code.

- [ ] **Step 6: Commit**

```bash
git add src/features/banners/components/ScrollingAnnouncementBar.tsx
git commit -m "refactor: drop unused variant prop from ScrollingAnnouncementBar

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Done

After all four tasks: the announcement bar is the topmost element on the landing page and on every dashboard, it scrolls away with the page, and the navbar sticks to the top — matching Udemy's behavior. The bar's appearance and marquee text are unchanged.
