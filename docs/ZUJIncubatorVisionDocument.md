# ZUJ Incubator (حاضنة الزيتونة) — Vision Document

---

# Chapter 1 — Introduction

## 1.1 Project Description

**ZUJ Incubator (حاضنة الزيتونة)** is a centralized, web-based incubation platform developed for Al-Zaytoonah University of Jordan to manage the full lifecycle of student-led entrepreneurial initiatives and graduation projects. The system replaces the previous fragmented, document- and email-based workflow with a single source of truth that unifies submission, review, mentorship, and sponsorship under one digital roof.

The platform accepts three distinct submission tracks: **entrepreneurial ideas**, **IT graduation projects**, and **university-level entrepreneurial projects**. Each submission, referred to internally as an *Application*, advances through a deterministic state machine: `draft → under_review → needs_modification → accepted | rejected`. Every state transition is preserved as an immutable record in a dedicated reviews table, providing a permanent and auditable history of supervisor decisions.

The system is organized around four user roles, each granted a distinct set of permissions through a role-based access control (RBAC) model:

- **Student** — drafts, edits, and submits applications; uploads PDF business plans and video pitches; receives supervisor feedback; can request promotion to a supervisor role.
- **Supervisor** — reviews applications in real time, annotates them with notes and ratings, authors educational articles, publishes banners, and curates the entrepreneurial guide library.
- **Sponsor** — discovers accepted projects through an Instagram-style **reels feed**, expresses funding interest, and is matched to projects via sponsor assignments.
- **Administrator** — manages institutional metadata (colleges, departments), user roles, social-media links, and oversees the system-wide activity log.

Beyond the core submission workflow, the platform provides a suite of real-time and content services: a **presence subsystem** that signals which reviewer is currently viewing a given application, a **typed notification system** that emits events such as status changes, new notes, and sponsor assignments, **markdown-based articles** with audience targeting, **scrolling and hero banners**, and a curated **entrepreneurial guide** of videos, courses, and external resources. The entire interface is fully right-to-left (RTL) Arabic, rendered with the Tajawal typeface, and localized through Clerk's Arabic locale.

## 1.2 Project Overview

ZUJ Incubator is conceived as a strategic enabler for the university's innovation ecosystem. By digitizing what has traditionally been a paper- and email-driven process, the platform delivers measurable value across all stakeholder groups. For **students**, it reduces friction in submission, accelerates feedback cycles, and offers structured learning material curated by faculty. For **supervisors**, it consolidates review work in a single dashboard, automates audit logging, and surfaces real-time collaboration cues. For **the incubator office**, it provides a unified record of every project, every decision, and every transition, enabling data-driven oversight of the incubator's portfolio. For **external sponsors and investors**, it converts the historically opaque pool of accepted projects into a discoverable, media-rich feed that supports informed funding decisions.

The platform's underlying value proposition is therefore three-fold: **process digitization**, **transparency through auditability**, and **ecosystem connectivity** between students, mentors, and capital providers.

## 1.3 Tasks

The technical scope of the project comprises the following engineering tasks, each grounded in concrete artifacts within the codebase:

1. Design and implement the Convex relational schema covering **fifteen** domain tables (`users`, `applications`, `applicationReviews`, `applicationPresence`, `notifications`, `sponsorAssignments`, `banners`, `articles`, `entrepreneurialGuide`, `colleges`, `departments`, `supervisorUpgradeRequests`, `studentNotes`, `socialLinks`, `activityLogs`), including indexed access patterns suitable for real-time subscriptions.
2. Integrate Clerk authentication with Convex by configuring JWT validation in `convex/auth.config.ts` and propagating identity through `ConvexProviderWithClerk`.
3. Enforce a four-role RBAC matrix at the Convex function boundary, with all sensitive operations gated by `ctx.auth.getUserIdentity()`.
4. Implement the application state machine and immutable review log, ensuring optimistic concurrency control (OCC) safety on concurrent supervisor writes.
5. Build the real-time presence and notification subsystems backed by Convex live queries.
6. Implement secure file ingestion for PDF business plans and video pitches via Convex Storage, with client-side PDF previews powered by `react-pdf` and pitch-video playback through the native HTML5 `<video>` element.
7. Develop the markdown-authoring pipeline for articles (rich text rendering via `react-markdown` with `remark-gfm`) and the audience-targeting model.
8. Construct the Instagram-style sponsor reels feed for accepted projects as a CSS scroll-snap vertical feed.
9. Deliver the administrative dashboards using `recharts` for analytics and `@tanstack/react-table` for tabular management.
10. Produce a fully RTL, accessible Arabic user interface using Tailwind CSS v4, HeroUI 3, and the Tajawal typeface.
11. Execute a system-wide migration from custom legacy components to the HeroUI 3 component library to standardize UI behavior.
12. Configure the production deployment pipeline, including a Vercel build hook that deploys the Convex backend on each release.
13. Enforce end-to-end type safety and code quality through TypeScript strict mode and ESLint (including the `@convex-dev/eslint-plugin` Convex ruleset).

## 1.4 Project Planning

The project follows an **Agile / Scrum** methodology executed across an academic horizon of **fifteen weeks**, organized into eleven sprints of one or two weeks each. Core feature sprints (Sprints 1–4) follow a two-week cadence, while planning, real-time, content, sponsor, analytics, hardening, and delivery sprints are compressed into single-week iterations to align with the academic calendar.

| Sprint | Duration | Phase | Key Deliverables |
|---|---|---|---|
| Sprint 0 | Week 1 | Analysis | Stakeholder interviews, finalised SRS, product backlog |
| Sprint 1 | Weeks 2–3 | Design / Foundation | Convex schema v1, Clerk integration, base App Router layout, RTL theme |
| Sprint 2 | Weeks 4–5 | Foundation | RBAC matrix, user provisioning, college/department admin |
| Sprint 3 | Weeks 6–7 | Core Workflow | Application draft + submit for the three tracks |
| Sprint 4 | Weeks 8–9 | Core Workflow | Supervisor review screens, ratings, notes, state machine, immutable audit log |
| Sprint 5 | Week 10 | Real-time | Presence heartbeats and typed notifications |
| Sprint 6 | Week 11 | Content | Articles (markdown + audience), banners, entrepreneurial guide |
| Sprint 7 | Week 12 | Sponsor Track | Sponsor reels feed and sponsor assignments |
| Sprint 8 | Week 13 | Analytics | Admin dashboards (`recharts`, `react-table`), activity log viewer |
| Sprint 9 | Week 14 | Hardening | Accessibility, RTL polish, performance, security review |
| Sprint 10 | Week 15 | Delivery | UAT with the incubator office, production deployment on Vercel, documentation handover |

Each sprint terminates with a Sprint Review demonstrating working software to the academic supervisor, followed by a Sprint Retrospective that feeds improvements into the next iteration.

## 1.5 Planning of Development Phases

Within the Scrum cadence above, the work is conceptually organized into the following five engineering phases:

1. **Requirements Analysis.** Elicitation of functional and non-functional requirements through interviews with the university incubator office, faculty supervisors, and a sample of prospective sponsors. Outputs: prioritized product backlog, user-story map, and SRS (IEEE 830–style).
2. **System Design.** Architectural design of the Next.js / Convex / Clerk stack; Convex schema and index design; entity-relationship diagram; high-fidelity UI mockups in HeroUI; definition of the RBAC matrix and the application state machine.
3. **Implementation.** Iterative construction across Sprints 1 through 8, organised as vertical slices that deliver an end-to-end feature per sprint. Continuous integration is enforced through automated Convex deploys on the Vercel build pipeline.
4. **Testing.** Static verification of Convex functions and UI code through TypeScript strict-mode compilation and ESLint (with the `@convex-dev/eslint-plugin` Convex ruleset); manual functional testing of critical UI flows; manual User Acceptance Testing per role with representatives of the incubator office.
5. **Deployment and Handover.** Provisioning of production Convex and Clerk environments, configuration of live API keys and Clerk JWT issuer, deployment to Vercel, runbook delivery, and stakeholder training.

## 1.6 The Scope of the Work

**Within scope.**

- Three application tracks: entrepreneurial idea, IT graduation, university-level entrepreneurial.
- Four user roles with full RBAC enforcement.
- Application state machine with immutable audit log of every transition.
- Real-time presence and typed in-app notifications.
- Markdown article authoring with audience targeting, scrolling and hero banners, and the entrepreneurial guide library.
- PDF business-plan and video-pitch uploads via Convex Storage with in-browser preview.
- Sponsor matchmaking with an Instagram-style reels feed for accepted projects.
- Administrative management of colleges, departments, social media links, supervisor upgrade requests, and the global activity log.
- Right-to-left Arabic user interface localized via Clerk's Arabic locale.
- Production deployment on Vercel with a Convex backend build hook.

**Out of scope.**

- In-platform financial transactions, escrow, or disbursement to sponsored projects.
- Automated AI-based application review or scoring.
- Native mobile applications for iOS or Android.
- Multi-tenant federation across multiple universities.
- Offline-first or fully Progressive Web App (PWA) capability.
- External notification channels such as SMS, WhatsApp, or push notifications.
- Public-facing API for third-party integrators.

## 1.7 Stakeholders

| Stakeholder | Interest in the System |
|---|---|
| Students of Al-Zaytoonah University | Primary submitters; consume articles and guide content; track application status. |
| Faculty supervisors | Review applications, mentor students, author articles, manage banners and guides. |
| External sponsors and investors | Discover accepted projects via the reels feed; express funding interest. |
| Incubator office / university administration | Manage institutional hierarchy (colleges, departments), roles, social links, and oversight. |
| Development team (graduation project team) | Designs, implements, tests, and maintains the platform. |
| Academic supervisor of the graduation project | Mentors the development team and validates academic deliverables. |
| Platform providers (Convex, Clerk, Vercel) | Provide the underlying Backend-as-a-Service, identity, and hosting infrastructure. |

## 1.8 Scope

ZUJ Incubator delivers a centralized, RTL-Arabic web platform that manages the complete lifecycle of three categories of student projects across four user roles, supported by real-time review, immutable auditing, markdown content modules, and a sponsor-facing discovery feed. The system explicitly excludes payment processing, AI-driven evaluation, native mobile applications, and inter-university federation.

## 1.9 Definitions, Acronyms, and Abbreviations

| Term / Acronym | Definition |
|---|---|
| **ZUJ** | Al-Zaytoonah University of Jordan — the host institution of the incubator. |
| **Application** | A project submission record in the `applications` table belonging to one of three tracks. |
| **Track** | One of `entrepreneurial_idea`, `it_graduation`, or `university_entrepreneurial`. |
| **Review** | An immutable record in `applicationReviews` capturing a single state transition. |
| **Sponsor Assignment** | A record in `sponsorAssignments` linking a sponsor to an accepted application. |
| **Presence** | The real-time heartbeat in `applicationPresence` indicating active reviewers. |
| **Reels Feed** | Instagram-style swipe interface that surfaces accepted projects to sponsors. |
| **Audit Log** | The append-only `activityLogs` table recording system-wide events. |
| **RBAC** | Role-Based Access Control across student, supervisor, sponsor, and admin roles. |
| **BaaS** | Backend-as-a-Service — the architectural pattern delivered by Convex. |
| **JWT** | JSON Web Token — Clerk-issued credential validated by Convex. |
| **OCC** | Optimistic Concurrency Control — Convex's default write-conflict strategy. |
| **CRUD** | Create, Read, Update, Delete. |
| **SRS** | Software Requirements Specification. |
| **UAT** | User Acceptance Testing. |
| **RSC / SSR** | React Server Components / Server-Side Rendering (Next.js App Router). |
| **RTL** | Right-to-Left text directionality used for the Arabic UI. |
| **MVP** | Minimum Viable Product — the deliverable at the end of Sprint 10. |
| **Application States** | `draft`, `under_review`, `needs_modification`, `accepted`, `rejected`. |
| **User Roles** | `student`, `supervisor`, `sponsor`, `admin`. |

## 1.10 References

The following references correspond to the technologies, libraries, and methodologies actually used in the implementation of ZUJ Incubator.

1. Convex — *Convex Documentation*. https://docs.convex.dev
2. Clerk — *Clerk Authentication Documentation*. https://clerk.com/docs
3. Next.js — *Next.js App Router Documentation (v16)*. https://nextjs.org/docs
4. HeroUI — *HeroUI Component Library (v3)*. https://www.heroui.com
5. Tailwind CSS — *Tailwind CSS v4 Documentation*. https://tailwindcss.com
6. TypeScript — *TypeScript Handbook*. https://www.typescriptlang.org/docs
7. Zod — *Zod Schema Validation*. https://zod.dev
8. React Hook Form — *React Hook Form Documentation*. https://react-hook-form.com
9. react-pdf — *react-pdf Library*. https://github.com/wojtekmaj/react-pdf
10. react-markdown and remark-gfm. https://github.com/remarkjs/react-markdown
11. Recharts — *Recharts Charting Library*. https://recharts.org
12. TanStack Table — *@tanstack/react-table v8*. https://tanstack.com/table
13. Vercel — *Vercel Deployment Documentation*. https://vercel.com/docs
14. Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. https://scrumguides.org
15. IEEE Std 830-1998 — *IEEE Recommended Practice for Software Requirements Specifications*.

## 1.11 Overview

This chapter has introduced **ZUJ Incubator**, established its functional intent as a unified incubation platform for Al-Zaytoonah University, enumerated the engineering tasks and stakeholder groups, fixed the Agile / Scrum delivery plan over a fifteen-week horizon, and bounded the system through explicit in-scope and out-of-scope statements. The terminology and references set out in Sections 1.9 and 1.10 will be used consistently throughout the remainder of the document. The next chapter formalises the functional and non-functional requirements that this scope implies.

---

# Chapter 2 — Positioning

## 2.1 Business Opportunity

Al-Zaytoonah University of Jordan, like the majority of higher-education institutions in the region, operates its entrepreneurship and graduation-project programs through a combination of paper forms, email threads, shared drives, and ad-hoc face-to-face meetings. Although this informal workflow has historically been tolerable for small cohorts, the recent national push toward an *innovation economy*, the steady growth in incubator enrolments, and the increasing involvement of external sponsors have transformed what was once a manageable administrative routine into a fragmented, error-prone, and largely opaque process.

This shift has created a clear and quantifiable opportunity for a purpose-built digital incubation platform. From a **technical perspective**, modern Backend-as-a-Service infrastructure (Convex), federated identity (Clerk), and real-time collaboration primitives now make it economically feasible for a single graduation-project team to deliver a production-grade, multi-role system that would have required a dedicated engineering department only a few years ago. From a **business perspective**, an institutional digital incubator unlocks several streams of value simultaneously: it accelerates the time from idea to evaluated submission, expands the university's capacity to admit and supervise more projects without proportionally expanding its administrative staff, generates structured data that can inform strategic decisions in the incubator office, and — most importantly — establishes a discoverable bridge between accepted student projects and the external sponsors and investors who increasingly seek early-stage opportunities within Jordanian universities.

**ZUJ Incubator** therefore positions itself at the intersection of three converging trends: the digital transformation of higher-education administration, the institutionalisation of entrepreneurship as a core university function, and the regional demand for transparent, auditable channels between academic talent and private capital. Capturing this opportunity before competing universities deploy similar systems offers Al-Zaytoonah University a meaningful first-mover advantage in attracting both prospective entrepreneurial students and the sponsorship ecosystem that supports them.

## 2.2 Problem Statement

| Element | Description |
|---|---|
| **The problem of** | the absence of a unified, auditable, and real-time platform for managing the full lifecycle of entrepreneurial ideas and graduation projects at Al-Zaytoonah University of Jordan, |
| **Affects** | undergraduate students submitting entrepreneurial or graduation projects, faculty supervisors who must review them, external sponsors seeking early-stage projects to back, and the incubator office responsible for institutional oversight, |
| **The impact of which is** | excessive administrative overhead and review delays caused by reliance on paper forms and scattered email correspondence; loss of accountability due to the absence of an immutable audit trail of supervisor decisions; missed funding opportunities for high-quality student projects that remain invisible to external sponsors; inability of the incubator office to obtain reliable, real-time analytics on its portfolio; and an overall student experience characterised by uncertainty about application status, slow feedback, and limited access to curated entrepreneurial learning material, |
| **A successful solution would be** | a centralised, role-aware web platform that digitises the three official submission tracks (entrepreneurial idea, IT graduation project, and university-level entrepreneurial project), enforces a deterministic application state machine with a permanent review log, supports real-time collaboration among supervisors, exposes accepted projects to vetted sponsors through a media-rich discovery feed, delivers institutional analytics to administrators, and offers students structured access to articles, banners, and a curated entrepreneurial guide — all in a fully right-to-left Arabic interface. |

## 2.3 Product Position Statement

| Element | Statement |
|---|---|
| **For** | students, faculty supervisors, external sponsors, and the incubator administration of Al-Zaytoonah University of Jordan, |
| **Who** | need a single, transparent, and auditable channel through which entrepreneurial ideas and graduation projects can be submitted, reviewed, mentored, and connected to funding opportunities, |
| **The ZUJ Incubator (حاضنة الزيتونة) is a** | role-based, real-time web incubation platform built on Next.js, Convex, and Clerk, |
| **That** | digitises the three official application tracks, enforces an immutable five-state review workflow with full audit logging, surfaces real-time presence and typed notifications for collaborative supervision, exposes accepted projects to sponsors through an Instagram-style reels feed, and delivers curated articles, banners, and entrepreneurial guides through a fully right-to-left Arabic interface. |
| **Unlike** | generic learning-management systems (e.g., Moodle), free-form collaboration tools (e.g., Microsoft Teams, Google Workspace), and conventional project-management trackers (e.g., Trello, Asana) — none of which model the university incubator domain, enforce role-specific review workflows, provide sponsor-facing discovery, or preserve immutable academic audit trails, |
| **Our product** | is a domain-specific, RTL-Arabic platform purpose-built for the operational reality of an Al-Zaytoonah University incubator: it embeds the three official submission tracks and the four institutional roles directly into its data model, guarantees auditability through an append-only review log, enables real-time multi-supervisor collaboration via Convex live queries, and uniquely bridges the academic and investment ecosystems through its sponsor reels feed — turning a fragmented administrative process into a single, measurable, and scalable institutional asset. |

---

# Chapter 3 — Stakeholder and User Descriptions

## 3.1 Market Demographics

The primary user base of **ZUJ Incubator (حاضنة الزيتونة)** is drawn from the academic and entrepreneurial community surrounding Al-Zaytoonah University of Jordan and the broader Amman-based investor ecosystem. The demographic profile of the platform's intended audience is summarised below.

| Dimension | Profile |
|---|---|
| **Age range** | 18 – 24 (students), 28 – 60 (faculty supervisors), 30 – 65 (sponsors and administration). |
| **Educational level** | Undergraduate (students); Master's or Doctoral degrees in Information Technology, Engineering, Business, or Entrepreneurship (supervisors); diverse, typically Bachelor's degree or higher (sponsors); university administrative qualifications (admin staff). |
| **Geographic location** | Predominantly the Hashemite Kingdom of Jordan, with a primary concentration in Amman and surrounding governorates; sponsors may also operate regionally across the Levant and the Gulf. |
| **Language** | Arabic as primary language of interaction; English as a secondary working language for technical and academic terminology. |
| **Digital literacy** | Students: high; native users of mobile and social-media interfaces. Supervisors and administration: moderate to high; familiar with LMS platforms, email, and Office tooling. Sponsors: high; accustomed to modern SaaS dashboards. |
| **Devices in use** | Mobile phones (Android and iOS) for casual browsing and notifications; desktop and laptop computers (Windows, macOS) for content authoring, review, and administrative work. |
| **Connectivity** | Stable broadband and 4G/5G connectivity on campus and in metropolitan areas; occasional bandwidth limitations require the interface to remain responsive on slower connections. |
| **Cultural context** | Right-to-left Arabic content consumption; familiarity with Islamic-academic terminology; preference for visually-rich, modern interfaces aligned with regional social-media usage patterns. |

## 3.2 Stakeholder Summary

The following stakeholders have a direct interest in the success of ZUJ Incubator and have shaped its functional scope.

| Stakeholder | Role | Responsibilities |
|---|---|---|
| **Al-Zaytoonah Incubator Office** | Product Owner / Institutional Sponsor | Defines policies, owns the project portfolio, validates UAT, approves production release, and is accountable for institutional adoption. |
| **University Administration** | Executive Sponsor | Approves the strategic alignment of the platform with university objectives; authorises integration with university identity and infrastructure. |
| **Faculty Supervisors** | Domain Experts / Power Users | Provide subject-matter knowledge of supervision workflows, define review criteria, author articles and guides, and validate the review-and-rating model. |
| **Students of Al-Zaytoonah University** | End Users (primary) | Submit and iterate on applications; consume articles, banners, and the entrepreneurial guide; serve as the principal subjects of UAT. |
| **External Sponsors and Investors** | End Users / Beneficiaries | Discover accepted projects, express funding interest, and validate the sponsor-facing reels feed and assignment workflow. |
| **Academic Project Supervisor** | Project Mentor | Mentors the development team, evaluates academic deliverables, enforces methodology, and signs off on sprint reviews. |
| **Development Team** | Implementers | Design, build, test, deploy, document, and maintain the platform. |
| **Platform Providers (Convex, Clerk, Vercel)** | Infrastructure Suppliers | Provide the Backend-as-a-Service, identity, and hosting layers that the system depends upon. |

## 3.3 User Summary

The system distinguishes four authenticated user types (encoded in the `users` table and enforced by the RBAC matrix in the Convex layer), plus an unauthenticated visitor category.

| User Type | Code in System | Description | Authenticated |
|---|---|---|---|
| **Administrator** | `admin` | Highest-privileged user; manages colleges, departments, social links, user roles, and reviews the global activity log. | Yes |
| **Supervisor** | `supervisor` | Faculty member who reviews applications, authors articles and banners, curates the entrepreneurial guide, and processes supervisor-upgrade requests. | Yes |
| **Student** | `student` | Default role on registration; drafts and submits applications, uploads PDF and video media, receives feedback, and may request promotion to a supervisor role. | Yes |
| **Sponsor** | `sponsor` | Created by an administrator; browses accepted projects via the reels feed, expresses interest, and is recorded in `sponsorAssignments`. | Yes |
| **Guest / Visitor** | *(unauthenticated)* | Lands on the public marketing pages and the login/registration flow; cannot read or write any business data. | No |

## 3.4 User Environment

ZUJ Incubator is designed as a responsive, web-only platform delivered through modern browsers. Its operating environment differs subtly between user types.

| Environment Aspect | Students | Supervisors | Sponsors | Administrators |
|---|---|---|---|---|
| **Primary device** | Mobile phone (predominantly) and personal laptop | Office desktop or laptop | Mobile phone first, desktop second | Office desktop |
| **Location of use** | Campus, dormitory, home | Faculty office, home office | Office, travel, mobile contexts | University incubator office |
| **Operating systems** | Android, iOS, Windows, macOS | Windows, macOS | iOS, Android, Windows, macOS | Windows, macOS |
| **Browsers** | Chrome, Safari, Edge (latest two versions) | Chrome, Edge | Chrome, Safari | Chrome, Edge |
| **Network conditions** | Variable: campus Wi-Fi, mobile data, residential broadband | Stable campus or office network | Mostly mobile data; intermittent | Stable institutional network |
| **Concurrent usage** | Sporadic, peaks near submission deadlines | Daily during review periods | Browsing-style sessions, weekly | Continuous during working hours |
| **Sensitivity to latency** | Moderate (drafting + uploads) | High (real-time review with presence) | Moderate (reels feed scroll experience) | Moderate (dashboards) |
| **Privacy expectations** | Personal data must be visible only to themselves and their assigned supervisors | Application content scoped to authorised supervisors | Sees only accepted projects intended for sponsor visibility | Full visibility under audit |

The interface is implemented in Right-to-Left Arabic with the Tajawal typeface, localised through Clerk's Arabic locale, and built with Tailwind CSS v4 and HeroUI v3 to ensure consistent responsive behaviour across the breakpoints typical of these environments.

## 3.5 Stakeholder Profiles

### 3.5.1 Al-Zaytoonah Incubator Office (Product Owner)
The incubator office owns the institutional incubation programme. Its representatives define which application tracks are valid, set the policies that govern supervisor assignments and sponsor matching, and bear ultimate responsibility for the academic and reputational outcomes of the platform. They are the most authoritative voice in scope-setting and accept or reject feature proposals during sprint reviews.

### 3.5.2 University Administration (Executive Sponsor)
The university administration provides the formal mandate, budget alignment, and integration authority required to deploy a system that processes student academic records. Its concerns centre on regulatory compliance, brand alignment, and strategic positioning of Al-Zaytoonah within the regional higher-education landscape.

### 3.5.3 Faculty Supervisors (Domain Experts)
Faculty supervisors are the most domain-knowledgeable users of the platform. Their daily interaction with the review workflow, their authorship of articles and banners, and their professional judgement on student work make them the primary source of functional requirements for the review-and-rating model, the audit log, and the educational content modules.

### 3.5.4 External Sponsors (Strategic Beneficiaries)
Sponsors interact with the platform mainly through the reels feed and the sponsor-interest workflow. Their satisfaction depends on the quality of the discovery experience, the credibility signals attached to accepted projects (ratings, supervisor endorsements), and the speed with which they can be matched to projects of interest.

### 3.5.5 Academic Project Supervisor (Mentor)
The academic project supervisor monitors the development team's progress, enforces the Agile / Scrum methodology, evaluates academic deliverables (SRS, design documents, code), and signs off on each sprint.

### 3.5.6 Development Team
The development team is responsible for delivering the working system on time, on scope, and according to the engineering standards established in the project (Convex guidelines, TypeScript strictness, HeroUI design system, accessibility, and RTL correctness).

### 3.5.7 Platform Providers
Convex, Clerk, and Vercel are non-human stakeholders whose service-level guarantees, pricing models, and technical roadmaps directly influence the platform's operating cost and reliability.

## 3.6 User Profiles

### 3.6.1 Student
- **Background.** Undergraduate enrolled at Al-Zaytoonah University, typically in years three or four; mother tongue Arabic; high mobile-application fluency.
- **Technical experience.** Comfortable with social-media interfaces and mobile-first web applications; limited prior exposure to formal project-management tools.
- **Needs.** A frictionless way to draft and submit applications, upload media (PDF business plans, video pitches), track status in real time, receive supervisor feedback, and consume curated entrepreneurial learning material.
- **Frequency of use.** Bursty: intense activity during drafting and just before deadlines; lighter check-ins to follow status changes and notifications.

### 3.6.2 Supervisor
- **Background.** Faculty member with a Master's or Doctoral degree; subject-matter expertise in the relevant academic department; bilingual Arabic/English.
- **Technical experience.** Familiar with LMS platforms, email-based workflows, Microsoft Office; moderate experience with modern web dashboards.
- **Needs.** A consolidated review queue, real-time presence to coordinate with peer supervisors, structured rating and note-taking, immutable audit history, and tools to publish articles, banners, and entrepreneurial guides for students.
- **Frequency of use.** Daily during active review periods; weekly outside peak windows.

### 3.6.3 Sponsor
- **Background.** Entrepreneur, investor, or representative of a corporate CSR programme; based primarily in Amman with regional outreach.
- **Technical experience.** High familiarity with modern SaaS, social media, and short-form video platforms (Instagram Reels, TikTok, LinkedIn).
- **Needs.** A rapid, visually-engaging discovery experience for accepted projects; trustworthy credibility signals (supervisor ratings, university endorsement); a low-friction way to express interest in a project.
- **Frequency of use.** Weekly browsing sessions; spikes around incubator demo days and end-of-semester showcases.

### 3.6.4 Administrator
- **Background.** University staff member working within the incubator office or central administration; high digital literacy in administrative tooling.
- **Technical experience.** Strong: comfortable with content-management systems, spreadsheets, and analytics dashboards.
- **Needs.** Comprehensive control over institutional metadata (colleges, departments), user roles, social links, supervisor-upgrade requests, and the global activity log; analytics dashboards for incubator portfolio oversight.
- **Frequency of use.** Daily during working hours.

### 3.6.5 Guest / Visitor
- **Background.** Prospective student, parent, sponsor, or general visitor.
- **Needs.** Public-facing information about the incubator and a clear path to register or sign in.
- **Frequency of use.** One-off or occasional, typically a single session.

## 3.7 Key Stakeholder or User Needs

Each identified need is linked to a concrete feature of ZUJ Incubator. Priority follows the MoSCoW convention (M = Must, S = Should, C = Could).

| # | Stakeholder / User Need | Priority | Current Solution | Proposed Solution in ZUJ Incubator |
|---|---|---|---|---|
| 1 | A single, official channel for submitting entrepreneurial and graduation projects. | **M** | Paper forms, email threads, ad-hoc folders. | The `applications` module with three explicit tracks (`entrepreneurial_idea`, `it_graduation`, `university_entrepreneurial`). |
| 2 | Deterministic, transparent review workflow with a permanent audit trail. | **M** | Verbal decisions and unstructured email replies. | A five-state machine (`draft → under_review → needs_modification → accepted | rejected`) coupled to the append-only `applicationReviews` log. |
| 3 | Real-time awareness of which supervisor is currently reviewing an application. | **S** | None. | The `applicationPresence` heartbeat surfaced as live indicators in the supervisor UI. |
| 4 | Timely, structured feedback to students. | **M** | Delayed email replies. | Typed `notifications` (status change, new note, assignment) and structured supervisor notes attached to each review. |
| 5 | Upload and preview of PDF business plans and video pitches. | **M** | External shared drives. | Convex Storage integration with in-browser PDF preview via `react-pdf` and native HTML5 `<video>` playback for pitch videos. |
| 6 | Curated, audience-targeted entrepreneurial learning content. | **S** | Scattered websites and Telegram channels. | The `articles`, `banners`, and `entrepreneurialGuide` modules authored by supervisors and administrators. |
| 7 | A discoverable surface that exposes accepted projects to external sponsors. | **M** | None. | The Instagram-style **sponsor reels feed** for accepted projects, backed by the `sponsorAssignments` table. |
| 8 | Role-based access control across four user types. | **M** | None (implicit trust). | RBAC enforced at the Convex function boundary via `ctx.auth.getUserIdentity()` plus a role field in the `users` table. |
| 9 | Institutional analytics over the project portfolio. | **S** | Manual spreadsheets. | Administrator dashboards built with `recharts` and `@tanstack/react-table` on top of the system tables. |
| 10 | A fully Arabic, right-to-left user experience. | **M** | Mixed RTL/LTR experience in generic tools. | Native RTL implementation with the Tajawal typeface and Clerk Arabic localisation. |
| 11 | Self-service career progression for students who become teaching assistants. | **C** | Manual letters and approvals. | The `supervisorUpgradeRequests` workflow with administrator approval. |
| 12 | A complete record of system actions for accountability. | **M** | None. | The append-only `activityLogs` table visible to administrators. |

## 3.8 Alternatives and Competition

ZUJ Incubator is not entering an empty market; several adjacent classes of tooling are already used — informally — to perform parts of its workflow. The table below positions the most relevant alternatives.

| Alternative | Category | Strengths | Weaknesses | Why It Falls Short of ZUJ Incubator |
|---|---|---|---|---|
| **Moodle / Microsoft Teams for Education / Google Classroom** | Learning Management Systems (LMS) | Already deployed at most universities; mature; integrated with student accounts. | Centred on courses, assignments, and grades; no concept of an *incubation application* or a *sponsor*; no immutable review log; no reels feed. | Cannot model the three submission tracks, the supervisor-review state machine, or sponsor matchmaking. |
| **Microsoft 365 / Google Workspace (Forms, Drive, Email)** | Generic collaboration suites | Universally available; familiar to staff. | Workflow lives across disconnected tools; no audit trail; no role enforcement; no analytics; no Arabic-first UX. | Reproduces today's fragmented, paper-replacing-paper experience that the project is designed to eliminate. |
| **Trello / Asana / Jira** | Project-management trackers | Strong task boards; well-known. | Generic kanban; no domain model for academic incubation; no sponsor view; no media uploads with previews; no Arabic-academic content modules. | Treats projects as tasks, not as audited academic applications belonging to institutional tracks. |
| **AngelList / Wamda / regional investor portals** | Sponsor-facing deal-flow platforms | Real investor audiences. | External, not affiliated with the university; no academic supervision layer; no Arabic-academic content; no institutional accountability. | They lack the academic submission and review pipeline; they only solve the sponsor-discovery slice. |
| **Custom in-house spreadsheets and shared drives** | Bespoke informal tooling | Zero direct cost; flexible. | Error-prone; no concurrency control; no audit; no notifications; no role enforcement; not scalable. | Represents the *status quo* this project explicitly replaces. |

The competitive analysis shows that, while individual capabilities of ZUJ Incubator can be partially approximated by existing tools, **no single alternative delivers an integrated, role-aware, audited, RTL-Arabic incubation pipeline that connects students, supervisors, sponsors, and administrators within one institutional product.** This integration — not any single isolated feature — constitutes the defensible position of the platform.

---

# Chapter 4 — Product Overview

## 4.1 Product Perspective

**ZUJ Incubator (حاضنة الزيتونة)** is delivered as a **self-contained, web-based product** that operates as a single logical system in production rather than as a sub-component of a larger institutional information system. The platform owns its data, its identity-to-role mapping, its content modules, and its user-facing experience, and it does **not** currently embed itself inside Al-Zaytoonah University's wider academic management or student information systems.

Notwithstanding this autonomy, the product is intentionally built on top of three external **Backend-as-a-Service** providers, each of which it integrates with through well-defined, asynchronous boundaries:

| Integration | Direction | Purpose | Interface |
|---|---|---|---|
| **Convex Cloud** | Outbound (always-on) | Hosts the relational schema, executes queries / mutations / actions, and provides real-time subscriptions and file storage. | Convex client SDK (`convex/react`), `_generated/api` typed bindings. |
| **Clerk** | Bidirectional | Issues JWTs for authentication, hosts the sign-in / sign-up UI, and emits user-lifecycle webhooks. | `@clerk/nextjs` middleware, `ConvexProviderWithClerk`, `svix`-signed webhooks consumed at `convex/http.ts`. |
| **Vercel** | Hosting | Builds and serves the Next.js front end and triggers the Convex deploy step on each release. | Standard `next build` pipeline plus the `convex deploy --cmd 'next build'` hook. |
| **Browser environment** | Inbound | Loads the RTL Arabic UI on Chrome, Edge, Safari, and Firefox (latest two major versions). | Standard HTML / ES2022 / CSS3 over HTTPS. |

The product is architected so that the front end (Next.js App Router under `src/app/`) and the back end (Convex functions under `convex/`) share a single TypeScript type system through Convex's `_generated/api`, eliminating an entire class of contract-drift defects that would otherwise be possible at the integration boundary. Future integration with university SSO, financial systems, or alumni databases is anticipated but explicitly out of scope for the current release.

## 4.2 Summary of Capabilities

| # | Feature | Description | Benefit |
|---|---|---|---|
| 1 | **Multi-Track Application Submission** | A unified submission form supporting the three official tracks (`entrepreneurial_idea`, `it_graduation`, `university_entrepreneurial`) with track-aware validation and required fields. | One canonical channel for every type of incubated project; eliminates fragmented intake processes. |
| 2 | **Deterministic Review State Machine** | Five enforced states (`draft → under_review → needs_modification → accepted | rejected`) governing the lifecycle of every application. | Predictable progression; no orphaned or inconsistent submissions. |
| 3 | **Immutable Audit Log** | Append-only `applicationReviews` and `activityLogs` tables capturing every state change, supervisor action, and administrative event. | Full institutional accountability and academic integrity. |
| 4 | **Real-Time Presence** | Heartbeat-based `applicationPresence` indicating which supervisor is currently viewing an application. | Prevents duplicate review effort and supports coordinated supervision. |
| 5 | **Typed Notification System** | Domain-typed notifications (`status_change`, `new_note`, `new_application`, `assignment`, etc.) surfaced in real time. | Timely user awareness without dependence on external email channels. |
| 6 | **Role-Based Access Control (RBAC)** | Four roles (`student`, `supervisor`, `sponsor`, `admin`) enforced at the Convex function boundary via `ctx.auth.getUserIdentity()`. | Robust security and least-privilege by design. |
| 7 | **Media Uploads and Previews** | PDF business plans and pitch videos uploaded to Convex Storage, with in-browser PDF previews powered by `react-pdf` and pitch-video playback through the native HTML5 `<video>` element. | Rich, self-contained applications with no external file-sharing detours. |
| 8 | **Sponsor Reels Feed** | Instagram-style vertical feed exposing accepted projects to authenticated sponsors, backed by `sponsorAssignments`. | Bridges the academic and investment ecosystems through a familiar discovery pattern. |
| 9 | **Markdown Articles with Audience Targeting** | Supervisor- and admin-authored articles rendered via `react-markdown` + `remark-gfm`, scoped to specific audiences. | Centralised, high-quality entrepreneurial learning content. |
| 10 | **Banners and Entrepreneurial Guide** | Scrolling and hero banners plus a curated library of videos, courses, and external resources. | Structured engagement and educational support for students. |
| 11 | **Supervisor Upgrade Requests** | Self-service workflow allowing students who become teaching assistants to request promotion to a supervisor role, subject to admin approval. | Reduces administrative overhead for routine role changes. |
| 12 | **Administrative Dashboards** | Analytics and tabular management built with `recharts` and `@tanstack/react-table` over the institutional data. | Data-driven oversight of the incubator portfolio. |
| 13 | **Institutional Metadata Management** | CRUD interfaces for colleges, departments, social links, and user roles. | Single source of truth for institutional structure. |
| 14 | **RTL Arabic UI** | Fully right-to-left interface using the Tajawal typeface, HeroUI v3 components, Tailwind CSS v4, and Clerk Arabic localisation. | Native-quality experience for the Arabic-speaking primary audience. |
| 15 | **Continuous Deployment Pipeline** | Vercel build hook (`convex deploy --cmd 'next build'`) deploying both front end and Convex backend on each release. | Predictable, repeatable, low-risk releases. |

## 4.3 Assumptions and Dependencies

### 4.3.1 Assumptions

The product is engineered under the following explicit assumptions:

| # | Assumption | Justification |
|---|---|---|
| A1 | End users have continuous access to the public internet over HTTPS. | The system has no offline mode and relies on Convex live queries for real-time behaviour. |
| A2 | Users access the platform from an evergreen browser (Chrome, Edge, Safari, or Firefox — latest two major versions). | Next.js 16, Tailwind v4, and HeroUI v3 target modern browsers; legacy browsers are not supported. |
| A3 | Each user possesses a unique, verifiable email address or phone number accepted by Clerk. | Clerk is the sole identity provider; account creation is gated by Clerk's verification flows. |
| A4 | Al-Zaytoonah University formally endorses the platform and provides at least one administrator account during onboarding. | An empty `users` table with `role = "admin"` cannot bootstrap itself; the first admin is seeded manually. |
| A5 | Sponsors are vetted and onboarded by an administrator rather than self-registering as sponsors. | Sponsor role is created administratively (see `convex/users/`) to preserve trust in the reels feed. |
| A6 | Application content (PDFs and videos) does not exceed the file-size limits of the configured Convex Storage tier. | The platform delegates file persistence to Convex Storage rather than implementing its own storage layer. |
| A7 | Arabic is the primary content language and Latin scripts may occur within technical terms. | The Tajawal font and RTL layout are tuned for Arabic with mixed-direction tolerance. |

### 4.3.2 Dependencies

The product depends on the following external services, frameworks, and libraries. The versions listed are those pinned in `package.json` at the time of writing.

**Cloud platforms.**

| Service | Role |
|---|---|
| Convex (`convex` v1.36.1) | Database, server-side functions, real-time subscriptions, file storage. |
| Clerk (`@clerk/nextjs` v6.39.2, `@clerk/clerk-react` v5.61.3, `@clerk/backend` v3.4.2, `@clerk/localizations` v4.5.5) | Authentication, identity, JWT issuance, RTL localisation. |
| Vercel | Hosting, CI/CD for both the Next.js front end and the Convex backend deploy step. |

**Application frameworks.**

| Framework / Library | Role |
|---|---|
| Next.js v16.2.4 | App Router, server components, routing, build pipeline. |
| React v19 + React DOM | UI runtime. |
| TypeScript v5.9.3 | Static typing across front end and Convex functions. |

**UI and interaction.**

| Library | Role |
|---|---|
| HeroUI v3.0.3 (`@heroui/react`) | Component library and design system. |
| Tailwind CSS v4.2.2 | Utility-first styling; also provides the sponsor reels feed scroll-snap behaviour. |
| Framer Motion v11.18.2 | Pinned in `package.json`; reserved for future animation work — not currently wired into the UI (the reels feed uses CSS scroll-snap). |
| lucide-react v1.11.0 | Icon set. |
| next-themes v0.4.6 | Dark mode and theme persistence. |

**Forms, validation, and data presentation.**

| Library | Role |
|---|---|
| React Hook Form v7.74.0 | Form state management. |
| Zod v4.3.6 | Schema validation on the client. |
| Recharts v3.8.1 | Administrative analytics charts. |
| `@tanstack/react-table` v8.21.3 | Tabular data presentation. |

**Media and content.**

| Library | Role |
|---|---|
| react-pdf v10.4.1 | In-browser preview of PDF business plans. |
| react-player v3.4.0 | Pinned in `package.json`; reserved for future use — pitch videos currently play through the native HTML5 `<video>` element. |
| react-markdown v10.1.0 + remark-gfm | Rendering of supervisor and admin articles. |
| react-dropzone v15.0.0 | File-upload drag-and-drop. |

**Integration utilities.**

| Library | Role |
|---|---|
| svix v1.92.2 | Verification of incoming Clerk webhooks at `convex/http.ts`. |

A breaking change in any of these dependencies — particularly Convex, Clerk, or Next.js — would constitute a material risk and would require a corresponding update sprint.

## 4.4 Cost and Pricing

### 4.4.1 Development Cost

Because ZUJ Incubator is delivered as a graduation project by the student development team, the direct labour cost is **not invoiced** to Al-Zaytoonah University; it is absorbed as part of the academic deliverable. The notional cost is summarised below for academic completeness.

| Cost Item | Quantity | Notional Rate | Notional Cost |
|---|---|---|---|
| Development effort (4 developers × 15 weeks × 20 h) | 1,200 person-hours | 10 JOD / h | 12,000 JOD |
| Academic supervision | 15 weeks × 2 h | — | In-kind |
| Design and testing | Included above | — | — |
| **Notional development total** | — | — | **≈ 12,000 JOD** |

### 4.4.2 Operating (Hosting) Cost

The platform's operating cost is driven by the pricing tiers of the three external services it depends upon. The figures below reflect the publicly listed plans of those providers at the time of writing and should be revalidated before contracting.

| Service | Tier Suitable for Pilot | Tier Suitable for Production | Notes |
|---|---|---|---|
| **Convex** | Free (starter) | Pro (~25 USD / month per project + usage) | Database, functions, file storage; usage charges apply above the included quota. |
| **Clerk** | Free (≤ 10,000 monthly active users) | Pro (from ~25 USD / month + per-MAU charges) | Authentication, RTL localisation, webhooks. |
| **Vercel** | Hobby (free) | Pro (~20 USD / month per seat) | Required for a commercial / institutional deployment. |
| **Domain and TLS** | — | ~15 USD / year | A `*.zuj.edu.jo` subdomain is recommended. |
| **Estimated monthly production total** | — | **≈ 70 – 120 USD / month at moderate load** | Scales with active users and storage volume. |

### 4.4.3 Pricing Model

ZUJ Incubator is intended to be deployed and owned by Al-Zaytoonah University of Jordan as **institutional internal software**. It is therefore **free of charge to end users** (students, supervisors, sponsors, and administrators). No subscription, transactional, or freemium pricing model is applied at the user-facing layer. Any future monetisation — for example, sponsorship transaction fees or premium sponsor-tier features — is explicitly out of scope for the current release and would require an institutional policy decision.

## 4.5 Licensing and Installation

### 4.5.1 Licensing

| Aspect | Position |
|---|---|
| **Ownership** | The source code, design assets, and database schema are the intellectual property of the student development team and Al-Zaytoonah University of Jordan, jointly, as the academic supervising institution. |
| **End-User License** | The platform is licensed for **internal institutional use** by Al-Zaytoonah University. End users do not require a separate licence; access is governed by the RBAC matrix and the university's acceptable-use policy. |
| **Third-Party Licences** | All third-party dependencies are consumed under their published open-source licences (predominantly MIT and Apache 2.0); their notices must be preserved in any redistribution. |
| **Trademarks** | "Al-Zaytoonah University" and "حاضنة الزيتونة" are institutional marks of the university and are used in the product under the university's authority. |

### 4.5.2 Prerequisites

Before installation, the operator must provision the following:

1. A **Convex** project (free tier acceptable for development).
2. A **Clerk** application configured for both development and production, with the Convex JWT template enabled and the issuer domain recorded.
3. A **Vercel** project linked to the Git repository.
4. Node.js LTS and `pnpm` installed on the developer workstation.

### 4.5.3 Environment Variables

The following variables must be provided (see `.env.example`):

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLERK_JWT_ISSUER_DOMAIN`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

### 4.5.4 Installation Steps (Development)

1. Clone the repository.
2. Install dependencies: `pnpm install`.
3. Create a `.env.local` file by copying `.env.example` and populating each variable as documented.
4. In the Convex dashboard, paste the Clerk issuer URL into the `CLERK_JWT_ISSUER_DOMAIN` environment variable of the dev deployment.
5. Start the development environment: `pnpm dev` — this command runs the Convex dev server and the Next.js dev server concurrently.
6. Seed the first administrator account by inserting a record into the `users` table with `role = "admin"` and the appropriate Clerk `tokenIdentifier`.
7. Open `http://localhost:3000` in a supported browser to verify the deployment.

### 4.5.5 Installation Steps (Production)

1. Connect the repository to Vercel and configure the build command as `pnpm build` (which internally invokes `convex deploy --cmd 'next build'`).
2. Populate all environment variables (Section 4.5.3) in Vercel for the production environment.
3. In Clerk, switch from test keys to live keys and update the JWT issuer for the production Convex deployment.
4. Configure the production Convex deployment with the production `CLERK_JWT_ISSUER_DOMAIN`.
5. Bind the production domain (recommended: a `*.zuj.edu.jo` subdomain) and provision TLS via Vercel's managed certificates.
6. Trigger the first production deployment; the build pipeline will deploy both the Next.js front end and the Convex backend atomically.
7. Promote the first administrator account in the production database and conduct UAT with representatives of the incubator office before announcing general availability.

---

# Chapter 5 — Product Features

## 5.1 Feature List

The features below collectively cover every capability implemented within **ZUJ Incubator (حاضنة الزيتونة)**. Each feature is described with the same four attributes — *Feature Name*, *Description*, *Priority*, and *Users Affected* — to facilitate later traceability into the SRS and the test plan. Priority follows the convention **High = critical for the MVP**, **Medium = important but deferrable**, **Low = nice-to-have / quality-of-life enhancement**.

### F-01. User Authentication and Identity Management

- **Description.** Issues and validates user identity through Clerk, with sign-in, sign-up, email/phone verification, password recovery, and session management. JWTs issued by Clerk are validated by Convex against the issuer domain configured in `convex/auth.config.ts`, and incoming Clerk webhooks are verified with `svix` at `convex/http.ts` to synchronise user lifecycle events into the `users` table.
- **Priority.** High.
- **Users Affected.** All authenticated user types (Student, Supervisor, Sponsor, Administrator).

### F-02. Role-Based Access Control (RBAC)

- **Description.** Enforces a four-role authorisation matrix (`student`, `supervisor`, `sponsor`, `admin`) at the Convex function boundary. Every sensitive query, mutation, and action derives the calling user from `ctx.auth.getUserIdentity()`, looks up the corresponding `users` record, and rejects the call when the role does not satisfy the operation's policy.
- **Priority.** High.
- **Users Affected.** All authenticated user types.

### F-03. User Profile Management

- **Description.** Allows authenticated users to view and update their personal data (name, contact details, college, department, avatar) and exposes administrator-only controls for editing the `role` field of any user. Profile data is persisted in the `users` table and kept in sync with Clerk via webhooks.
- **Priority.** High.
- **Users Affected.** All authenticated user types; Administrator additionally for role assignment.

### F-04. Multi-Track Application Submission

- **Description.** Provides students with a unified, track-aware submission form supporting the three official tracks (`entrepreneurial_idea`, `it_graduation`, `university_entrepreneurial`). The form adapts its required fields and validators based on the selected track and writes the resulting record into the `applications` table.
- **Priority.** High.
- **Users Affected.** Student (primary), Supervisor and Administrator (read-only consumption).

### F-05. Application Drafting and Iterative Editing

- **Description.** Permits students to save an application in the `draft` state, return to it across sessions, edit it freely while it remains in `draft` or `needs_modification`, and submit it for review when ready. Drafts are isolated to their owning student.
- **Priority.** High.
- **Users Affected.** Student.

### F-06. Application Lifecycle State Machine

- **Description.** Enforces the deterministic transitions `draft → under_review → needs_modification → accepted | rejected` at the mutation layer. Illegal transitions (for example, `accepted → draft`) are rejected, and every legal transition emits a corresponding entry in the `applicationReviews` table and a typed `notification`.
- **Priority.** High.
- **Users Affected.** Student, Supervisor, Administrator.

### F-07. PDF Business-Plan Upload and Preview

- **Description.** Accepts PDF business-plan documents through a `react-dropzone` interface, persists them in Convex Storage, and renders an in-browser preview through `react-pdf` for reviewers and authorised viewers.
- **Priority.** High.
- **Users Affected.** Student (upload), Supervisor, Sponsor, Administrator (view).

### F-08. Video Pitch Upload and Preview

- **Description.** Accepts pitch videos (uploaded by students), stores them in Convex Storage, and plays them back through the native HTML5 `<video>` element both in the supervisor review screen and in the sponsor reels feed.
- **Priority.** High.
- **Users Affected.** Student (upload), Supervisor, Sponsor, Administrator (view).

### F-09. Supervisor Review, Rating, and Notes

- **Description.** Allows supervisors to advance an application's state, assign a structured rating (`excellent`, `good`, `average`, `poor`), attach a textual note, and record the decision in the immutable review log. Multiple supervisors may review concurrently.
- **Priority.** High.
- **Users Affected.** Supervisor, Student (consumer of the resulting feedback).

### F-10. Immutable Review Audit Log

- **Description.** Persists every state transition and every supervisor note as an append-only record in `applicationReviews`, preserving authorship, timestamp, prior state, new state, and any attached note or rating. Records are never deleted or mutated, guaranteeing academic accountability.
- **Priority.** High.
- **Users Affected.** Supervisor (writer), Administrator (auditor), Student (reader of own history).

### F-11. Real-Time Reviewer Presence

- **Description.** Maintains a heartbeat in `applicationPresence` for every supervisor currently viewing an application and surfaces this presence in the supervisor UI in real time, preventing duplicate reviews and supporting coordinated supervision.
- **Priority.** Medium.
- **Users Affected.** Supervisor.

### F-12. Typed Notification System

- **Description.** Emits domain-typed notifications (`status_change`, `new_note`, `new_application`, `assignment`, and related types) into the `notifications` table; these are delivered to the recipient through Convex live queries and rendered as a dropdown inbox in the UI.
- **Priority.** High.
- **Users Affected.** All authenticated user types.

### F-13. Student Personal Notes Workspace

- **Description.** Provides each student with a private notebook (`studentNotes`) for capturing ideas, reminders, and draft content. Notes are visible only to their owning student and are not part of any submission.
- **Priority.** Low.
- **Users Affected.** Student.

### F-14. Markdown Article Authoring and Publication

- **Description.** Empowers supervisors and administrators to author long-form articles in Markdown, target them at specific audiences (for example, students of a particular college or department), and publish them through a feed rendered by `react-markdown` with `remark-gfm` support.
- **Priority.** Medium.
- **Users Affected.** Supervisor and Administrator (authors), Student (reader).

### F-15. Banner Management

- **Description.** Allows supervisors and administrators to publish three banner variants — *text*, *scrolling*, and *hero* — that appear on student-facing pages, with scheduling and audience controls stored in the `banners` table.
- **Priority.** Medium.
- **Users Affected.** Supervisor and Administrator (authors), Student (reader).

### F-16. Entrepreneurial Guide Library

- **Description.** Maintains a curated catalogue of external entrepreneurial resources (videos, courses, articles, links) in the `entrepreneurialGuide` table, surfaced to students through a categorised browsing interface.
- **Priority.** Medium.
- **Users Affected.** Supervisor and Administrator (curators), Student (consumer).

### F-17. Sponsor Reels Discovery Feed

- **Description.** Presents accepted applications to authenticated sponsors through an Instagram-style vertical video feed built with CSS scroll-snap (`snap-y snap-mandatory`). The feed exposes only projects in the `accepted` state and surfaces credibility signals such as supervisor ratings.
- **Priority.** High.
- **Users Affected.** Sponsor (primary consumer), Student (project owner whose work is exposed).

### F-18. Sponsor Assignment and Matchmaking

- **Description.** Enables sponsors to express funding interest in an accepted application; the resulting record in `sponsorAssignments` triggers a typed assignment notification to the relevant student and supervisor and is visible to administrators for portfolio oversight.
- **Priority.** High.
- **Users Affected.** Sponsor, Student, Supervisor, Administrator.

### F-19. Supervisor Upgrade Request Workflow

- **Description.** Provides a self-service flow allowing students who function as teaching assistants to submit a `supervisorUpgradeRequests` record; administrators review the request and, upon approval, the user's `role` is promoted from `student` to `supervisor`.
- **Priority.** Low.
- **Users Affected.** Student (requester), Administrator (approver).

### F-20. Colleges and Departments Management

- **Description.** Offers administrators full CRUD over the institutional hierarchy stored in the `colleges` and `departments` tables. These entities are referenced by user profiles, articles, and banners for audience targeting.
- **Priority.** High.
- **Users Affected.** Administrator (writer), all other roles (indirect consumers).

### F-21. Social Links Management

- **Description.** Allows administrators to maintain the list of institutional social-media links in the `socialLinks` table, surfaced in the global footer of the application.
- **Priority.** Low.
- **Users Affected.** Administrator (writer), all visitors (reader).

### F-22. Administrative Dashboards and Analytics

- **Description.** Provides administrators with portfolio-level dashboards built using `recharts` (charts and KPIs) and `@tanstack/react-table` (tabular drill-down) over aggregates of applications, reviews, sponsor assignments, and user activity.
- **Priority.** Medium.
- **Users Affected.** Administrator.

### F-23. System-Wide Activity Log

- **Description.** Records every consequential action in the append-only `activityLogs` table — including authentication events, role changes, application transitions, sponsor assignments, and content publication — and exposes the log to administrators through a searchable and filterable interface.
- **Priority.** High.
- **Users Affected.** Administrator (auditor); all other roles generate entries implicitly.

### F-24. Clerk Webhook Synchronisation

- **Description.** Receives signed Clerk lifecycle webhooks (`user.created`, `user.updated`, `user.deleted`, etc.) at the Convex HTTP endpoint defined in `convex/http.ts`, verifies them with `svix`, and reconciles the `users` table accordingly, ensuring that Clerk and Convex never diverge.
- **Priority.** High.
- **Users Affected.** All authenticated user types (indirectly); operated by the system.

### F-25. Right-to-Left Arabic Interface and Theming

- **Description.** Delivers a fully right-to-left Arabic experience using the Tajawal typeface, Clerk's `arSA` localisation, HeroUI v3 components configured for RTL, and a light/dark theme switcher powered by `next-themes`. Layout, typography, and navigation are consistent with Arabic reading conventions across all breakpoints.
- **Priority.** High.
- **Users Affected.** All user types (including Guests).

### F-26. Responsive Multi-Device Layout

- **Description.** Adapts every screen of the platform to mobile, tablet, and desktop breakpoints through Tailwind CSS v4 and HeroUI v3 responsive primitives, ensuring usability on the devices typical of each user type (mobile-first for students and sponsors, desktop-first for supervisors and administrators).
- **Priority.** High.
- **Users Affected.** All user types.

### F-27. Public Marketing and Onboarding Pages

- **Description.** Exposes unauthenticated visitors to public pages that introduce the incubator, present recent announcements, and route users to the Clerk-hosted sign-in and sign-up flows configured by `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`.
- **Priority.** Medium.
- **Users Affected.** Guest / Visitor.

### F-28. Continuous Deployment Pipeline

- **Description.** Implements an integrated build-and-deploy workflow whereby every push to the production branch triggers `convex deploy --cmd 'next build'` on Vercel, atomically updating both the front end and the Convex backend.
- **Priority.** Medium.
- **Users Affected.** Development Team (operators); transparently affects all users.

The above twenty-eight features collectively cover the full operational surface of ZUJ Incubator. Every feature traces to one or more tables, Convex functions, or front-end routes already implemented in the repository, and each will be refined into individual functional requirements in the Software Requirements Specification (SRS) that succeeds this Vision Document.

---

# Chapter 6 — Constraints

The following constraints define the boundary conditions under which **ZUJ Incubator (حاضنة الزيتونة)** must be designed, implemented, and delivered. They are non-negotiable inputs to the architecture and to the project plan.

## 6.1 Technical Constraints

| # | Constraint | Rationale / Implication |
|---|---|---|
| TC-1 | The back end **must** be implemented on Convex (`convex` ≥ 1.36) and consumed through the auto-generated typed API in `convex/_generated/`. | Selected as the project's Backend-as-a-Service; introduces a serverless execution model with built-in real-time subscriptions and disallows arbitrary long-running Node.js code in standard query/mutation contexts. |
| TC-2 | Authentication **must** be delegated to Clerk via `@clerk/nextjs` and `ConvexProviderWithClerk`; the system **shall not** implement a parallel identity layer. | Avoids the cost and risk of a bespoke authentication stack; mandates compliance with Clerk's session, token, and webhook contracts. |
| TC-3 | The front end **must** be built with Next.js 16 (App Router) and React 19. | Determined by the chosen rendering model (RSC + SSR) and by the existing repository foundation. |
| TC-4 | All UI components **must** be implemented with HeroUI v3 and Tailwind CSS v4; bespoke components are permitted only where HeroUI does not provide an equivalent. | Standardises the visual language and reduces accessibility risk; results from the ongoing HeroUI 3 migration. |
| TC-5 | Convex queries **must** use `.withIndex()` rather than `.filter()`, **must not** call `.collect()` on unbounded tables, and **must** include argument validators for every function. | Enforced by the project's Convex guidelines (`convex/_generated/ai/guidelines.md`); violations cause performance, correctness, or validation defects. |
| TC-6 | Node.js-only code (for example, code that uses `node:fs` or third-party SDKs requiring the Node runtime) **must** reside in separate files marked `"use node";` and be exposed only as Convex actions. | Reflects the dual-runtime model of Convex; mixing causes deploy-time failures. |
| TC-7 | The user-facing language **must** be Arabic with full right-to-left support; Latin scripts are permitted only within technical identifiers. | Driven by the primary audience and the institutional context of Al-Zaytoonah University. |
| TC-8 | The system **must** be operable from evergreen browsers (latest two major versions of Chrome, Edge, Safari, and Firefox) on Windows, macOS, Android, and iOS. | Restricted by the modern web features used by Next.js 16, Tailwind v4, and HeroUI v3. |
| TC-9 | Source code **must** be written in TypeScript (strict mode) and **shall not** disable strictness selectively. | Preserves end-to-end type safety between the Convex back end and the Next.js front end. |
| TC-10 | Deployment **must** use the integrated Vercel + Convex pipeline (`convex deploy --cmd 'next build'`); manual server provisioning is not permitted. | Operational simplicity; matches the institutional skill set; reproducibility. |

## 6.2 Time Constraints

| # | Constraint | Detail |
|---|---|---|
| TM-1 | The project **must** be completed within a single academic horizon of fifteen weeks, divided into eleven Scrum sprints (Sprint 0 – Sprint 10). | Imposed by the graduation-project calendar; no extension is available. |
| TM-2 | Sprint Reviews **must** be held at the end of every sprint and attended by the academic project supervisor. | Required by the methodology and by the academic supervision contract. |
| TM-3 | The final deliverable (UAT-validated production deployment, documentation, and source code) **must** be submitted by the end of Sprint 10 (Week 15). | Bound by the official defence date. |
| TM-4 | No feature classified as **Must** in Chapter 8 may slip beyond Sprint 9 without explicit supervisor approval. | Ensures buffer for Sprint 10 testing and stabilisation. |

## 6.3 Budget Constraints

| # | Constraint | Detail |
|---|---|---|
| BC-1 | The development effort **is** delivered as a student academic contribution and is **not invoiced** to the university. | The platform's nominal labour cost is therefore zero on the institutional budget. |
| BC-2 | Recurring operating cost during development **must** remain within the free tiers of Convex, Clerk, and Vercel. | Eliminates out-of-pocket expenditure for the team during the academic semester. |
| BC-3 | Production operating cost **shall not** exceed an estimated 70 – 120 USD / month under moderate institutional load (paid Convex, Clerk, and Vercel tiers plus domain). | The university must be willing to absorb this recurring cost as a precondition of go-live. |
| BC-4 | The project **shall not** rely on paid third-party SDKs, paid component libraries, or paid AI APIs. | Preserves a sustainable cost profile and avoids vendor lock-in beyond the three core BaaS providers. |
| BC-5 | All third-party dependencies **must** be available under permissive open-source licences (predominantly MIT or Apache 2.0). | Avoids licensing fees and complies with institutional IP policy. |

## 6.4 Legal and Organisational Constraints

| # | Constraint | Detail |
|---|---|---|
| LC-1 | The platform **must** comply with the Hashemite Kingdom of Jordan's **Personal Data Protection Law No. 24 of 2023**, including lawful basis for processing, purpose limitation, and the data-subject rights it establishes. | Mandatory for any system processing personal data of Jordanian residents. |
| LC-2 | The platform **must** comply with Al-Zaytoonah University's internal policies on student records, academic integrity, intellectual-property ownership of student projects, and acceptable use of institutional information systems. | Required for institutional endorsement. |
| LC-3 | Authentication and personal data flows **must** rely on Clerk's compliance posture (SOC 2 Type II) rather than on a bespoke alternative. | Reduces compliance burden on the project team. |
| LC-4 | Application content (PDFs, videos, textual ideas) **belongs** to the submitting student; the platform acquires only a non-exclusive licence to display and distribute the work to authorised reviewers and, for accepted projects, to vetted sponsors. | Required to respect student IP rights. |
| LC-5 | Administrative and audit data (`activityLogs`, `applicationReviews`) **must** be retained for the period mandated by university record-keeping policy and **must not** be modified or deleted by any user. | Required for academic accountability. |
| LC-6 | The platform **shall not** transfer personal data outside the regions in which Convex and Clerk operate without an explicit institutional decision documented in writing. | Aligns with PDPL cross-border-transfer provisions. |
| LC-7 | The platform **must not** introduce features that violate the Jordanian Electronic Transactions Law, the Cybercrime Law, or any sectoral regulation relevant to higher education. | General regulatory baseline. |
| LC-8 | All branding, including the official trademark "حاضنة الزيتونة \| ZUJ Incubator", **must** be used only with the authority of the university's public-relations department. | Institutional brand protection. |

---

# Chapter 7 — Quality Ranges

This chapter defines the non-functional quality targets that **ZUJ Incubator (حاضنة الزيتونة)** must satisfy in production. The thresholds below are measurable and will be verified during Sprint 9 (Hardening) and Sprint 10 (UAT).

## 7.1 Usability

| Quality Attribute | Target | Verification Method |
|---|---|---|
| Task discoverability for first-time students | A first-time student shall be able to locate and begin a new application within **≤ 90 seconds** of authenticated landing. | Moderated usability testing with 5 students. |
| Submission completion rate | A motivated student shall be able to complete a full submission (including PDF and video upload) in **≤ 15 minutes**. | Stopwatch measurement during UAT. |
| RTL layout correctness | **100 %** of screens shall render without LTR layout regressions; mixed-direction text (Arabic + Latin identifiers) shall remain readable. | Visual regression review across 1280, 1024, 768, and 375 px breakpoints. |
| Accessibility | The platform shall conform to **WCAG 2.1 Level AA** for colour contrast, keyboard navigation, and screen-reader labelling on all critical paths. | Automated axe-core scan + manual keyboard traversal. |
| Error feedback | Every user-visible error shall provide a localised Arabic message and a recovery action within **≤ 1 screen**. | UI inspection per UAT scenario. |

## 7.2 Performance

| Quality Attribute | Target | Verification Method |
|---|---|---|
| Initial page load (Time to Interactive) | **≤ 3.0 s** on a desktop broadband connection; **≤ 5.0 s** on simulated 4G. | Lighthouse audit on production build. |
| Convex query latency (P50) | **≤ 150 ms** for indexed reads under normal load. | Convex dashboard insights. |
| Convex query latency (P95) | **≤ 500 ms** for indexed reads under normal load. | Convex dashboard insights. |
| Mutation round-trip (P95) | **≤ 800 ms** for state-machine transitions and review writes. | Application logs. |
| Real-time notification delivery | **≤ 1.0 s** between event emission and recipient UI update. | Stopwatch during multi-tab UAT. |
| PDF preview render | **≤ 2.0 s** for a 5 MB PDF. | Manual measurement. |
| Reels-feed scroll | Smooth **60 fps** swipe animation on a mid-range mobile device. | Chrome DevTools performance profile. |

## 7.3 Reliability

| Quality Attribute | Target | Verification Method |
|---|---|---|
| System availability | **≥ 99.5 %** monthly uptime, inheriting the SLAs of Convex, Clerk, and Vercel. | Provider status pages and uptime monitoring. |
| Mean Time Between Failures (MTBF) | **≥ 30 days** for incidents requiring developer intervention. | Incident log during pilot. |
| Mean Time To Recovery (MTTR) | **≤ 4 hours** for production-affecting defects. | Incident log during pilot. |
| Data durability | **No** loss of any record in `applications`, `applicationReviews`, or `activityLogs` under normal operation; recovery via Convex point-in-time snapshots. | Convex platform guarantees + tabletop drill. |
| Defect escape rate | **≤ 5 %** of defects shall escape from staging into production. | Defect-tracking audit at the end of Sprint 10. |
| Audit-log completeness | **100 %** of state transitions shall produce a corresponding `applicationReviews` entry. | Code review of the state-machine mutations plus manual verification during UAT. |

## 7.4 Scalability

| Quality Attribute | Target | Verification Method |
|---|---|---|
| Concurrent authenticated users | The system shall sustain **≥ 500** concurrent authenticated users without measurable degradation of P95 latency. | Synthetic load test prior to go-live. |
| Total registered users | The data model shall accommodate **≥ 20,000** users without schema changes. | Schema review and indexed-read benchmark. |
| Submitted applications per academic year | The system shall handle **≥ 5,000** applications per year with stable performance. | Capacity projection based on Convex insights. |
| Storage growth | Convex Storage shall accommodate the projected **≥ 50 GB** of cumulative PDF and video assets per year. | Tier sizing exercise. |
| Horizontal scaling | All scaling is **delegated** to Convex, Clerk, and Vercel; the application layer is stateless and requires no operator intervention to scale. | Architectural review. |

## 7.5 Security

| Quality Attribute | Target | Verification Method |
|---|---|---|
| Authentication | **100 %** of non-public endpoints shall reject anonymous or invalid Clerk JWTs. | Automated test calling each Convex function without a token. |
| Authorisation (RBAC) | **0 %** of cross-role privilege escalations shall succeed in a structured penetration test. | Manual RBAC matrix test. |
| Transport security | **100 %** of HTTP traffic shall be served over HTTPS with TLS 1.2+ enforced by Vercel. | TLS scan. |
| Webhook integrity | **100 %** of Clerk webhooks shall be verified via `svix` signatures before any database mutation. | Code review of `convex/http.ts`. |
| Input validation | **100 %** of Convex functions shall declare argument validators (`v.*`). | Static check in CI. |
| OWASP coverage | The system shall not be vulnerable to any item in the **OWASP Top 10 (2021)** at the time of go-live. | Internal security review. |
| Audit log immutability | **0** authorised paths shall allow deletion or mutation of `activityLogs` records. | Code review and runtime test. |
| Sensitive-data handling | Personal data shall be processed strictly in accordance with the Jordanian **PDPL No. 24 of 2023** (see §6.4). | Compliance checklist signed off by the academic supervisor. |

---

# Chapter 8 — Precedence and Priority

This chapter defines how the features described in Chapter 5 are ranked, sequenced, and made dependent upon one another. Prioritisation follows the **MoSCoW** convention; dependencies are captured at feature granularity; and implementation order is mapped onto the Scrum plan introduced in Chapter 1.

## 8.1 Prioritisation Method — MoSCoW

| Tier | Meaning in the Context of ZUJ Incubator |
|---|---|
| **Must (M)** | Required for the MVP; absence makes the platform unable to fulfil its core mission. |
| **Should (S)** | Strongly desired; absence noticeably weakens the value proposition but does not block go-live. |
| **Could (C)** | Beneficial enhancement; included if capacity allows during the academic horizon. |
| **Won't (W)** | Explicitly out of scope for the current release; recorded to bound stakeholder expectations. |

## 8.2 Feature Priority Matrix

| # | Feature | MoSCoW |
|---|---|---|
| F-01 | User Authentication and Identity Management | **M** |
| F-02 | Role-Based Access Control (RBAC) | **M** |
| F-03 | User Profile Management | **M** |
| F-04 | Multi-Track Application Submission | **M** |
| F-05 | Application Drafting and Iterative Editing | **M** |
| F-06 | Application Lifecycle State Machine | **M** |
| F-07 | PDF Business-Plan Upload and Preview | **M** |
| F-08 | Video Pitch Upload and Preview | **M** |
| F-09 | Supervisor Review, Rating, and Notes | **M** |
| F-10 | Immutable Review Audit Log | **M** |
| F-11 | Real-Time Reviewer Presence | **S** |
| F-12 | Typed Notification System | **M** |
| F-13 | Student Personal Notes Workspace | **C** |
| F-14 | Markdown Article Authoring and Publication | **S** |
| F-15 | Banner Management | **S** |
| F-16 | Entrepreneurial Guide Library | **S** |
| F-17 | Sponsor Reels Discovery Feed | **M** |
| F-18 | Sponsor Assignment and Matchmaking | **M** |
| F-19 | Supervisor Upgrade Request Workflow | **C** |
| F-20 | Colleges and Departments Management | **M** |
| F-21 | Social Links Management | **C** |
| F-22 | Administrative Dashboards and Analytics | **S** |
| F-23 | System-Wide Activity Log | **M** |
| F-24 | Clerk Webhook Synchronisation | **M** |
| F-25 | RTL Arabic Interface and Theming | **M** |
| F-26 | Responsive Multi-Device Layout | **M** |
| F-27 | Public Marketing and Onboarding Pages | **S** |
| F-28 | Continuous Deployment Pipeline | **M** |
| OOS-1 | In-platform payments and sponsor disbursement | **W** |
| OOS-2 | Automated AI-based application scoring | **W** |
| OOS-3 | Native mobile applications (iOS / Android) | **W** |
| OOS-4 | Multi-university federation | **W** |
| OOS-5 | SMS / WhatsApp notification channels | **W** |

## 8.3 Feature Dependencies

The dependency graph below shows which features must be available before others can be developed. *"X → Y"* should be read as *"Y depends on X"*.

| Feature | Depends Upon |
|---|---|
| F-02 RBAC | F-01 |
| F-03 Profile Management | F-01, F-24 |
| F-04 Submission | F-01, F-02, F-20 |
| F-05 Drafting | F-04 |
| F-06 State Machine | F-04, F-09 |
| F-07 PDF Upload | F-04 |
| F-08 Video Upload | F-04 |
| F-09 Review and Rating | F-02, F-06 |
| F-10 Audit Log | F-06, F-09 |
| F-11 Presence | F-02, F-09 |
| F-12 Notifications | F-06, F-09, F-18 |
| F-14 Articles | F-02, F-20 |
| F-15 Banners | F-02, F-20 |
| F-16 Entrepreneurial Guide | F-02 |
| F-17 Sponsor Reels Feed | F-02, F-06, F-08 |
| F-18 Sponsor Assignment | F-02, F-17 |
| F-19 Supervisor Upgrade Request | F-02, F-03 |
| F-22 Admin Dashboards | F-01, F-02, F-04, F-06, F-09, F-18 |
| F-23 Activity Log | F-02 (writes from F-01, F-06, F-18, F-19, others) |
| F-24 Clerk Webhooks | F-01 |
| F-25 RTL / Theming | (foundation, no functional dependency) |
| F-26 Responsive Layout | F-25 |
| F-27 Public Pages | F-01 |
| F-28 Deployment Pipeline | (cross-cutting) |

## 8.4 Implementation Order by Sprint

The sequence below is consistent with the Scrum plan in Chapter 1 and respects all dependencies declared in §8.3.

| Sprint | Window | Features Delivered |
|---|---|---|
| **Sprint 0** | Week 1 | Backlog, SRS finalisation (no production features). |
| **Sprint 1** | Weeks 2 – 3 | F-25, F-26, F-28, F-01, F-24 |
| **Sprint 2** | Weeks 4 – 5 | F-02, F-03, F-20 |
| **Sprint 3** | Weeks 6 – 7 | F-04, F-05, F-07, F-08 |
| **Sprint 4** | Weeks 8 – 9 | F-06, F-09, F-10 |
| **Sprint 5** | Week 10 | F-11, F-12, F-23 |
| **Sprint 6** | Week 11 | F-14, F-15, F-16, F-27 |
| **Sprint 7** | Week 12 | F-17, F-18 |
| **Sprint 8** | Week 13 | F-22, F-13, F-19, F-21 |
| **Sprint 9** | Week 14 | Hardening: accessibility, performance, security, RTL polish (no new features). |
| **Sprint 10** | Week 15 | UAT, production deployment, documentation handover. |

The ordering above ensures that every Must-have feature is delivered no later than Sprint 8 (Week 13), leaving Sprints 9 and 10 entirely for stabilisation, in compliance with constraint **TM-4** (§6.2).

---

# Chapter 9 — Other Product Requirements

This chapter consolidates the remaining product-level requirements of **ZUJ Incubator (حاضنة الزيتونة)** that are not covered elsewhere in this document. The technology baseline assumed by these requirements is: **TypeScript 5.9** on **Next.js 16 (App Router)** with **React 19**, a **Convex 1.36** serverless back end, **Clerk** for identity, **HeroUI 3** + **Tailwind CSS 4** for the UI, and **Vercel** for hosting.

## 9.1 Applicable Standards

The platform shall comply with, or be designed in accordance with, the following standards and codes of practice.

| Domain | Standard / Practice | Applicability |
|---|---|---|
| Software Requirements | **IEEE Std 830-1998** — Recommended Practice for SRS | Format of the SRS that succeeds this Vision Document. |
| Software Engineering Process | **Scrum Guide** (Schwaber & Sutherland, 2020) | Project methodology, sprint cadence, ceremonies. |
| Web Accessibility | **W3C WCAG 2.1 Level AA** | All user-facing screens. |
| Web Security | **OWASP Top 10 (2021)** | Threat model and defensive coding baseline. |
| Information Security | **ISO/IEC 27001:2022** (principles, inherited from Clerk's SOC 2 Type II posture) | Identity, session, and data-handling design. |
| Personal Data Protection | **Hashemite Kingdom of Jordan PDPL No. 24 of 2023** | Lawful basis, purpose limitation, data-subject rights. |
| Software Quality Model | **ISO/IEC 25010** | Non-functional quality categories used in Chapter 7. |
| Source Code | **TypeScript strict mode** + project-specific Convex guidelines | Enforced in CI. |
| Internationalisation | **Unicode Standard (Bidirectional Algorithm)** | Mixed Arabic / Latin text rendering. |
| API Style | **Convex typed functions** as the public contract — no bespoke REST or GraphQL layer | Architectural standardisation. |

## 9.2 System Requirements

### 9.2.1 End-User Workstation (Minimum)

| Component | Minimum Specification |
|---|---|
| Operating system | Windows 10, macOS 12, Android 10, iOS 15, or any current Linux distribution. |
| Browser | Latest two major versions of Chrome, Edge, Safari, or Firefox. |
| Processor | Dual-core 2 GHz or equivalent mobile SoC. |
| Memory | 4 GB RAM. |
| Storage | 200 MB free disk for browser cache and downloads. |
| Display | Minimum width 360 px (mobile); recommended 1280 px or higher (desktop). |
| Connectivity | Continuous HTTPS connectivity at ≥ 5 Mbps for desktop and ≥ 4G LTE for mobile. |
| Peripherals | Camera and microphone are **not required** for end users but are recommended when recording pitch videos before upload. |

### 9.2.2 Developer Workstation

| Component | Specification |
|---|---|
| Operating system | macOS, Linux, or Windows with WSL 2. |
| Node.js | Current LTS (≥ 20.x). |
| Package manager | `pnpm` (project standard). |
| IDE | VS Code recommended with the TypeScript, ESLint, Tailwind CSS, and Convex extensions. |
| Memory | 8 GB RAM minimum, 16 GB recommended. |
| Disk space | 5 GB free for the project, dependencies, and build caches. |
| Network | Stable broadband; access to `convex.cloud`, `clerk.com`, and `vercel.com`. |

### 9.2.3 Server-Side Infrastructure

| Component | Specification |
|---|---|
| Back end | Convex Cloud (managed); no self-hosted servers. |
| Identity provider | Clerk (managed). |
| Hosting | Vercel (managed); Next.js Serverless Functions and Edge runtime as configured by the framework. |
| File storage | Convex Storage. |
| Operator infrastructure | Zero on-premise infrastructure required. |

## 9.3 Performance Requirements

The following are the binding performance targets in production. They consolidate the figures introduced in §7.2.

| Requirement | Target | Conditions |
|---|---|---|
| Initial page load (TTI) | ≤ 3.0 s on broadband; ≤ 5.0 s on simulated 4G. | Cold cache, production build. |
| Convex query latency, P50 | ≤ 150 ms. | Indexed read, normal load. |
| Convex query latency, P95 | ≤ 500 ms. | Indexed read, normal load. |
| Mutation round-trip, P95 | ≤ 800 ms. | State transitions and review writes. |
| Real-time notification delivery | ≤ 1.0 s. | Between event emission and recipient UI update. |
| Concurrent authenticated users | ≥ 500 without measurable degradation of P95 latency. | Mixed read/write workload. |
| Capacity per academic year | ≥ 5,000 submitted applications with stable performance. | End-to-end workload. |
| Reels-feed frame rate | ≥ 60 fps on a mid-range mobile device. | Sponsor session. |
| PDF preview render | ≤ 2.0 s for a 5 MB document. | Authenticated session. |
| Build pipeline duration | ≤ 6 minutes end-to-end (`pnpm build` on Vercel). | CI environment. |

## 9.4 Environmental Requirements

| Aspect | Requirement |
|---|---|
| **Network** | Continuous HTTPS connectivity over IPv4 or IPv6; outbound access to `*.convex.cloud`, `*.clerk.com`, and `*.vercel.app` (or the bound institutional subdomain). |
| **Browser features** | JavaScript enabled; service workers enabled; modern Web APIs (Fetch, WebSocket, IntersectionObserver, ResizeObserver, MediaSource Extensions for video). |
| **Display direction** | The interface is rendered exclusively in right-to-left; client devices must honour the `dir="rtl"` attribute (universally supported in modern browsers). |
| **Locale** | Primary locale `ar-JO`; secondary fallback `en-US` for technical terms. |
| **Time zone** | Timestamps are stored in UTC and rendered in the user's local time zone, with `Asia/Amman` as the institutional default. |
| **Power and reliability** | The platform makes no specific power-management demands; behaviour during a sudden network interruption follows Convex's reconnection semantics. |
| **Physical environment** | Standard office, classroom, or domestic environments; no specialised hardware. |
| **Sustainability** | The serverless deployment model minimises idle resource consumption; no continuously-running servers are operated by the project team. |

---

# Chapter 10 — Documentation Requirements

This chapter enumerates the documentation artefacts that must accompany **ZUJ Incubator (حاضنة الزيتونة)** at the time of delivery. All documentation is produced in **Arabic** as the primary language, with English used for technical identifiers and code excerpts.

## 10.1 User Manual

| Aspect | Requirement |
|---|---|
| **Audience** | Four distinct manuals — one per role (Student, Supervisor, Sponsor, Administrator) — to avoid information overload. |
| **Format** | Delivered as a downloadable PDF and as a web-accessible documentation section embedded in the platform. |
| **Language** | Arabic, with right-to-left layout; English glossary at the end of each manual. |
| **Length** | Concise: ≤ 25 pages per role; supplemented by annotated screenshots. |
| **Content (Student manual)** | Account creation, profile completion, choosing a track, drafting an application, uploading a PDF business plan and a pitch video, monitoring status, reading supervisor feedback, consuming articles and the entrepreneurial guide, requesting a supervisor upgrade. |
| **Content (Supervisor manual)** | Logging in, reviewing the queue, opening an application, recording a rating and note, advancing or rejecting a submission, coordinating with co-supervisors via presence indicators, authoring articles and banners, curating the guide library. |
| **Content (Sponsor manual)** | Browsing the reels feed, interpreting credibility signals, expressing interest in a project, viewing sponsor assignments. |
| **Content (Administrator manual)** | Managing colleges, departments, social links, and user roles; processing supervisor-upgrade requests; reviewing the activity log; interpreting analytics dashboards. |
| **Versioning** | Each manual is version-stamped with the corresponding release tag and date. |

## 10.2 Online Help

| Aspect | Requirement |
|---|---|
| **Contextual tooltips** | Every non-trivial control shall expose a HeroUI `Tooltip` with a short Arabic explanation, triggered on hover (desktop) or long-press (mobile). |
| **Inline guidance** | Multi-step screens (submission form, supervisor review) shall display inline hints adjacent to each field. |
| **Empty-state messaging** | All lists and dashboards shall present an instructive empty state explaining how to populate the view. |
| **In-app FAQ** | A dedicated FAQ page shall consolidate the twenty most frequently asked questions, structured by role, and shall be searchable. |
| **Error pages** | Every error response shall present an Arabic message, a probable cause, and an actionable next step (for example, *"Reload"*, *"Contact administrator"*). |
| **Onboarding tour** | First-time users of each role shall be offered a dismissible guided tour of the principal screens (Student dashboard, Supervisor queue, Sponsor reels, Admin console). |

## 10.3 Installation Guide

The installation guide is targeted at the IT operator responsible for deploying and maintaining the platform. It shall contain the sections below; the canonical contents are derived from the development workflow already captured in the repository.

| Section | Contents |
|---|---|
| **Prerequisites** | Required Convex, Clerk, and Vercel accounts; Node.js LTS; `pnpm`; Git. |
| **Environment Variables** | The full list defined in `.env.example` — `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `CLERK_JWT_ISSUER_DOMAIN`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. |
| **Local Development** | `pnpm install`; `pnpm dev`; verifying the Convex–Clerk JWT integration. |
| **Production Deployment** | Connecting the repository to Vercel; configuring the build command `pnpm build` (which internally invokes `convex deploy --cmd 'next build'`); switching Clerk and Convex to production keys; binding the institutional subdomain; provisioning TLS. |
| **First-Run Configuration** | Seeding the first administrator account in the production `users` table; populating the initial colleges and departments; configuring social links. |
| **Backup and Recovery** | Convex point-in-time snapshots, schedule, and restoration procedure; Clerk export procedure for user records. |
| **Troubleshooting** | Common errors (JWT mismatch, missing env vars, webhook signature failure) and their resolutions. |
| **Upgrade Procedure** | Pulling a new release, regenerating `_generated/`, and re-running the unified Vercel build. |

## 10.4 Labelling and Packaging

| Aspect | Requirement |
|---|---|
| **Official Name** | The platform shall be presented as **"حاضنة الزيتونة \| ZUJ Incubator"**, consistent with `src/app/layout.tsx`. |
| **Logo and Identity** | The institutional logo of Al-Zaytoonah University shall appear in the global header and on the public landing page, sized to remain legible at all breakpoints. |
| **Colour Palette** | The palette shall align with the university's visual identity; HeroUI theme tokens shall map to those colours. |
| **Typography** | The primary typeface shall be **Tajawal** (variable, multiple weights), as already configured in the project layout. |
| **Iconography** | Icons shall be drawn from `lucide-react` for visual consistency. |
| **Favicon and PWA Metadata** | A favicon, apple-touch-icon, and `web-manifest` entry shall be supplied to ensure the platform displays correctly when bookmarked or added to a mobile home screen. |
| **Footer Branding** | The footer shall display copyright information, the institutional URL, and the social-media links managed in the `socialLinks` table. |
| **Release Packaging** | Each production release shall be tagged in Git using semantic versioning (e.g. `v1.0.0`); the same tag shall appear in the in-app *About* dialog. |
| **Documentation Cover** | The cover page of every manual shall display the project name, the university logo, the release version, and the academic semester of issue. |

---

# Appendix A — Feature Attributes

The matrix below records the management attributes of every feature introduced in Chapter 5. It is the master reference for prioritisation, capacity planning, and risk management. All twenty-eight features are currently in **Incorporated** status, having been implemented (or scheduled within the Scrum plan in Chapter 8) and accepted by the academic project supervisor.

| ID | Feature Name | Status | Benefit | Effort | Risk | Stability | Target Release | Assigned To | Reason |
|---|---|---|---|---|---|---|---|---|---|
| F-01 | User Authentication and Identity Management | Incorporated | High | Medium | Medium | High | v1.0 (Sprint 1) | Back-end lead | Foundational; no other feature can ship without it. |
| F-02 | Role-Based Access Control (RBAC) | Incorporated | High | Medium | High | High | v1.0 (Sprint 2) | Back-end lead | Required to enforce institutional separation of duties. |
| F-03 | User Profile Management | Incorporated | High | Low | Low | High | v1.0 (Sprint 2) | Full-stack developer | Baseline expectation for any authenticated platform. |
| F-04 | Multi-Track Application Submission | Incorporated | High | High | Medium | High | v1.0 (Sprint 3) | Full-stack developer | Core domain workflow; defines the platform's purpose. |
| F-05 | Application Drafting and Iterative Editing | Incorporated | High | Medium | Low | High | v1.0 (Sprint 3) | Full-stack developer | Reflects real student behaviour during submission. |
| F-06 | Application Lifecycle State Machine | Incorporated | High | Medium | High | High | v1.0 (Sprint 4) | Back-end lead | Encodes the official institutional process. |
| F-07 | PDF Business-Plan Upload and Preview | Incorporated | High | Medium | Medium | High | v1.0 (Sprint 3) | Front-end developer | Required by institutional submission policy. |
| F-08 | Video Pitch Upload and Preview | Incorporated | High | Medium | Medium | High | v1.0 (Sprint 3) | Front-end developer | Enables the sponsor reels feed. |
| F-09 | Supervisor Review, Rating, and Notes | Incorporated | High | High | Medium | High | v1.0 (Sprint 4) | Full-stack developer | The supervisor's primary daily workflow. |
| F-10 | Immutable Review Audit Log | Incorporated | High | Low | High | High | v1.0 (Sprint 4) | Back-end lead | Required for academic accountability. |
| F-11 | Real-Time Reviewer Presence | Incorporated | Medium | Medium | Medium | Medium | v1.0 (Sprint 5) | Back-end lead | Prevents duplicate review effort. |
| F-12 | Typed Notification System | Incorporated | High | Medium | Medium | High | v1.0 (Sprint 5) | Full-stack developer | Drives user awareness and engagement. |
| F-13 | Student Personal Notes Workspace | Incorporated | Low | Low | Low | Medium | v1.0 (Sprint 8) | Front-end developer | Quality-of-life enhancement for students. |
| F-14 | Markdown Article Authoring and Publication | Incorporated | Medium | Medium | Low | High | v1.0 (Sprint 6) | Full-stack developer | Centralises entrepreneurial learning content. |
| F-15 | Banner Management | Incorporated | Medium | Low | Low | High | v1.0 (Sprint 6) | Front-end developer | Institutional communication channel. |
| F-16 | Entrepreneurial Guide Library | Incorporated | Medium | Low | Low | High | v1.0 (Sprint 6) | Front-end developer | Curated educational support. |
| F-17 | Sponsor Reels Discovery Feed | Incorporated | High | High | Medium | Medium | v1.0 (Sprint 7) | Front-end developer | Strategic differentiator versus competing platforms. |
| F-18 | Sponsor Assignment and Matchmaking | Incorporated | High | Medium | Medium | High | v1.0 (Sprint 7) | Back-end lead | Realises the academic-to-investor bridge. |
| F-19 | Supervisor Upgrade Request Workflow | Incorporated | Low | Low | Low | Medium | v1.0 (Sprint 8) | Full-stack developer | Reduces administrative load for routine promotions. |
| F-20 | Colleges and Departments Management | Incorporated | High | Low | Low | High | v1.0 (Sprint 2) | Full-stack developer | Reference data for many other features. |
| F-21 | Social Links Management | Incorporated | Low | Low | Low | High | v1.0 (Sprint 8) | Front-end developer | Minor brand-presence feature. |
| F-22 | Administrative Dashboards and Analytics | Incorporated | Medium | High | Medium | Medium | v1.0 (Sprint 8) | Full-stack developer | Enables data-driven incubator oversight. |
| F-23 | System-Wide Activity Log | Incorporated | High | Medium | Medium | High | v1.0 (Sprint 5) | Back-end lead | Required for institutional auditability. |
| F-24 | Clerk Webhook Synchronisation | Incorporated | High | Low | Medium | High | v1.0 (Sprint 1) | Back-end lead | Keeps Clerk and Convex strictly aligned. |
| F-25 | RTL Arabic Interface and Theming | Incorporated | High | Medium | Low | High | v1.0 (Sprint 1) | Front-end developer | Non-negotiable for the primary audience. |
| F-26 | Responsive Multi-Device Layout | Incorporated | High | Medium | Low | High | v1.0 (Sprint 1) | Front-end developer | Required by the multi-device profile of users. |
| F-27 | Public Marketing and Onboarding Pages | Incorporated | Medium | Low | Low | High | v1.0 (Sprint 6) | Front-end developer | First impression for unauthenticated visitors. |
| F-28 | Continuous Deployment Pipeline | Incorporated | Medium | Low | Low | High | v1.0 (Sprint 1) | DevOps role within the team | Foundation for every subsequent release. |

## A.1 Legend

| Column | Meaning |
|---|---|
| **Status** | *Proposed* — captured but not yet approved; *Approved* — accepted into scope but not yet built; *Incorporated* — implemented and integrated into the product. |
| **Benefit** | The expected end-user or institutional value (High / Medium / Low). |
| **Effort** | The development cost in person-time (High / Medium / Low). |
| **Risk** | The likelihood and impact of failure or rework (High / Medium / Low). |
| **Stability** | The expected resistance of the feature to requirement change over time (High / Medium / Low). |
| **Target Release** | The release in which the feature first appears in production. |
| **Assigned To** | The role within the development team that owns the feature. |
| **Reason** | The justification for the priority and the scheduling decision. |
