# ZUJ Incubator (حاضنة الزيتونة) — Software Requirements Specification (SRS)

*Prepared in the style of IEEE Std 830-1998. This document succeeds, and must be read together with, the ZUJ Incubator Vision Document. Every requirement below is traceable to a concrete artifact in the project repository (`convex/` functions, `src/app/` routes, `convex/schema.ts`).*

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements of **ZUJ Incubator (حاضنة الزيتونة)**, a centralized web-based incubation platform for Al-Zaytoonah University of Jordan. It is intended for the development team, the academic project supervisor, the university incubator office, and any quality-assurance party validating the delivered system. It refines the twenty-eight features (F-01 – F-28) introduced in the Vision Document into individually testable requirements.

## 1.2 Scope

ZUJ Incubator manages the full lifecycle of three categories of student submissions — entrepreneurial ideas, IT graduation projects, and university-level entrepreneurial projects — across four authenticated roles (student, supervisor, sponsor, administrator) plus an unauthenticated visitor class. The product delivers: authenticated multi-track application submission; a deterministic five-state review workflow with an immutable audit log; real-time reviewer presence and a typed notification system; PDF and video upload via Convex Storage; markdown articles, banners, and an entrepreneurial guide; an Instagram-style sponsor reels feed; administrative management of colleges, departments, social links, users, and a global activity log; and a fully right-to-left Arabic interface.

Out of scope: in-platform payments or disbursement, AI-based application scoring, native mobile applications, multi-university federation, offline/PWA capability, external notification channels (SMS/WhatsApp/push), and a public third-party API.

## 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| **Application** | A project submission record in the `applications` table belonging to one of three tracks. |
| **Track** | One of `entrepreneurial_idea`, `it_graduation`, `university_entrepreneurial`. |
| **State / Status** | One of `draft`, `under_review`, `needs_modification`, `accepted`, `rejected`. |
| **Review** | An immutable row in `applicationReviews` capturing one state transition. |
| **Presence** | A heartbeat row in `applicationPresence` indicating an active viewer of an application. |
| **Reels Feed** | The sponsor-facing vertical video feed of submitted projects. |
| **RBAC** | Role-Based Access Control — `student`, `supervisor`, `sponsor`, `admin`. |
| **Staff** | A caller whose role is `supervisor` or `admin` (the `requireSupervisor` policy). |
| **JWT** | JSON Web Token issued by Clerk and validated by Convex. |
| **OCC** | Optimistic Concurrency Control — Convex's default write-conflict strategy. |
| **BaaS** | Backend-as-a-Service (Convex, Clerk, Vercel). |
| **University email** | An address ending in `@zuj.edu.jo`, `@std-zuj.edu.jo`, or `@std.zuj.edu.jo`. |
| **FR / NFR** | Functional Requirement / Non-Functional Requirement. |
| **UAT** | User Acceptance Testing. |
| **RTL** | Right-to-Left text directionality. |

## 1.4 References

1. ZUJ Incubator — *Vision Document* (`docs/ZUJIncubatorVisionDocument.md`).
2. IEEE Std 830-1998 — *IEEE Recommended Practice for Software Requirements Specifications*.
3. Convex — *Convex Documentation*. https://docs.convex.dev
4. Clerk — *Clerk Authentication Documentation*. https://clerk.com/docs
5. Next.js — *Next.js App Router Documentation (v16)*. https://nextjs.org/docs
6. Convex — *Testing Convex Functions* (Vitest + `convex-test`). https://docs.convex.dev/functions/testing
7. W3C — *Web Content Accessibility Guidelines (WCAG) 2.1*.
8. Hashemite Kingdom of Jordan — *Personal Data Protection Law No. 24 of 2023*.
9. OWASP — *OWASP Top 10 (2021)*.

## 1.5 Overview

Section 2 gives the overall description: product perspective, a summary of functions, user classes, constraints, and assumptions. Section 3 contains the specific requirements: external interfaces, the full set of functional requirements grouped by module, the non-functional requirements, and the logical database model. Section 4 provides a traceability matrix linking Vision Document features to SRS requirements.

---

# 2. Overall Description

## 2.1 Product Perspective

ZUJ Incubator is a self-contained web product built on three Backend-as-a-Service providers. It is **not** embedded in any wider university information system.

- **Front end** — Next.js 16 (App Router, React 19) under `src/app/`, with feature modules under `src/features/` and shared UI under `src/components/`. Rendered RTL Arabic with the Tajawal typeface.
- **Back end** — Convex serverless functions under `convex/`, sharing a single TypeScript type system with the front end through `convex/_generated/`.
- **Identity** — Clerk, integrated via `@clerk/nextjs`, `ConvexProviderWithClerk`, and a signed webhook consumed at `convex/http.ts`.
- **Hosting** — Vercel, which runs `convex deploy --cmd 'next build'` so the front end and Convex backend deploy atomically.

```
Browser (RTL Arabic UI)
   │  Clerk JWT
   ▼
Next.js App Router (src/app) ──preloadQuery / useQuery──► Convex functions (convex/)
   │                                                          │
   ▼                                                          ▼
Clerk (auth, OTP, webhooks) ──svix-signed webhook──► convex/http.ts ──► users table
                                                          Convex DB (15 tables) + Convex Storage
```

## 2.2 Product Functions

At a high level the system shall:

1. Authenticate users through Clerk and restrict self-service registration to university email domains.
2. Provision and synchronise user records from Clerk lifecycle webhooks.
3. Enforce a four-role RBAC matrix at every sensitive Convex function.
4. Let students draft, edit, submit, and delete applications across three tracks.
5. Enforce a deterministic application state machine and record every transition immutably.
6. Let supervisors review, rate, annotate, and (singly or in bulk) transition applications.
7. Ingest PDF and video files into Convex Storage with server-enforced size caps and access-controlled retrieval.
8. Surface real-time reviewer presence and a typed notification inbox.
9. Provide markdown articles, three banner types, and a curated entrepreneurial guide.
10. Present a sponsor reels feed of submitted projects with video, and record sponsor interest/assignments.
11. Provide a student → supervisor self-upgrade request workflow with admin approval.
12. Let administrators manage colleges, departments, social links, users, and view analytics and a global activity log.
13. Provide a public landing page and Clerk-hosted authentication flows for visitors.

## 2.3 User Classes and Characteristics

| Class | Code | Authenticated | Characteristics |
|---|---|---|---|
| Administrator | `admin` | Yes | Highest privilege; manages institutional metadata, users, social links; views analytics and the activity log. |
| Supervisor | `supervisor` | Yes | Faculty; reviews applications, authors articles/banners/guide entries, sees presence. Inherits read access to most staff views. |
| Student | `student` | Yes | Default role on registration; drafts/submits applications, uploads media, keeps private notes, may request a supervisor upgrade. |
| Sponsor | `sponsor` | Yes | Provisioned by an administrator; browses the reels feed and expresses interest. |
| Guest / Visitor | — | No | Sees the public landing page and authentication routes only. |

## 2.4 Constraints

- **CN-1** The backend shall be implemented exclusively with Convex (`convex` ≥ 1.36) and consumed through `convex/_generated/`.
- **CN-2** Authentication shall be delegated to Clerk; no parallel identity store shall exist.
- **CN-3** The frontend shall be Next.js 16 (App Router) + React 19, TypeScript strict mode.
- **CN-4** All Convex functions shall declare argument validators (`v.*`); queries shall use `.withIndex()` rather than `.filter()` where an index exists; unbounded `.collect()` shall be avoided on large tables.
- **CN-5** Node-only code shall reside in files marked `"use node";` and be exposed only as Convex actions (e.g. `convex/users/adminActions.ts`).
- **CN-6** The user-facing language shall be Arabic with full RTL support.
- **CN-7** The system shall target evergreen browsers (latest two major versions of Chrome, Edge, Safari, Firefox).
- **CN-8** Deployment shall use the integrated Vercel + Convex pipeline.
- **CN-9** The project shall be delivered within a fifteen-week academic horizon.

## 2.5 Assumptions and Dependencies

- **AS-1** Users have continuous HTTPS internet access; there is no offline mode.
- **AS-2** Each self-registering user owns a unique Al-Zaytoonah email address, verified by Clerk's email-code (OTP) flow.
- **AS-3** Al-Zaytoonah University endorses the platform and seeds at least one `admin` user during onboarding.
- **AS-4** Sponsors are provisioned by an administrator, not by self-registration.
- **AS-5** Application files stay within the platform caps (10 MB PDF, 100 MB video).
- **AS-6** External dependencies pinned in `package.json` (Convex, Clerk, Next.js, HeroUI, Tailwind, etc.) remain API-compatible; a breaking change requires a dedicated update sprint.
- **AS-7** The Convex deployment has the `CLERK_JWT_ISSUER_DOMAIN` and `CLERK_WEBHOOK_SECRET` environment variables configured.

## 2.6 Apportioning of Requirements

Requirements priority follows MoSCoW: **M** (Must — required for the MVP), **S** (Should), **C** (Could). Out-of-scope items are recorded as **W** (Won't) in the Vision Document and are not specified here.

---

# 3. Specific Requirements

## 3.1 External Interface Requirements

### 3.1.1 User Interfaces

- **UI-1** All screens shall render right-to-left in Arabic, using the Tajawal typeface and Clerk's `arSA` localisation, configured in `src/app/layout.tsx`.
- **UI-2** The application shall expose role-segregated route trees under `src/app/`: public (`/`, `/login`, `/register`, `/forgot-password`, `/verify-email`), `/student/*`, `/supervisor/*`, `/admin/*`, `/sponsor/*`, plus `/login-redirect` and a development-only `/dev` page.
- **UI-3** The UI shall be responsive across mobile, tablet, and desktop breakpoints using Tailwind CSS v4 and HeroUI v3 components.
- **UI-4** A light/dark theme switch shall be provided via `next-themes`.
- **UI-5** Every user-visible error shall present a localised Arabic message.

### 3.1.2 Hardware Interfaces

- **HW-1** The system requires no specialised hardware. A camera/microphone is optional, used only to record a pitch video before upload.
- **HW-2** Minimum client: dual-core 2 GHz CPU (or mobile SoC), 4 GB RAM, a display ≥ 360 px wide.

### 3.1.3 Software Interfaces

- **SW-1 Convex** — database, queries/mutations/actions, real-time subscriptions, and file storage; accessed via the `convex/react` client and `convex/_generated/api`.
- **SW-2 Clerk** — sign-in/up UI, JWT issuance, email-code verification, and lifecycle webhooks (`user.created`, `user.updated`, `user.deleted`). JWTs are validated against the issuer configured in `convex/auth.config.ts`.
- **SW-3 svix** — verifies Clerk webhook signatures at the `POST /clerk-user-webhook` HTTP action in `convex/http.ts` before any database mutation.
- **SW-4 Vercel** — build and hosting; runs `convex deploy --cmd 'next build'`.
- **SW-5 Browser APIs** — Fetch, WebSocket, IntersectionObserver, the HTML5 `<video>` element, and CSS scroll-snap.

### 3.1.4 Communications Interfaces

- **CM-1** All traffic shall be served over HTTPS (TLS 1.2+).
- **CM-2** Real-time updates shall be delivered over the Convex WebSocket subscription channel.
- **CM-3** Inbound Clerk webhooks shall arrive as signed HTTP POST requests carrying `svix-id`, `svix-timestamp`, and `svix-signature` headers.

## 3.2 Functional Requirements

Each requirement names the implementing artifact. Unless stated otherwise, "rejects" means the Convex function throws and performs no write, and "the caller" is derived server-side from `ctx.auth.getUserIdentity()` — never from a client-supplied user id.

### 3.2.1 Authentication & Identity (Vision F-01, F-24)

- **FR-AUTH-1 (M)** The system shall delegate sign-in, sign-up, email-code verification, password recovery, and session management to Clerk. *(`src/app/(auth)/*`, `src/features/auth/*`)*
- **FR-AUTH-2 (M)** Self-service registration shall reject any email whose domain is not `@zuj.edu.jo`, `@std-zuj.edu.jo`, or `@std.zuj.edu.jo`, and shall require a 9-digit student/staff number. *(`src/features/auth/hooks/useRegisterForm.ts`)*
- **FR-AUTH-3 (M)** Registration shall complete only after Clerk email-code (OTP) verification of the address. *(`useRegisterForm.ts` — `prepareEmailAddressVerification` / `attemptEmailAddressVerification`)*
- **FR-AUTH-4 (M)** The system shall expose a Convex HTTP action at `POST /clerk-user-webhook` that verifies the `svix` signature and rejects unsigned or invalid payloads with HTTP 400. *(`convex/http.ts`)*
- **FR-AUTH-5 (M)** On a verified `user.created`/`user.updated` webhook, the system shall upsert the `users` row by `clerkId`: patch profile fields for an existing row, or insert a new row **only if the email is a university email**, with `role = "student"`. A non-university new identity shall be ignored. *(`convex/users.ts` — `handleClerkWebhook`)*
- **FR-AUTH-6 (M)** On a `user.deleted` webhook, the system shall set the matching `users` row's `isActive = false` (soft delete; the row is retained). *(`convex/users.ts`)*
- **FR-AUTH-7 (M)** Convex shall validate every request's Clerk JWT against the issuer in `convex/auth.config.ts`; the current user shall be resolved by matching `identity.subject` to `users.clerkId`. *(`convex/users.ts` — `getCurrentUser`; `convex/lib/auth.ts`)*
- **FR-AUTH-8 (M)** Middleware shall require authentication for all routes under `/student`, `/supervisor`, `/admin` (except `/admin/login`), `/sponsor` (except `/sponsor/login`), and `/login-redirect`. *(`src/middleware.ts`)*

### 3.2.2 Role-Based Access Control (Vision F-02)

- **FR-RBAC-1 (M)** The system shall recognise exactly four roles: `student`, `supervisor`, `admin`, `sponsor`. *(`convex/schema.ts`)*
- **FR-RBAC-2 (M)** `requireUser` shall reject any unauthenticated caller. *(`convex/lib/auth.ts`)*
- **FR-RBAC-3 (M)** `requireStudent` shall reject any caller whose role is not `student`.
- **FR-RBAC-4 (M)** `requireSupervisor` shall accept callers with role `supervisor` **or** `admin`, and reject all others.
- **FR-RBAC-5 (M)** `requireAdmin` shall accept only callers with role `admin`.
- **FR-RBAC-6 (M)** Every sensitive query, mutation, and action shall apply one of the above guards before any read of business data or any write. Cross-role escalation shall be impossible from the client.
- **FR-RBAC-7 (C)** Development-only mutations (`makeMeStudent`, `makeMeSupervisor`, `makeMeAdmin`) shall throw when `NODE_ENV === "production"`. *(`convex/users/dev.ts`)*

### 3.2.3 User Profile Management (Vision F-03)

- **FR-PROF-1 (M)** Any authenticated user shall be able to read their own user record. *(`convex/users/shared.ts` — `currentUser`)*
- **FR-PROF-2 (M)** Any authenticated user shall be able to update their own `name`, `phone`, `college`, `department`, `studentId`, `linkedinUrl`, and `avatar`. *(`updateProfile`)*
- **FR-PROF-3 (M)** Updating the avatar shall delete the previously stored avatar file from Convex Storage. *(`updateProfile`)*
- **FR-PROF-4 (M)** Authenticated users shall obtain an upload URL for an avatar and retrieve a signed avatar URL. *(`generateAvatarUploadUrl`, `getAvatarUrl`)*
- **FR-PROF-5 (M)** Only an administrator shall create staff/sponsor users: `createUserByAdmin` inserts a `users` row (role `supervisor` or `sponsor`) and rejects a duplicate email; `createSupervisor`/`createSponsor` actions additionally create the Clerk account. *(`convex/users/admin.ts`, `convex/users/adminActions.ts`)*
- **FR-PROF-6 (M)** Only an administrator shall toggle a user's `isActive` flag, and the action shall be recorded in the activity log. *(`toggleUserActive`)*

### 3.2.4 Application Submission, Drafting & Editing (Vision F-04, F-05)

- **FR-APP-1 (M)** Only a `student` shall create an application; it shall belong to exactly one track (`entrepreneurial_idea`, `it_graduation`, `university_entrepreneurial`). *(`convex/applications/student.ts` — `createApplication`)*
- **FR-APP-2 (M)** On creation the application status shall be `draft`, unless `submitNow` is true, in which case it shall be `under_review` with `submittedAt` set and all supervisors/admins notified (`new_application`). *(`createApplication`)*
- **FR-APP-3 (M)** The system shall enforce per-field maximum lengths (e.g. `projectName` ≤ 120, `description` ≤ 3000, `problemStatement` ≤ 2000) on create and update. *(`convex/lib/validation.ts` — `FIELD_LIMITS`, `assertMaxLength`)*
- **FR-APP-4 (M)** A student shall edit an application **only** while its status is `draft` or `needs_modification`, and **only** if they own it; any other state or owner shall be rejected. *(`updateApplication`)*
- **FR-APP-5 (M)** A student shall submit an application (`draft` or `needs_modification` → `under_review`) only for an application they own; submission shall set `submittedAt` and notify all supervisors/admins, distinguishing first submission from resubmission. *(`submitApplication`)*
- **FR-APP-6 (M)** A student shall delete an application **only** while its status is `draft` or `rejected`, and **only** if they own it. *(`deleteApplication`)*
- **FR-APP-7 (M)** A student shall list their own applications, paginated and newest-first. *(`myApplications`)*
- **FR-APP-8 (M)** `getApplication` shall return an application to its owning student, to any staff member, and to a sponsor only when status ≠ `draft`; otherwise it shall return `null`. *(`convex/applications/shared.ts`)*

### 3.2.5 Review, State Machine & Audit Log (Vision F-06, F-09, F-10)

- **FR-REV-1 (M)** The application state machine shall permit exactly these transitions: `draft → under_review`; `needs_modification → under_review`; `under_review → {needs_modification, accepted, rejected}`. `accepted` and `rejected` shall be terminal. *(`convex/lib/statuses.ts` — `ALLOWED_TRANSITIONS`, `canTransition`)*
- **FR-REV-2 (M)** Only a staff member (`requireSupervisor`) shall change an application's status; any other caller shall be rejected. *(`convex/applications/supervisor.ts` — `updateApplicationStatus`)*
- **FR-REV-3 (M)** A status change to a state not permitted by FR-REV-1 shall be rejected with a localised message and no write. *(`updateApplicationStatus`)*
- **FR-REV-4 (M)** A successful status change shall (a) patch the application's `status`, `reviewerId`, `reviewedAt`, and optional `supervisorNotes`/`supervisorRating`; (b) insert an immutable `applicationReviews` row recording `fromStatus`, `toStatus`, `reviewerId`, optional `notes`/`rating`, and `createdAt`; and (c) insert a `status_change` notification to the owning student. *(`updateApplicationStatus`)*
- **FR-REV-5 (M)** A supervisor rating shall be one of `excellent`, `good`, `average`, `poor`. *(`convex/schema.ts`)*
- **FR-REV-6 (M)** `applicationReviews` rows shall never be updated or deleted by any function — the table is append-only. *(audit-log invariant; verified in `convex/incubator.test.ts`)*
- **FR-REV-7 (S)** A staff member shall perform a bulk status change over up to 100 application ids; ineligible ids (missing, or an illegal transition) shall be skipped and reported, eligible ids processed identically to FR-REV-4. *(`bulkUpdateStatus`)*
- **FR-REV-8 (M)** Staff shall list applications (optionally filtered by `status` and/or `type`, excluding `draft`), paginated, and a variant joined with student name/department. *(`listApplications`, `listApplicationsWithStudent`, `applicationsByStatus`)*
- **FR-REV-9 (M)** The review history of an application shall be readable by the owning student and by any staff member, ordered newest-first, with reviewer names resolved. *(`getReviewHistory`)*
- **FR-REV-10 (S)** Staff shall retrieve a recent-activity list and the set of student departments for filter facets. *(`recentActivity`, `filterFacets`)*

### 3.2.6 File Upload, Storage & Retrieval (Vision F-07, F-08)

- **FR-FILE-1 (M)** Any authenticated user shall obtain a one-time Convex Storage upload URL. *(`convex/files.ts` — `generateUploadUrl`)*
- **FR-FILE-2 (M)** When a PDF or video storage id is attached to an application (on create or update), the system shall reject the operation if the stored file exceeds its cap — **10 MB for PDFs, 100 MB for videos** — verified server-side from the storage metadata. *(`convex/lib/validation.ts` — `assertFileWithinLimit`; called from `createApplication` and `updateApplication`)*
- **FR-FILE-3 (M)** The client upload control shall additionally enforce the same caps and restrict file types (PDF; `mp4`/`mov`/`avi`/`webm`) before upload. *(`src/features/applications/hooks/useFileUpload.ts`)*
- **FR-FILE-4 (M)** A signed file URL for an application's PDF or video shall be returned only to: the owning student, any staff member, or a sponsor when the application status ≠ `draft`. The requested storage id must belong to the named application. All other cases return `null`. *(`convex/files.ts` — `getFileUrl`)*
- **FR-FILE-5 (M)** Pitch videos shall be played back through the native HTML5 `<video>` element; PDF business plans shall be previewed in-browser via `react-pdf`. *(`src/components/PdfViewer.tsx`, `src/app/sponsor/(dashboard)/page.tsx`)*

### 3.2.7 Real-Time Presence (Vision F-11)

- **FR-PRES-1 (S)** An authenticated user viewing an application shall upsert a heartbeat row in `applicationPresence` (`joinPresence`) and shall remove it on leave (`leavePresence`). *(`convex/presence.ts`)*
- **FR-PRES-2 (S)** `getPresence` shall return the other users (excluding the caller) whose heartbeat is within the last 30 seconds, with name and role resolved.
- **FR-PRES-3 (S)** Heartbeat rows older than 60 seconds shall be lazily evicted on the next `joinPresence` call; no scheduled job is required.

### 3.2.8 Notifications (Vision F-12)

- **FR-NOTIF-1 (M)** The system shall store typed notifications with `type ∈ { status_change, new_note, new_application, assignment, announcement, system, upgrade_request }`. *(`convex/schema.ts`)*
- **FR-NOTIF-2 (M)** A user shall read their own notifications, newest-first, limited to the most recent 50. *(`convex/notifications.ts` — `myNotifications`)*
- **FR-NOTIF-3 (M)** A user shall read their own unread-notification count. *(`unreadCount`)*
- **FR-NOTIF-4 (M)** A user shall mark one of their own notifications, or all of them, as read; marking another user's notification shall be rejected. *(`markAsRead`, `markAllAsRead`)*
- **FR-NOTIF-5 (M)** Submitting an application shall fan out a `new_application` notification to all supervisors and admins; a status change shall notify the owning student; an upgrade request shall notify all admins; a new scrolling student/all banner shall fan out an `announcement` to all students. *(`convex/lib/notifications.ts`, `convex/applications/*`, `convex/banners.ts`, `convex/supervisorUpgradeRequests.ts`)*

### 3.2.9 Student Personal Notes (Vision F-13)

- **FR-NOTE-1 (C)** Each authenticated user shall maintain a single private free-text note, isolated to its owner. *(`convex/studentNotes.ts` — `saveNote`, `getMyNote`)*
- **FR-NOTE-2 (C)** Saving a note shall upsert the single row keyed by `userId`.

### 3.2.10 Articles (Vision F-14)

- **FR-ART-1 (S)** Only a staff member shall create, update, publish/unpublish, or delete an article. *(`convex/articles.ts`)*
- **FR-ART-2 (S)** An article shall carry a markdown `body`, optional `summary`, optional `tags`, an optional cover image, an `audience ∈ { student, supervisor, all }`, and an `isPublished` flag.
- **FR-ART-3 (S)** A non-staff (student) caller shall read only published articles whose audience is `student` or `all`; `getById` shall return `null` for an unpublished or audience-mismatched article to a student. *(`getById`, `listPublished`)*
- **FR-ART-4 (S)** Staff shall list all articles regardless of state. *(`listAll`)*
- **FR-ART-5 (S)** Replacing or deleting an article cover shall delete the superseded image from Convex Storage. *(`updateArticle`, `deleteArticle`)*
- **FR-ART-6 (S)** Article bodies shall be rendered with `react-markdown` + `remark-gfm`. *(`src/features/articles/*`)*

### 3.2.11 Banners (Vision F-15)

- **FR-BAN-1 (S)** Only a staff member shall create, update, toggle, or delete a banner. *(`convex/banners.ts`)*
- **FR-BAN-2 (S)** A banner shall carry a `variant ∈ { info, success, warning }`, an `audience ∈ { student, supervisor, landing, all }`, a `bannerType ∈ { text, scrolling, hero }`, an `isActive` flag, an optional `expiresAt`, and optional media (`mediaType`, `storageId`).
- **FR-BAN-3 (S)** `listActive` shall return active, non-expired, non-`scrolling` banners for the requested audience plus `all`; `listActiveScrolling` shall return only active, non-expired `scrolling` banners. *(`listActive`, `listActiveScrolling`)*
- **FR-BAN-4 (S)** Creating an active `scrolling` banner targeted at `student` or `all` shall notify all students with an `announcement` (excluding the author). *(`createBanner`)*
- **FR-BAN-5 (S)** Replacing or deleting a banner's media shall delete the superseded file from Convex Storage. *(`updateBanner`, `deleteBanner`)*

### 3.2.12 Entrepreneurial Guide (Vision F-16)

- **FR-GUIDE-1 (S)** Only a staff member shall create, update, or delete a guide entry; each entry has a `title`, a `type ∈ { video, course, link }`, and a `url`. *(`convex/entrepreneurialGuide.ts`)*
- **FR-GUIDE-2 (S)** Any authenticated user shall list guide entries (newest-first, up to 100). *(`list`)*
- **FR-GUIDE-3 (S)** Every create/update/delete of a guide entry shall append an `activityLogs` record. *(`entrepreneurialGuide.ts`)*

### 3.2.13 Sponsor Reels Feed & Assignments (Vision F-17, F-18)

- **FR-SPON-1 (M)** A sponsor's reels feed shall return applications whose status is `under_review`, `needs_modification`, or `accepted` **and** that have a video, each with a signed video URL and the sponsor's own "interested" flag, sorted newest-submitted-first. *(`convex/applications/sponsor.ts` — `mySponsoredApplications`)*
- **FR-SPON-2 (M)** A sponsor shall toggle their "interested" flag on an application; the first toggle shall lazily create a `sponsorAssignments` row (no prior admin assignment required). *(`toggleSponsorInterest`)*
- **FR-SPON-3 (M)** Only an administrator shall explicitly assign a sponsor to an application (`assignSponsor`, rejecting a duplicate pair) or remove an assignment (`removeSponsorAssignment`).
- **FR-SPON-4 (M)** Staff shall list sponsor assignments, optionally filtered by sponsor. *(`getSponsorAssignments`)*
- **FR-SPON-5 (M)** A sponsor shall read their own assignment record for a given application. *(`getAssignmentByProject`)*
- **FR-SPON-6 (M)** The reels feed shall be presented as a CSS scroll-snap vertical feed. *(`src/app/sponsor/(dashboard)/page.tsx`)*

### 3.2.14 Supervisor Upgrade Requests (Vision F-19)

- **FR-UPG-1 (C)** Only a `student` whose email ends with `@zuj.edu.jo` shall submit a supervisor-upgrade request; a student with a pending request shall be rejected from submitting another. *(`convex/supervisorUpgradeRequests.ts` — `submitRequest`)*
- **FR-UPG-2 (C)** Submitting a request shall notify all administrators (`upgrade_request`).
- **FR-UPG-3 (C)** A student shall read their own most-recent request. *(`getMyRequest`)*
- **FR-UPG-4 (C)** Only an administrator shall list requests (optionally filtered by status) and approve/reject a pending request; deciding an already-decided request shall be rejected. *(`listRequests`, `reviewRequest`)*
- **FR-UPG-5 (C)** Approving a request shall set the student's `role` to `supervisor`, notify the student, and append an `activityLogs` record. *(`reviewRequest`)*

### 3.2.15 Colleges & Departments (Vision F-20)

- **FR-ORG-1 (M)** Any caller shall list colleges, colleges-with-departments, and departments by college. *(`convex/colleges.ts` — `list`, `listWithDepartments`, `getDepartmentsByCollege`)*
- **FR-ORG-2 (M)** Only an administrator shall create, rename, or delete a college, or add, rename, or delete a department.
- **FR-ORG-3 (M)** Deleting a college shall first delete all of its departments (cascade). *(`remove`)*
- **FR-ORG-4 (M)** Only an administrator shall run the one-time seed of default colleges/departments; the seed shall be rejected if any college already exists. *(`seed`)*

### 3.2.16 Social Links (Vision F-21)

- **FR-SOC-1 (C)** Any caller shall list active social links, sorted by `order` then recency. *(`convex/socialLinks.ts` — `listActive`)*
- **FR-SOC-2 (C)** Only an administrator shall list all, create, update, delete, or toggle a social link.
- **FR-SOC-3 (C)** A link `url` shall be normalised and validated (must be `http(s):`, `mailto:`, `tel:`, or a bare domain auto-prefixed with `https://`), capped at 500 characters; the platform name is normalised and capped at 40 characters; the label is capped at 60 characters. *(`normalizeUrl`, `normalizePlatform`)*

### 3.2.17 Administrative Dashboards & Activity Log (Vision F-22, F-23)

- **FR-ADMIN-1 (S)** Only an administrator shall read aggregate analytics: counts by role, application counts by status, student distribution by college, monthly registration counts (trailing 12 months), and application-status statistics. *(`convex/users/admin.ts` — `getAdminStats`, `getStudentDistributionByCollege`, `getMonthlyRegistrationStats`, `getApplicationStatusStats`)*
- **FR-ADMIN-2 (S)** Only an administrator shall list users (optionally by role), students with per-student application counts and filters, and supervisors with search. *(`getAllUsers`, `getStudentsWithStats`, `getSupervisorsManagement`)*
- **FR-ADMIN-3 (M)** The system shall append an immutable `activityLogs` record for consequential administrative actions (user activation toggle, upgrade-request decisions, guide changes, …), each recording actor id/name/role, action text, entity type/id, and timestamp. *(`convex/activityLogs.ts` — `log`)*
- **FR-ADMIN-4 (M)** Only an administrator shall read the activity log, newest-first, with a configurable limit (default 20). *(`recentLogs`)*
- **FR-ADMIN-5 (M)** `activityLogs` rows shall never be updated or deleted by any function — the table is append-only.
- **FR-ADMIN-6 (S)** Analytics shall be visualised with `recharts`; tabular management shall use `@tanstack/react-table`. *(`src/features/admin/*`, `src/components/charts/*`)*

### 3.2.18 Public Pages & Deployment (Vision F-25 – F-28)

- **FR-PUB-1 (S)** Unauthenticated visitors shall see a public landing page and be routed to Clerk-hosted sign-in/sign-up via `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. *(`src/features/landing/*`)*
- **FR-PUB-2 (M)** Every push to the production branch shall trigger `convex deploy --cmd 'next build'` on Vercel, deploying the front end and Convex backend atomically. *(`package.json` — `build` script)*

## 3.3 Non-Functional Requirements

### 3.3.1 Performance

- **NFR-PERF-1** Initial Time-to-Interactive shall be ≤ 3.0 s on desktop broadband and ≤ 5.0 s on simulated 4G.
- **NFR-PERF-2** Indexed Convex read latency shall be ≤ 150 ms (P50) and ≤ 500 ms (P95) under normal load.
- **NFR-PERF-3** State-machine and review-write mutations shall complete within ≤ 800 ms round-trip (P95).
- **NFR-PERF-4** A real-time event (notification, presence, status change) shall reach a subscribed client within ≤ 1.0 s.
- **NFR-PERF-5** The sponsor reels feed shall scroll smoothly (target 60 fps) on a mid-range mobile device.
- **NFR-PERF-6** Convex queries shall use `.withIndex()` rather than `.filter()` wherever an index exists, and shall avoid unbounded `.collect()` on hot paths (use `.take(n)` or pagination).

### 3.3.2 Security

- **NFR-SEC-1** 100 % of non-public Convex functions shall reject anonymous or invalid Clerk JWTs.
- **NFR-SEC-2** 0 % of cross-role privilege escalations shall succeed; the RBAC guards (§3.2.2) shall be the single enforcement point, exercised by the automated suite in `convex/incubator.test.ts`.
- **NFR-SEC-3** The caller's identity and role shall always be derived server-side from `ctx.auth.getUserIdentity()`; a user id shall never be trusted as a function argument for authorisation.
- **NFR-SEC-4** 100 % of Clerk webhooks shall be `svix`-signature-verified before any database write.
- **NFR-SEC-5** 100 % of Convex functions shall declare argument validators (`v.*`).
- **NFR-SEC-6** File access shall be authorised per-request (FR-FILE-4); upload size caps shall be enforced server-side (FR-FILE-2).
- **NFR-SEC-7** Self-service account creation shall be confined to verified university email domains, enforced both in the registration form and in the Convex webhook.
- **NFR-SEC-8** All traffic shall be HTTPS (TLS 1.2+). The system shall not be vulnerable to any OWASP Top 10 (2021) item at go-live.
- **NFR-SEC-9** Personal data shall be processed in accordance with Jordanian PDPL No. 24 of 2023.

### 3.3.3 Reliability & Availability

- **NFR-REL-1** Monthly availability shall be ≥ 99.5 %, inheriting the SLAs of Convex, Clerk, and Vercel.
- **NFR-REL-2** No record in `applications`, `applicationReviews`, or `activityLogs` shall be lost under normal operation; recovery relies on Convex point-in-time snapshots.
- **NFR-REL-3** 100 % of legal state transitions shall produce a corresponding `applicationReviews` row (audit-log completeness invariant).
- **NFR-REL-4** Concurrent supervisor writes shall be safe under Convex OCC; conflicting transactions retry transparently.

### 3.3.4 Usability

- **NFR-USE-1** The entire UI shall render correctly RTL in Arabic across the 1280/1024/768/375 px breakpoints with no LTR regressions.
- **NFR-USE-2** The platform shall conform to WCAG 2.1 Level AA for colour contrast, keyboard navigation, and screen-reader labelling on all critical paths.
- **NFR-USE-3** A first-time student shall be able to locate and begin a new application within ≤ 90 seconds of authenticated landing.
- **NFR-USE-4** Every user-visible error shall present a localised Arabic message and a recovery action.

### 3.3.5 Scalability & Maintainability

- **NFR-SCALE-1** The system shall sustain ≥ 500 concurrent authenticated users without measurable P95 degradation.
- **NFR-SCALE-2** The data model shall accommodate ≥ 20,000 users and ≥ 5,000 applications per academic year without schema change.
- **NFR-SCALE-3** All horizontal scaling shall be delegated to Convex, Clerk, and Vercel; the application layer shall be stateless.
- **NFR-MAINT-1** All source shall be TypeScript in strict mode; ESLint (with `@convex-dev/eslint-plugin`) shall pass in CI.
- **NFR-MAINT-2** Backend behaviour shall be covered by an automated Vitest + `convex-test` suite running in the `edge-runtime` environment (`convex/incubator.test.ts`), exercising the RBAC matrix, the state machine, the immutable review log, and the upload-size and university-email guards.

## 3.4 Logical Database Requirements

The Convex schema (`convex/schema.ts`) shall define the following **fifteen** tables. Convex automatically adds `_id` and `_creationTime` to every row.

| # | Table | Key fields | Indexes |
|---|---|---|---|
| 1 | `users` | `clerkId`, `email`, `name?`, `role?` (`student`/`supervisor`/`admin`/`sponsor`), `studentId?`, `college?`, `department?`, `phone?`, `avatar?`, `linkedinUrl?`, `isActive?`, timestamps | `by_clerkId`, `email`, `phone`, `by_role`, `by_studentId` |
| 2 | `applications` | `studentId`, `type`, `status`, core form fields, track-specific fields, `pdfFileId?`, `videoFileId?`, `reviewerId?`, `supervisorNotes?`, `supervisorRating?`, `reviewedAt?`, timestamps, `submittedAt?` | `by_student`, `by_status`, `by_type`, `by_reviewer`, `by_student_status`, `by_type_status` |
| 3 | `applicationReviews` | `applicationId`, `reviewerId`, `fromStatus`, `toStatus`, `notes?`, `rating?`, `createdAt` — **append-only** | `by_application`, `by_reviewer` |
| 4 | `applicationPresence` | `applicationId`, `userId`, `lastSeenAt` | `by_application`, `by_user_application` |
| 5 | `socialLinks` | `platform`, `url`, `label?`, `isActive`, `order`, `updatedAt`, `updatedBy` | `by_active`, `by_order` |
| 6 | `banners` | `title`, `message`, `variant`, `audience`, `bannerType?`, `mediaType?`, `storageId?`, `isActive`, `linkHref?`, `linkLabel?`, `imageUrl?`, `expiresAt?`, timestamps, `createdBy` | `by_active`, `by_audience_active`, `by_type_active` |
| 7 | `notifications` | `userId`, `title`, `message`, `type`, `applicationId?`, `read`, `createdAt` | `by_user`, `by_user_read`, `by_user_created` |
| 8 | `sponsorAssignments` | `sponsorId`, `applicationId`, `assignedBy`, `notes?`, `isInterested?`, `createdAt` | `by_sponsor`, `by_application`, `by_sponsor_application` |
| 9 | `studentNotes` | `userId`, `content`, `updatedAt` | `by_user` |
| 10 | `entrepreneurialGuide` | `title`, `type` (`video`/`course`/`link`), `url`, `createdBy`, timestamps | `by_type`, `by_createdAt` |
| 11 | `colleges` | `name`, `createdAt` | — |
| 12 | `departments` | `name`, `collegeId`, `createdAt` | `by_college` |
| 13 | `supervisorUpgradeRequests` | `studentId`, `status` (`pending`/`approved`/`rejected`), `reviewedBy?`, timestamps | `by_student`, `by_status` |
| 14 | `activityLogs` | `actorId`, `actorName`, `actorRole`, `action`, `entityType`, `entityId?`, `createdAt` — **append-only** | `by_created` |
| 15 | `articles` | `title`, `summary?`, `body`, `coverStorageId?`, `tags?`, `audience`, `isPublished`, `createdBy`, timestamps | `by_published`, `by_audience_published`, `by_author` |

- **DB-1** Application content files (PDF, video) and image media shall be persisted in **Convex Storage** and referenced by `Id<"_storage">`; they shall not be stored as table fields.
- **DB-2** Referential fields (`studentId`, `reviewerId`, `collegeId`, …) shall be typed Convex document ids; cascade behaviour shall be implemented in mutations (e.g. FR-ORG-3).
- **DB-3** Timestamps shall be stored as Unix-epoch milliseconds (UTC) and rendered in the user's local time zone.

## 3.5 Design Constraints

- **DC-1** No bespoke REST or GraphQL layer shall be introduced; the typed Convex function API is the sole application contract.
- **DC-2** UI components shall be built with HeroUI v3 and Tailwind CSS v4; bespoke components are permitted only where HeroUI lacks an equivalent.
- **DC-3** Environment configuration shall be supplied through the variables in `.env.example`: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `CLERK_JWT_ISSUER_DOMAIN`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`.
- **DC-4** The first `admin` user shall be seeded manually; the system cannot bootstrap an administrator on its own.

---

# 4. Appendix A — Requirements Traceability Matrix

Each Vision Document feature maps to one or more SRS requirement groups.

| Vision Feature | SRS Requirements |
|---|---|
| F-01 Authentication & Identity | FR-AUTH-1 – FR-AUTH-8 |
| F-02 Role-Based Access Control | FR-RBAC-1 – FR-RBAC-7, NFR-SEC-1 – NFR-SEC-3 |
| F-03 User Profile Management | FR-PROF-1 – FR-PROF-6 |
| F-04 Multi-Track Application Submission | FR-APP-1 – FR-APP-3, FR-APP-8 |
| F-05 Application Drafting & Editing | FR-APP-4 – FR-APP-7 |
| F-06 Application Lifecycle State Machine | FR-REV-1 – FR-REV-3 |
| F-07 PDF Upload & Preview | FR-FILE-1 – FR-FILE-5 |
| F-08 Video Pitch Upload & Preview | FR-FILE-1 – FR-FILE-5 |
| F-09 Supervisor Review, Rating, Notes | FR-REV-2, FR-REV-4, FR-REV-5, FR-REV-7, FR-REV-8 |
| F-10 Immutable Review Audit Log | FR-REV-4, FR-REV-6, FR-REV-9, NFR-REL-3 |
| F-11 Real-Time Reviewer Presence | FR-PRES-1 – FR-PRES-3 |
| F-12 Typed Notification System | FR-NOTIF-1 – FR-NOTIF-5 |
| F-13 Student Personal Notes | FR-NOTE-1 – FR-NOTE-2 |
| F-14 Markdown Articles | FR-ART-1 – FR-ART-6 |
| F-15 Banner Management | FR-BAN-1 – FR-BAN-5 |
| F-16 Entrepreneurial Guide | FR-GUIDE-1 – FR-GUIDE-3 |
| F-17 Sponsor Reels Feed | FR-SPON-1, FR-SPON-6 |
| F-18 Sponsor Assignment & Matchmaking | FR-SPON-2 – FR-SPON-5 |
| F-19 Supervisor Upgrade Request | FR-UPG-1 – FR-UPG-5 |
| F-20 Colleges & Departments | FR-ORG-1 – FR-ORG-4 |
| F-21 Social Links Management | FR-SOC-1 – FR-SOC-3 |
| F-22 Administrative Dashboards | FR-ADMIN-1, FR-ADMIN-2, FR-ADMIN-6 |
| F-23 System-Wide Activity Log | FR-ADMIN-3 – FR-ADMIN-5 |
| F-24 Clerk Webhook Synchronisation | FR-AUTH-4 – FR-AUTH-6 |
| F-25 RTL Arabic Interface & Theming | UI-1, UI-4, NFR-USE-1 |
| F-26 Responsive Multi-Device Layout | UI-3, NFR-USE-1 |
| F-27 Public Marketing & Onboarding | FR-PUB-1 |
| F-28 Continuous Deployment Pipeline | FR-PUB-2 |

# Appendix B — Analysis Models

- **State model.** The application lifecycle is the authoritative state machine of §3.2.5 / FR-REV-1: `draft → under_review`; `needs_modification → under_review`; `under_review → {needs_modification | accepted | rejected}`; `accepted` and `rejected` are terminal. The implementation is `ALLOWED_TRANSITIONS` in `convex/lib/statuses.ts`.
- **Data model.** The entity model is the fifteen-table schema of §3.4, with relationships expressed as Convex document-id references and access patterns expressed as the listed indexes.
- **Role model.** The RBAC lattice of §3.2.2: `requireUser` ⊃ {`requireStudent`, `requireSupervisor`, `requireAdmin`}, where `requireSupervisor` admits both `supervisor` and `admin`.

# Appendix C — Outstanding Items / Future Work

The following are explicitly **not** yet implemented and are recorded to bound expectations:

- End-to-end (browser) test automation (e.g. Playwright/Cypress) — only backend `convex-test` coverage exists today.
- A public sponsor self-application form — sponsors are currently provisioned by an administrator only.
- Server-side video transcoding / a dedicated streaming provider — videos are stored raw in Convex Storage and played via the native `<video>` element.
- The dependencies `framer-motion` and `react-player` are pinned in `package.json` but not currently wired into the UI.
