# ZUJ Incubator (حاضنة الزيتونة) — Software Design Document (SDD)

*This document describes **how** ZUJ Incubator is built internally. It complements the Vision Document (the "why") and the SRS (the "what"). Every component, table, and interaction described here corresponds to a concrete artifact in the repository.*

---

# 1. Introduction

## 1.1 Purpose

The SDD translates the requirements in `docs/ZUJIncubatorSRS.md` into an architectural and detailed design: the component structure, the data model and its relationships, the module decomposition, and the runtime behaviour of the principal use cases. It is intended for the development team and for the academic reviewer assessing the internal design.

## 1.2 Scope

The design covers the full stack: the Next.js 16 App Router front end (`src/`), the Convex serverless back end (`convex/`), the Clerk identity integration, Convex Storage for files, and the Vercel deployment pipeline.

## 1.3 References

1. `docs/ZUJIncubatorVisionDocument.md` — Vision Document.
2. `docs/ZUJIncubatorSRS.md` — Software Requirements Specification.
3. `convex/schema.ts` — the authoritative data model.
4. Convex documentation — https://docs.convex.dev

---

# 2. Architectural Design

## 2.1 Architectural Style

ZUJ Incubator follows a **client–serverless** architecture with a **single shared type system**. There is no hand-written API layer: the Next.js front end calls Convex functions directly through the generated, fully-typed `convex/_generated/api`, which eliminates contract drift between front end and back end. The back end is **reactive** — queries are live subscriptions, so any mutation that changes queried data pushes an update to every subscribed client.

Cross-cutting concerns are factored into shared modules:

- **Authorisation** — `convex/lib/auth.ts` (`requireUser`, `requireStudent`, `requireSupervisor`, `requireAdmin`).
- **Domain rules** — `convex/lib/statuses.ts` (the application state machine), `convex/lib/validation.ts` (field-length, file-size, and university-email guards).
- **Fan-out** — `convex/lib/notifications.ts` (notify-all helpers).
- **Read helpers** — `convex/lib/users.ts` (batch user lookups).

## 2.2 Component Diagram

```mermaid
flowchart TD
  subgraph Client["Browser — RTL Arabic UI"]
    UI["Next.js 16 App Router<br/>src/app/* routes"]
    FE["Feature modules<br/>src/features/*"]
    CMP["Shared UI + hooks<br/>src/components, src/hooks"]
  end

  subgraph Edge["Next.js Edge / Middleware"]
    MW["src/middleware.ts<br/>Clerk route protection"]
  end

  subgraph Convex["Convex Cloud (serverless backend)"]
    QM["Queries / Mutations / Actions<br/>convex/*"]
    LIB["Shared libs<br/>convex/lib/* (auth, statuses, validation, notifications)"]
    HTTP["HTTP action<br/>convex/http.ts (/clerk-user-webhook)"]
    DB[("Convex DB<br/>15 tables")]
    STORE[("Convex Storage<br/>PDF / video / images")]
  end

  subgraph External["External BaaS"]
    CLERK["Clerk<br/>auth, OTP, webhooks"]
    VERCEL["Vercel<br/>build + hosting"]
  end

  UI --> FE --> CMP
  UI -- "useQuery / useMutation (typed api)" --> QM
  UI -- "ConvexProviderWithClerk (JWT)" --> CLERK
  MW -- "auth.protect()" --> CLERK
  CLERK -- "svix-signed webhook" --> HTTP
  HTTP --> QM
  QM --> LIB
  QM --> DB
  QM --> STORE
  CLERK -. "JWT validated via auth.config.ts" .-> QM
  VERCEL -- "convex deploy --cmd 'next build'" --> Convex
  VERCEL --- Client
```

## 2.3 Layered View

| Layer | Location | Responsibility |
|---|---|---|
| Presentation | `src/app/`, `src/components/` | RTL Arabic routes, layouts, shared HeroUI-based components, theming. |
| Feature logic | `src/features/*` | Per-domain components and React hooks (auth, applications, articles, banners, admin, …). |
| Client data access | `convex/react` + `convex/_generated/api` | `useQuery` / `useMutation` bindings; `preloadQuery` for server components. |
| Route protection | `src/middleware.ts` | Clerk middleware gating `/student`, `/supervisor`, `/admin`, `/sponsor`, `/login-redirect`. |
| API surface | `convex/*.ts`, `convex/**/  *.ts` | Public queries/mutations/actions and internal functions. |
| Domain / cross-cutting | `convex/lib/*` | Authorisation, the state machine, validation, notification fan-out. |
| Persistence | `convex/schema.ts` + Convex DB | 15 indexed tables. |
| Files | Convex Storage | PDF business plans, pitch videos, banner/article/avatar images. |
| Identity | Clerk + `convex/auth.config.ts` + `convex/http.ts` | JWT issuance/validation, OTP, lifecycle webhooks. |

## 2.4 Technology Stack

Next.js 16.2 (App Router, React 19), TypeScript 5.9 (strict), Convex 1.36, Clerk (`@clerk/nextjs` 6.39), HeroUI 3 + Tailwind CSS 4, `react-pdf` (PDF preview), `react-markdown` + `remark-gfm` (articles), `recharts` + `@tanstack/react-table` (admin), `react-dropzone` (uploads), `svix` (webhook verification), Vitest + `convex-test` (tests). Hosting on Vercel.

---

# 3. Data Design

## 3.1 Entity-Relationship Diagram

The schema (`convex/schema.ts`) defines fifteen tables. Convex adds `_id` and `_creationTime` to every row. Relationships are expressed as Convex document-id references.

```mermaid
erDiagram
  users ||--o{ applications : "submits (studentId)"
  users |o--o{ applications : "reviews (reviewerId)"
  applications ||--o{ applicationReviews : "has history"
  users ||--o{ applicationReviews : "authors (reviewerId)"
  applications ||--o{ applicationPresence : "viewed in"
  users ||--o{ applicationPresence : "is viewer"
  users ||--o{ notifications : "receives"
  applications |o--o{ notifications : "referenced by"
  users ||--o{ sponsorAssignments : "sponsor (sponsorId)"
  applications ||--o{ sponsorAssignments : "is target"
  users ||--o{ sponsorAssignments : "assigned by"
  users ||--|| studentNotes : "owns one"
  users ||--o{ entrepreneurialGuide : "creates"
  users ||--o{ articles : "authors"
  users ||--o{ banners : "creates"
  users ||--o{ socialLinks : "maintains"
  users ||--o{ supervisorUpgradeRequests : "requests (studentId)"
  users |o--o{ supervisorUpgradeRequests : "reviews (reviewedBy)"
  users ||--o{ activityLogs : "acts in"
  colleges ||--o{ departments : "contains"

  users {
    string clerkId
    string email
    string role "student|supervisor|admin|sponsor"
    string studentId
    string college
    string department
    boolean isActive
  }
  applications {
    id studentId FK
    string type "3 tracks"
    string status "5 states"
    string projectName
    id pdfFileId FK
    id videoFileId FK
    id reviewerId FK
    string supervisorRating
    number submittedAt
  }
  applicationReviews {
    id applicationId FK
    id reviewerId FK
    string fromStatus
    string toStatus
    string notes
    string rating
    number createdAt
  }
  applicationPresence {
    id applicationId FK
    id userId FK
    number lastSeenAt
  }
  notifications {
    id userId FK
    string type "7 types"
    boolean read
    id applicationId FK
  }
  sponsorAssignments {
    id sponsorId FK
    id applicationId FK
    id assignedBy FK
    boolean isInterested
  }
  studentNotes {
    id userId FK
    string content
  }
  entrepreneurialGuide {
    string title
    string type "video|course|link"
    string url
    id createdBy FK
  }
  articles {
    string title
    string body
    string audience
    boolean isPublished
    id createdBy FK
  }
  banners {
    string variant
    string audience
    string bannerType
    boolean isActive
    id createdBy FK
  }
  socialLinks {
    string platform
    string url
    boolean isActive
    id updatedBy FK
  }
  colleges {
    string name
  }
  departments {
    string name
    id collegeId FK
  }
  supervisorUpgradeRequests {
    id studentId FK
    string status "pending|approved|rejected"
    id reviewedBy FK
  }
  activityLogs {
    id actorId FK
    string action
    string entityType
    string entityId
  }
```

## 3.2 Key Data-Design Decisions

- **Append-only tables.** `applicationReviews` and `activityLogs` are never updated or deleted by any function; they are the audit substrate. The "latest" reviewer fields on `applications` (`reviewerId`, `supervisorNotes`) may be overwritten, but the full history survives in `applicationReviews`.
- **Files as references.** PDFs, videos, and images are stored in Convex Storage and referenced by `Id<"_storage">`; they are never inlined into table rows.
- **Indexes follow access patterns.** Every list/lookup query reads through a declared index (e.g. `applications.by_student_status`, `notifications.by_user_read`, `banners.by_audience_active`) — never `.filter()` on an indexed field.
- **Presence is self-cleaning.** `applicationPresence` rows are heartbeats; readers ignore rows older than 30 s and the next `joinPresence` lazily evicts rows older than 60 s — no cron job.
- **Soft delete for users.** A Clerk `user.deleted` webhook sets `isActive = false` rather than deleting the row, preserving referential integrity for historical applications and reviews.

## 3.3 Storage Design

| Asset | Producer | Size cap (server-enforced) | Access control |
|---|---|---|---|
| PDF business plan | Student | 10 MB (`assertFileWithinLimit`) | `getFileUrl`: owner / staff / sponsor (non-draft) |
| Pitch video | Student | 100 MB (`assertFileWithinLimit`) | as above |
| Article cover, banner media, avatar | Staff / any user | — (image) | signed URL on read; superseded files deleted on replace |

---

# 4. Component (Module) Design

## 4.1 Backend Module Decomposition

| Module | Functions (selected) | Guard |
|---|---|---|
| `convex/users.ts` | `handleClerkWebhook` (internal), `getCurrentUser` | webhook / identity |
| `convex/users/shared.ts` | `currentUser`, `updateProfile`, `generateAvatarUploadUrl`, `getAvatarUrl` | `requireUser` |
| `convex/users/admin.ts` | `getAllUsers`, `getAdminStats`, `getStudentsWithStats`, `toggleUserActive`, `createUserByAdmin`, `insertSupervisor`/`insertSponsor` (internal) | `requireAdmin` / `requireSupervisor` |
| `convex/users/adminActions.ts` | `createSupervisor`, `createSponsor` (`"use node"` actions) | admin check |
| `convex/users/dev.ts` | `makeMeStudent/Supervisor/Admin` | dev-only (throws in production) |
| `convex/applications/student.ts` | `createApplication`, `updateApplication`, `submitApplication`, `deleteApplication`, `myApplications` | `requireStudent` |
| `convex/applications/supervisor.ts` | `updateApplicationStatus`, `bulkUpdateStatus`, `listApplications(WithStudent)`, `getReviewHistory` | `requireSupervisor` |
| `convex/applications/sponsor.ts` | `mySponsoredApplications`, `toggleSponsorInterest`, `assignSponsor`, `removeSponsorAssignment` | role check / `requireAdmin` |
| `convex/applications/shared.ts` | `getApplication`, `applicationStats` | per-role read filter |
| `convex/files.ts` | `generateUploadUrl`, `getFileUrl` | `requireUser` / per-request authorisation |
| `convex/notifications.ts` | `myNotifications`, `unreadCount`, `markAsRead`, `markAllAsRead` | `requireUser` |
| `convex/presence.ts` | `joinPresence`, `leavePresence`, `getPresence` | `requireUser` |
| `convex/articles.ts`, `convex/banners.ts`, `convex/entrepreneurialGuide.ts` | content CRUD | `requireSupervisor` to write |
| `convex/colleges.ts`, `convex/socialLinks.ts` | institutional metadata CRUD | `requireAdmin` to write |
| `convex/supervisorUpgradeRequests.ts` | `submitRequest`, `listRequests`, `reviewRequest` | student / `requireAdmin` |
| `convex/activityLogs.ts` | `log` (internal), `recentLogs` | `requireAdmin` to read |
| `convex/http.ts` | `POST /clerk-user-webhook` | svix signature |
| `convex/lib/*` | cross-cutting helpers (auth, statuses, validation, notifications, users) | — |

## 4.2 Frontend Module Decomposition

- `src/app/` — route segments per role: `(auth)/`, `student/`, `supervisor/`, `admin/(dashboard)/`, `sponsor/(dashboard)/`, plus `layout.tsx` (providers, RTL, Tajawal) and `ConvexClientProvider`.
- `src/features/<domain>/` — `components/`, `hooks/`, sometimes `utils/`/`types/`: `auth`, `applications`, `articles`, `banners`, `admin`, `entrepreneurialGuide`, `guide`, `landing`, `student`, `supervisor`.
- `src/components/` — shared UI primitives, `PdfViewer`, charts, `ThemeProvider`, tooltip.
- `src/hooks/`, `src/lib/` — shared hooks and config (e.g. application track config).

## 4.3 The Application State Machine

`convex/lib/statuses.ts` encodes the authoritative transition table; `updateApplicationStatus` and `bulkUpdateStatus` consult `canTransition()` before any write.

```mermaid
stateDiagram-v2
  [*] --> draft : createApplication
  draft --> under_review : submit
  needs_modification --> under_review : resubmit
  under_review --> needs_modification : supervisor
  under_review --> accepted : supervisor
  under_review --> rejected : supervisor
  accepted --> [*]
  rejected --> [*]
```

`accepted` and `rejected` are terminal. A student may delete an application only in `draft` or `rejected`; a student may edit only in `draft` or `needs_modification`.

---

# 5. Interface Design

## 5.1 Internal Interface — Convex Typed API

The single application contract is the generated `api` / `internal` object. Every function declares argument validators (`v.*`); the return type is inferred and shared with the client. No REST/GraphQL layer exists.

## 5.2 External Interfaces

- **Clerk → Convex (webhook):** `POST /clerk-user-webhook` with `svix-id`, `svix-timestamp`, `svix-signature` headers; body is a Clerk event (`user.created` / `user.updated` / `user.deleted`). Verified by `svix` before any DB write.
- **Client → Clerk:** `ConvexProviderWithClerk` attaches the Clerk JWT to every Convex request; Convex validates it against `convex/auth.config.ts`.
- **Vercel → Convex:** the `build` script runs `convex deploy --cmd 'next build'`.

## 5.3 User Interface

RTL Arabic, Tajawal typeface, HeroUI v3 + Tailwind v4, light/dark via `next-themes`. Routes are role-segregated and protected by `src/middleware.ts`.

---

# 6. Behavioural Design — Sequence Diagrams

## 6.1 Registration & Webhook Synchronisation

```mermaid
sequenceDiagram
  actor S as Student
  participant FE as Register form (useRegisterForm)
  participant CK as Clerk
  participant WH as convex/http.ts
  participant UM as users.handleClerkWebhook
  participant DB as Convex DB

  S->>FE: enter name, university email, 9-digit ID
  FE->>FE: validate domain ∈ {zuj.edu.jo, std-zuj.edu.jo, std.zuj.edu.jo}
  FE->>CK: signUp.create(email)
  CK-->>S: email-code (OTP)
  S->>FE: enter OTP + password
  FE->>CK: attemptEmailAddressVerification + update
  CK-->>FE: session active
  CK-)WH: POST /clerk-user-webhook (svix-signed)
  WH->>WH: verify svix signature
  WH->>UM: runMutation(handleClerkWebhook)
  UM->>UM: isUniversityEmail(email)?
  alt university email, new user
    UM->>DB: insert users {role: "student"}
  else existing user
    UM->>DB: patch users (profile sync)
  else non-university, new user
    UM-->>WH: ignore (no row created)
  end
  WH-->>CK: 200
```

## 6.2 Application Submission → Supervisor Notification

```mermaid
sequenceDiagram
  actor S as Student
  participant FE as Submission form
  participant CA as applications.createApplication
  participant V as lib/validation
  participant N as lib/notifications
  participant DB as Convex DB

  S->>FE: fill form, attach PDF/video, press "Submit"
  FE->>CA: createApplication({...args, submitNow: true})
  CA->>CA: requireStudent(ctx)
  CA->>V: assertMaxLength(fields) + assertFileWithinLimit(pdf/video)
  alt file over cap or field too long
    V-->>FE: throw (localised Arabic error)
  else valid
    CA->>DB: insert applications {status: "under_review", submittedAt}
    CA->>N: notifyAllSupervisors("new_application")
    N->>DB: insert notifications (per supervisor/admin)
    CA-->>FE: applicationId
    DB-->>S: live query updates "my applications"
  end
```

## 6.3 Supervisor Review → State Transition → Audit Log → Student Notification

```mermaid
sequenceDiagram
  actor SUP as Supervisor
  participant FE as Review screen
  participant US as applications.updateApplicationStatus
  participant SM as lib/statuses.canTransition
  participant DB as Convex DB
  actor STU as Student

  SUP->>FE: choose new status + rating + note
  FE->>US: updateApplicationStatus({id, status, rating, notes})
  US->>US: requireSupervisor(ctx)
  US->>SM: canTransition(current, new)?
  alt illegal transition
    SM-->>FE: throw (localised error)
  else legal transition
    US->>DB: patch applications {status, reviewerId, reviewedAt}
    US->>DB: insert applicationReviews {fromStatus, toStatus, notes, rating}
    US->>DB: insert notifications {userId: student, type: "status_change"}
    DB-->>STU: live query pushes status + notification
  end
```

## 6.4 Sponsor Reels Feed & Interest Toggle

```mermaid
sequenceDiagram
  actor SP as Sponsor
  participant FE as Reels feed (scroll-snap)
  participant MS as applications.mySponsoredApplications
  participant TI as applications.toggleSponsorInterest
  participant ST as Convex Storage
  participant DB as Convex DB

  SP->>FE: open sponsor dashboard
  FE->>MS: mySponsoredApplications()
  MS->>DB: query applications by_status ∈ {under_review, needs_modification, accepted}
  MS->>MS: keep only those with a video
  MS->>ST: getUrl(videoFileId) per project
  MS-->>FE: reels[] {project, videoUrl, isInterested}
  SP->>FE: tap heart on a project
  FE->>TI: toggleSponsorInterest({applicationId})
  alt assignment row exists
    TI->>DB: patch sponsorAssignments {isInterested: !prev}
  else first interest
    TI->>DB: insert sponsorAssignments {isInterested: true}
  end
```

---

# 7. Design Rationale & Patterns

- **Single source of truth for types.** Sharing `convex/_generated` between front and back end removes a whole class of integration bugs and is the main reason no DTO/serialization layer exists.
- **Guard functions over middleware.** Authorisation is a small set of composable functions (`requireUser` → `requireStudent`/`requireSupervisor`/`requireAdmin`) called at the top of each handler — explicit, testable, and impossible to forget silently because handlers that read user data must call one.
- **Pure domain rule modules.** The state machine (`statuses.ts`) and validators (`validation.ts`) are pure and dependency-light, which is why they are the most heavily unit-tested modules.
- **Defence in depth.** Upload caps and the university-email rule are enforced on the client *and* re-enforced server-side, so bypassing the UI cannot bypass the rule.
- **Reactive by default.** Because Convex queries are subscriptions, presence, notifications, and status changes need no polling or socket code in the UI — a `useQuery` re-renders when the underlying rows change.
- **Lazy, self-healing presence.** Avoiding a scheduled cleanup job keeps the deployment simple and matches the academic-project operational constraints.

---

# Appendix — Design-to-Requirement Mapping

| Design element | Satisfies (SRS) |
|---|---|
| Component diagram §2.2, layered view §2.3 | Product perspective; CN-1…CN-8 |
| ERD §3.1, table notes §3.2 | §3.4 Logical Database Requirements (DB-1…DB-3) |
| Auth guard functions §4.1, §7 | FR-RBAC-1…7, NFR-SEC-1…3 |
| State machine §4.3 | FR-REV-1…3 |
| Sequence diagram §6.1 | FR-AUTH-2…6 |
| Sequence diagram §6.2 | FR-APP-1…5, FR-FILE-2, FR-NOTIF-5 |
| Sequence diagram §6.3 | FR-REV-2…6, FR-NOTIF-5 |
| Sequence diagram §6.4 | FR-SPON-1…2, FR-FILE-4 |
| Storage design §3.3 | FR-FILE-1…5 |
