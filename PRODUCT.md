# Product

## Register

product

## Users

Smart-ZUJ serves four distinct personas inside Al-Zaytoonah University of Jordan's Olive Incubator (حاضنة الزيتونة):

- **Students** apply for one of three incubation tracks (entrepreneurial idea, IT graduation project, university-entrepreneurial). They draft proposals over several sessions, upload PDFs and video pitches, and revisit their application across the review cycle. Their context is academic — they're working between classes, often from mobile, in Arabic.
- **Academic supervisors** review applications, leave notes, request modifications, accept or reject. They run through tens of applications during review windows. Their context is task-dense — they need filters, bulk actions, and quick status reads, not delight.
- **Admins** oversee the whole platform: manage users, colleges, sponsors, social links, supervisor-upgrade requests. They open the dashboard for short, high-stakes sessions (incident, audit, onboarding a new sponsor) — not casual browsing.
- **Sponsors** browse accepted projects looking for ones to back. Their session is exploratory and one-handed — designed as a phone-shaped reels feed with a single "interested" action per project.

Everyone is Arabic-first. The UI is RTL by default; English appears only in technical contexts (email addresses, URLs, numeric IDs).

## Product Purpose

Replace the email-and-spreadsheet workflow that previously moved incubation proposals through the university with a single role-aware platform. Students submit; supervisors review; admins govern; sponsors discover. Success looks like a complete incubation cycle finished inside the app — from draft to accepted-and-sponsored — without anyone reaching for Outlook.

Success is **not** a flashy showcase. It is the supervisor finishing their review queue 40 minutes faster than they did over email, and the student getting a status notification within seconds of a decision.

## Brand Personality

Three words: **calm, academic, considered.**

Voice is institutional but not stiff. The app speaks Arabic the way a university handbook does: complete sentences, proper terminology, no abbreviations or playful phrasing. The visual identity leans on the olive tree as Al-Zaytoonah's heritage symbol — warm greens, a single accent gold for sponsors, and a quiet light surface that doesn't fatigue across a 90-minute review session.

Emotional goals:
- **Students** should feel trusted and unhurried — submitting an application is a meaningful act, not a click.
- **Supervisors** should feel efficient and in control — bulk decisions should not require ceremony.
- **Admins** should feel oriented at a glance — no scrolling to find the one number they need.
- **Sponsors** should feel a small thrill of discovery — the cinematic reels for video pitches are the only place delight is loud, by design.

## Anti-references

This product should never look like:

- **Generic SaaS dashboards** — Material defaults, blue-everywhere, slate-gray sidebars, identical metric cards grid 4×2. Stripe and Linear are inspirations for *patterns*; their visual language is not the target.
- **AI-tool marketing aesthetics** — purple-to-pink gradients, glassmorphism panels, gradient-clipped text, neon accents on dark canvas, "v0-style" hero cards. None of these belong in a university platform.
- **Heavy neobrutalism** — thick black borders, hard colored drop-shadows, raw chunky type. The app previously experimented with this look and migrated away to a calmer HeroUI-aligned surface. Legacy `ds-*` CSS class names remain as scaffolding; the visual system they implement is now soft, not brutalist.
- **Generic "academic intranet"** — beige tables on Times New Roman, bright royal blue links, 2008 portal layouts. Familiar is good. Dated is not.
- **Decorative motion** — bouncing icons on stat cards, gratuitous hover-rotate on static links, orchestrated page-load sequences. Motion conveys state, not personality.

## Design Principles

1. **Trust over flash.** Students are entrusting real academic work to this system. Every screen should feel reliable and finished. No half-built loading states, no jarring transitions, no decorative noise. The interface earns trust by getting out of the way.

2. **Arabic-first, RTL-canonical.** Right-to-left is the default flow direction, not a styling pass after the fact. Numbers, emails, and code stay LTR-scoped (`dir="ltr"` on the specific element). Iconography that has a left/right meaning is mirrored when needed; iconography that doesn't isn't.

3. **Role-aware, never role-generic.** A supervisor's dashboard, an admin's dashboard, and a student's dashboard share primitives but never share a layout by accident. Each persona's surface answers *their* job, not a hypothetical "user." Concretely: supervisor and admin use the side-nav `AppSidebar`; student and sponsor use the top-nav `DashboardLayout`.

4. **HeroUI is the floor.** Buttons, inputs, modals, tabs, chips come from `@heroui/react`. Custom CSS extends, never replaces. If a designer reaches for a custom button, the answer is usually a missing HeroUI variant — fix that first.

5. **Density follows the task.** Students get spacious, considered forms (they're committing). Supervisors get dense, indexed tables (they're scanning). Admins get summary cards over scrollable lists (they're triaging). Don't apply one density rule everywhere.

## Accessibility & Inclusion

- **Target**: WCAG 2.2 AA on all authenticated surfaces.
- **Arabic legibility**: Tajawal is the canonical body and display font, sized minimum 14px for body text. Avoid all-caps Arabic (it doesn't exist semantically; the visual effect is awful).
- **Color is never the sole signal.** Application status is communicated via colored chip + text label + icon — any one alone is enough.
- **Motion respects user preference.** All ambient animations (olive sway, leaf drift, marquee, parallax) are killed under `prefers-reduced-motion: reduce`. Functional transitions (200ms reveals) remain.
- **Dark mode is real, not inverted.** The dark theme uses a separate token set tuned for low-light review sessions, with chroma reduced to avoid the "AI sci-fi panel" look.
- **Keyboard navigation** is intact on all interactive primitives (HeroUI gives this for free; don't break it with custom click handlers that swallow focus).
- **Form errors are inline + accessible.** No alerts, no toast-only feedback for validation. The field that's wrong says why, in Arabic, near itself.
