---
name: Smart-ZUJ
description: HeroUI-aligned soft surface for Al-Zaytoonah University's Olive Incubator.
colors:
  background: "#F5F9F5"
  foreground: "#13201A"
  card: "#FCFEFC"
  primary: "#1F5C2E"
  primary-foreground: "#FFFFFF"
  secondary: "#C9A227"
  secondary-foreground: "#13201A"
  accent: "#2D7A3E"
  accent-foreground: "#FFFFFF"
  muted: "#E8F0E8"
  muted-foreground: "#5F6B62"
  border: "#2A3530"
  destructive: "#DC2626"
  success: "#16A34A"
  warning: "#EAB308"
  info: "#2563EB"
  status-pending: "#EAB308"
  status-review: "#2563EB"
  status-accepted: "#16A34A"
  status-rejected: "#DC2626"
  status-modification: "#EA580C"
  dark-background: "#0F1A12"
  dark-foreground: "#E8F0E8"
  dark-card: "#1A2E1F"
  dark-primary: "#4CAF50"
  dark-secondary: "#D4AF37"
  dark-accent: "#66BB6A"
typography:
  display:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.005em"
  title:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.005em"
  body:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.005em"
  label:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-ghost:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "20px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  chip-status-pending:
    backgroundColor: "{colors.status-pending}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
  chip-status-accepted:
    backgroundColor: "{colors.status-accepted}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
  chip-status-rejected:
    backgroundColor: "{colors.status-rejected}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
---

# Design System: Smart-ZUJ

## 1. Overview

**Creative North Star: "The Olive Reading Room"**

The system reads like a quiet university reading room: tinted-warm light surface, soft hairline borders, the olive-green of the university tucked into primary actions, and a single warm gold reserved for one persona (sponsors). Type is Tajawal — one family carrying every label, heading, table cell, button, and form field. Motion exists but never performs: state changes get a 200ms ease-out reveal, and decorative animation is reserved exclusively for the public landing surface.

The product surface (admin, supervisor, student, sponsor dashboards) is HeroUI-aligned: soft drop shadows, 1px hairline borders, generous radii (10–16px), and a hierarchy carried by weight and color tokens rather than by elevation. This is intentional and was a migration. An earlier neobrutalism experiment (thick black borders, hard colored offset shadows) was removed; legacy `nb-*` utility class names remain as scaffolding, but the visual system they implement is now uniformly soft.

What this system rejects, from PRODUCT.md's anti-references: SaaS dashboard generics, AI-tool gradient marketing, glassmorphism as default, decorative motion on static UI, the hero-metric card-grid template, and any return to thick-border neobrutalism.

**Key Characteristics:**
- Olive-green primary + warm gold sponsor accent; everything else is semantic state color
- One Arabic-first sans (Tajawal); no display/body pairing
- Soft drop shadows (no colored offsets); hairline borders (1px, 8% foreground tint)
- Generous radii (10px base, 16px on cards, pill on chips)
- HeroUI primitives as the floor; custom CSS extends, never replaces
- Real dark mode with a separately-tuned palette, not inverted light

## 2. Colors

A tinted-neutral surface anchored by a deep olive green, one warm gold reserved for sponsor identity, and a five-step status palette tied to the application state machine.

### Primary

- **Deep Olive** (`#1F5C2E`): Primary brand. Used for the supervisor-side sidebar accent, the primary CTA on every form, the focus ring on inputs, and the gradient anchor on the landing hero. Carries the institutional weight.
- **Mid Olive** (`#2D7A3E`): Hover state for primary, and the admin-side accent. Slightly brighter so admin surfaces read as "newer / brighter" than supervisor surfaces.

### Secondary

- **Warm Gold** (`#C9A227`): Sponsor identity. Used **only** on sponsor-facing surfaces (sponsor sidebar accent, sponsor reels CTAs, the brand-icon dot in the sponsor layout). Off-limits for any other persona.

### Tertiary — Status palette

A five-step palette mapped to the `applications.status` enum. These are the only colors allowed on application-related chips, badges, and indicators.

- **Pending Yellow** (`#EAB308`): `under_review`, awaiting decision.
- **Review Blue** (`#2563EB`): supervisor is actively reviewing.
- **Accepted Green** (`#16A34A`): terminal accepted.
- **Rejected Red** (`#DC2626`): terminal rejected.
- **Modification Orange** (`#EA580C`): `needs_modification`, action required by student.

### Neutral

- **Olive Mist** (`#F5F9F5`): Page background. Tinted toward primary at very low chroma — never `#FFFFFF`.
- **Mist Card** (`#FCFEFC`): Card / panel surface. One step brighter than background to lift content without a shadow.
- **Deep Forest** (`#13201A`): Body foreground. Tinted dark green-black; never `#000`.
- **Quiet Sage** (`#E8F0E8`): Muted surface and skeleton fill.
- **Sage Stone** (`#5F6B62`): Secondary text and muted labels.
- **Forest Border** (`#2A3530`): The 1px hairline border, applied at 8% mix with transparent for ambient use.

### Named Rules

**The Olive-First Rule.** Every neutral on the light surface is tinted toward `#1F5C2E` at low chroma (under 0.01). Pure greys are prohibited. Pure white is prohibited. If a color reads as "neutral grey," it's wrong — push the hue toward olive until it warms by one perceptible step.

**The Sponsor-Only Gold Rule.** The warm gold `#C9A227` is reserved for sponsor surfaces. It never appears in the student, supervisor, or admin dashboards. If gold drifts into the supervisor sidebar by mistake, the persona separation is broken.

**The Status-Five Rule.** Application chips use exactly the five tertiary tokens above. New status visualizations (charts, badges, indicators) draw from the same palette by `status` key, never by index or category color. Adding a sixth color requires adding a sixth status to the schema first.

### Dark Mode

A separately tuned palette, not the light palette inverted. The dark surface (`#0F1A12`) is olive-tinted to match the brand; primary lifts to `#4CAF50` for legibility on dark, secondary lifts to `#D4AF37`. The status palette intentionally **stays** at near-identical hues across themes — supervisors viewing the same chip in light or dark mode should recognize it instantly.

## 3. Typography

**Display Font:** Tajawal (with system-ui, sans-serif fallback)
**Body Font:** Tajawal (same family)
**Label/Mono Font:** Tajawal for labels; no mono surface in product (code is not a primary domain).

**Character:** Tajawal is a humanist Arabic sans designed for institutional and editorial use. One family carries every typographic role; the hierarchy comes from weight and scale, not from family pairing. The result reads more like a university handbook than a SaaS landing page — intentional.

### Hierarchy

- **Display** (`font-extrabold` 800, `text-3xl` 1.875rem, line-height 1.15): Page-level headings on dashboards (e.g. "لوحة تحكم النظام"). Used once per page.
- **Headline** (`font-extrabold` 800, `text-2xl` 1.5rem, line-height 1.2): Section headers within a page ("الإجراءات السريعة", "معدل القبول").
- **Title** (`font-bold` 700, `text-lg` 1.125rem, line-height 1.35): Card titles, modal headers, form group headers.
- **Body** (`font-medium` 500, `text-sm` 0.9375rem, line-height 1.6): Default running text, descriptions, paragraphs. Capped at 65–75ch in prose contexts. Table cells run denser.
- **Label** (`font-bold` 700, `text-xs` 0.75rem, letter-spacing 0.01em): Form labels, button text, table headers, chip labels.

### Named Rules

**The One-Family Rule.** Tajawal carries every role. Do not introduce a display serif, a monospace, or a secondary sans "for variety." The visual rhythm comes from weight and scale, not from family contrast.

**The No-Uppercase-Arabic Rule.** Arabic has no case. CSS `text-transform: uppercase` applied to Arabic glyphs degrades them. The `.nb-tag` utility uppercases text — only use it on Latin-script tags (status enums in code, English category labels). Never apply to Arabic labels.

**The Numbers-In-Place Rule.** Arabic-Indic and Western digits both appear in this product. Use Western digits (0–9) for IDs, prices, counts, timestamps — they read better in LTR-bounded contexts. Reserve Arabic-Indic (٠–٩) for marketing/landing surfaces where the cultural register matters.

## 4. Elevation

The system uses **soft drop shadows only, no colored offsets.** Depth is conveyed by a combination of subtle shadow + 1px tinted border + background tint shift. The previous neobrutalism doctrine (hard colored offset shadows) was removed during the HeroUI migration; any remaining `box-shadow: Xpx Xpx 0 var(--shadow-color)` in the codebase is legacy and should be soft-shadowed on next touch.

### Shadow Vocabulary

- **Ambient** (`box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)`): Default rest state for cards and panels. Reads as "lifted by 1 step."
- **Hover Lift** (`box-shadow: 0 6px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` + `transform: translateY(-2px)`): Interactive cards on hover only.
- **Floating** (`box-shadow: 0 10px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)`): Dropdowns, popovers, modal surfaces.
- **Focus Ring** (`0 0 0 3px rgba(31, 92, 46, 0.12)`): Applied to focused inputs alongside a border-color shift to primary.

### Named Rules

**The Soft-Only Rule.** Drop shadows are diffuse and uncolored. Hard-edged offset shadows (`Xpx Xpx 0` without blur) are forbidden anywhere in the product surface. Brand/landing may use them on hero compositions; product may not.

**The Lift-On-Hover Rule.** Cards rest flat (ambient shadow only). Hover adds the second elevation tier *and* a 2px Y-translation. Click returns to rest. No layered shadow during press states.

**The 1px-Border Rule.** Every interactive surface (card, input, dialog, badge) carries a 1px hairline border at 8% foreground mix. Borders thicker than 1.5px are reserved for focused inputs and active selections; never decorative.

## 5. Components

All components are built on HeroUI primitives (`@heroui/react`). Custom utility classes (the `nb-*` family in `globals.css`) extend HeroUI defaults; they do not replace HeroUI components.

### Buttons

- **Shape:** Rounded (`border-radius: var(--radius)` = 10px). No pill buttons in product UI; pill is reserved for chips and search.
- **Primary:** Olive green background (`#1F5C2E`), white text, 10×18px padding. Hover transitions to mid-olive (`#2D7A3E`) over 200ms. Used for the dominant action on a screen, never twice on the same view.
- **Secondary (sponsor surfaces only):** Warm gold background (`#C9A227`), dark foreground, same shape. Used for sponsor CTAs.
- **Ghost:** Muted surface (`#E8F0E8`), foreground text, same shape. Used for secondary actions.
- **Hover / Focus:** 200ms `ease-out` transition. Focused state adds the focus-ring described in Elevation.
- **Loading:** HeroUI's built-in spinner replaces the label; do not invent custom loading treatments.

### Chips

- **Style:** Pill (`border-radius: 9999px`), 1px hairline border, soft 1px-2px drop shadow, 5×12px padding.
- **Status chips (`nb-badge` + status-color modifiers):** Background uses the status token at 10% opacity; text uses the status token at full opacity. Result is a soft tinted pill that reads as "label colored by state."
- **Soft variant (`nb-badge-soft`):** Identical size, lighter border, no semantic color — used for neutral labels and counts.

### Cards / Containers

- **Corner Style:** 16px radius on the base `nb-card`. 10px on smaller embedded panels (filter rows, search bars).
- **Background:** `#FCFEFC` light, `#1A2E1F` dark. One step lighter than page background.
- **Shadow Strategy:** Ambient at rest. Interactive variants (`nb-card-interactive`) add Hover Lift on hover.
- **Border:** 1px hairline at 8% foreground mix.
- **Internal Padding:** 20–24px on dashboard cards. 16px on dense list rows. Do not nest cards inside cards.

### Inputs / Fields

- **Style:** 1.5px solid border (`var(--border)`), 10px radius, 10×16px padding, surface background.
- **Focus:** Border color shifts to primary olive; 3px focus ring at 12% primary applied as additional outer shadow.
- **Placeholder:** Always at `var(--muted-foreground)` full opacity (HeroUI's default near-invisible placeholder is overridden in globals.css for legibility).
- **Error:** Border color shifts to destructive red; error text appears inline below the field, never as a toast.
- **Disabled:** 50% opacity; cursor not-allowed; no border-color change (the dim state is enough).

### Navigation

- **Sidebar (supervisor + admin):** `AppSidebarLayout` with role-themed active state. Right-aligned (RTL canonical). Collapses to icons on desktop, slides as a drawer on mobile. Active item: colored background using the role's accent (`#2D7A3E` for admin, deeper olive for supervisor), white text.
- **Top nav (student + sponsor):** `DashboardLayout` with horizontal nav, settings menu, and notification bell. Used for personas whose surface is more reading than triage.
- **Persistence:** Sidebar collapse state stored per-role in localStorage. Mobile nav state is per-session.

### Status Indicator (signature component)

The `STATUS_LABELS`/`STATUS_COLORS` system is the signature visual primitive of the product. Every place an application's status surfaces — table cell, detail header, notification, activity log — uses exactly the same colored chip + Arabic label combination. Recognition is the entire point: a supervisor scanning 80 rows should identify "needs_modification" by chip color before they read the word.

### Sponsor Reels (signature component)

A phone-shaped (`max-w-[420px] aspect-[9/16]`) full-bleed video card with floating side actions (heart/interest button) and floating bottom metadata (project type, title, description). Lives only at `/sponsor/projects/[id]`. The only place in the product where decorative motion (video autoplay) and dense visual layering are intentional — sponsor delight is concentrated here so the rest of the system can stay calm.

## 6. Do's and Don'ts

### Do:

- **Do** anchor every primary action in olive (`#1F5C2E`). The hover state goes to mid-olive (`#2D7A3E`), not to a brighter or different hue.
- **Do** reserve the warm gold (`#C9A227`) for sponsor surfaces only.
- **Do** keep all neutrals tinted toward olive at low chroma. Never `#000` or `#fff`.
- **Do** use HeroUI primitives (`Button`, `Input`, `Card`, `Spinner`, `Modal`) as the foundation. Custom CSS extends, never replaces.
- **Do** size body text at 14–15px (Tajawal at smaller sizes loses legibility).
- **Do** convey application status with chip color + Arabic label + (where useful) icon — three signals, never one alone.
- **Do** transition state changes in 150–250ms with `ease-out`.
- **Do** honor `prefers-reduced-motion: reduce` — all ambient animations (leaf drift, sway, marquee, parallax) must self-disable.
- **Do** apply `dir="ltr"` to specific elements containing emails, URLs, and numeric IDs while keeping the document RTL.
- **Do** use the soft drop-shadow vocabulary in Elevation. Hairline 1px borders pair with shadows; don't choose one or the other.

### Don't:

- **Don't** reintroduce neobrutalism patterns: hard colored offset shadows (`box-shadow: Xpx Xpx 0 var(--shadow-color)`), 2-3px chunky black borders, raw outline-everywhere blocks. The migration to HeroUI-soft is finished; do not regress.
- **Don't** use `background-clip: text` with a gradient (`.gradient-text` is legacy and slated for removal). Solid color, weight contrast, or size contrast carries emphasis instead.
- **Don't** use glassmorphism (`backdrop-filter: blur` + translucent fill) as a default surface treatment. It's reserved for the landing hero composition.
- **Don't** ship the hero-metric template: 8 identical icon-number-label cards in a 4×2 grid. Use a single hero metric + 3 secondary metrics + a sparkline when admin stats are needed.
- **Don't** ship identical card grids: 4 same-sized cards with icon + heading + text. Vary the visual weight; promote the primary action to a different shape or size.
- **Don't** animate decorative properties on static product UI. No `group-hover:scale-110` on stat cards, no `group-hover:-rotate-6` on links. Motion conveys state changes only.
- **Don't** hard-code hex colors inline (`style={{ background: "#1F5C2E" }}`). Reference the token (`bg-primary`, `text-success`). The CSS variable is the single source of truth.
- **Don't** uppercase Arabic text via `text-transform`. Arabic has no case; the visual result is broken.
- **Don't** invent new status colors. The five-step palette is fixed at the schema level. Adding a sixth color requires adding a sixth status to `applications.status` first.
- **Don't** use generic SaaS blue-everywhere or Material defaults. The system has explicit institutional Arabic identity; don't dilute it.
- **Don't** nest cards inside cards. Use background tint shift, hairline border, or simple spacing to convey grouping instead.
- **Don't** add a custom scrollbar to draw attention to itself. The current 8px tinted scrollbar exists; do not amplify it further.
