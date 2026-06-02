import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Smart-ZUJ Convex schema.
 *
 * Conventions:
 *  - Every cross-table reference uses `v.id("tableName")` instead of a bare
 *    string so the type system catches stale or wrong-table IDs at compile time.
 *  - Every index lists the columns it covers in its name (snake_case, in field
 *    order) so call sites can be grep'd quickly.
 *  - Optional fields default to `v.optional(...)` — never use empty strings or
 *    sentinel values to represent "missing".
 *
 * Application status state machine
 *  draft ──submit──▶ under_review
 *  under_review ──supervisor decision──▶ needs_modification | accepted | rejected
 *  needs_modification ──student edits & resubmits──▶ under_review
 *  accepted / rejected: terminal states (kept for audit; no further transitions).
 */
export default defineSchema({
  // ============================================
  // Users
  // ============================================
  // One row per Clerk identity. Roles drive both authorization (see
  // convex/lib/auth.ts) and which dashboard the client routes the user to.
  users: defineTable({
    // Identity & contact
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("student"),
      v.literal("supervisor"),
      v.literal("admin"),
      v.literal("sponsor")
    )),

    // Student-specific profile
    studentId: v.optional(v.string()),
    // Deprecated string fields — kept during migration window.
    // Prefer collegeId / departmentId (structured FK references) for new writes.
    // See convex/migrations/collegeToId.ts for the backfill migration.
    college: v.optional(v.string()),
    department: v.optional(v.string()),
    // Structured FK references to colleges / departments tables.
    collegeId: v.optional(v.id("colleges")),
    departmentId: v.optional(v.id("departments")),

    // Optional profile extras
    phone: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    linkedinUrl: v.optional(v.string()),

    // System flags
    isActive: v.optional(v.boolean()),
    emailVerified: v.optional(v.boolean()),
    // Auth-provider bookkeeping (kept for compatibility with @convex-dev/auth)
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    // WhatsApp notification preferences (set only after OTP verification)
    whatsappVerified: v.optional(v.boolean()),
    whatsappOptOut: v.optional(v.boolean()),

    isAnonymous: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"])
    .index("by_studentId", ["studentId"]),

  // ============================================
  // WhatsApp OTP verifications
  // ============================================
  // Pending OTPs for phone-number verification. Codes are stored as
  // SHA-256 hashes; the plaintext code lives only in the scheduler
  // argument that triggers the n8n send action. Rows stay around after
  // `consumed=true` so we can audit "when did this user verify?". An
  // expiry cleanup cron drops old consumed rows.
  whatsappVerifications: defineTable({
    userId: v.id("users"),
    phone: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    consumed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "consumed"]),

  // ============================================
  // WhatsApp send log (durable outbox)
  // ============================================
  // One row per send attempt. The mutation creates a `queued` row and
  // schedules the matching action; the action patches it to `sent` or
  // `failed`. Admin log page reads this table.
  whatsappOutbox: defineTable({
    userId: v.id("users"),
    phone: v.string(),
    kind: v.union(
      v.literal("otp"),
      v.literal("meeting"),
      v.literal("status_change"),
    ),
    payload: v.any(),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
    n8nRequestId: v.optional(v.string()),
    attempts: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status_created", ["status", "createdAt"]),

  // ============================================
  // Applications (incubation requests / projects)
  // ============================================
  // See the state machine comment at the top of this file for the allowed
  // status transitions. Edits to status MUST also append an `applicationReviews`
  // row so the audit trail stays consistent.
  applications: defineTable({
    // Owner of the application
    studentId: v.id("users"),

    // Incubation track
    type: v.union(
      v.literal("entrepreneurial_idea"),       // Entrepreneurial idea
      v.literal("it_graduation"),              // IT graduation project
      v.literal("university_entrepreneurial"), // Entrepreneurial project for the university
    ),

    // Lifecycle status — see the state machine comment at the top of the file
    status: v.union(
      v.literal("draft"),               // student-only, never visible to supervisors
      v.literal("under_review"),        // submitted, awaiting supervisor decision
      v.literal("needs_modification"),  // supervisor asked for edits
      v.literal("accepted"),            // terminal — approved
      v.literal("rejected")             // terminal — declined
    ),

    // === Shared form fields ===
    projectName: v.string(),
    description: v.string(),
    problemStatement: v.string(),
    targetAudience: v.string(),
    teamMembers: v.optional(
      v.array(
        v.object({
          name: v.string(),
          phone: v.string(),
        })
      )
    ),

    // === Shared optional fields (UI shows them per-type) ===
    phone: v.optional(v.string()),                     // Phone number — all three types
    projectGoals: v.optional(v.string()),              // Project goals — entrepreneurial_idea + it_graduation
    projectCategory: v.optional(v.array(v.string())),  // Project category — multi-select for IT, single-select for others
    targetLocation: v.optional(v.string()),            // Target location — university_entrepreneurial only

    // === IT-graduation-specific ===
    supervisor: v.optional(v.string()),                // Academic supervisor's name (free-text)

    // === University-entrepreneurial-specific ===
    universityBenefit: v.optional(v.string()),         // Stated benefit to the university

    // === Attachments ===
    pdfFileId: v.optional(v.id("_storage")),
    videoFileId: v.optional(v.id("_storage")),

    // === Supervisor review (latest decision; full history in applicationReviews) ===
    reviewerId: v.optional(v.id("users")),
    supervisorNotes: v.optional(v.string()),
    supervisorRating: v.optional(
      v.union(
        v.literal("excellent"),
        v.literal("good"),
        v.literal("average"),
        v.literal("poor")
      )
    ),
    reviewedAt: v.optional(v.number()),

    // === Timestamps ===
    createdAt: v.number(),
    updatedAt: v.number(),
    submittedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_student_status", ["studentId", "status"])
    .index("by_type_status", ["type", "status"]),

  // ============================================
  // Application reviews (immutable audit log)
  // ============================================
  // Immutable history of every status transition performed by a supervisor
  // or admin on an application. Lets us reconstruct "who decided what and
  // when" even after the application has been re-reviewed and the latest
  // reviewerId/supervisorNotes fields have been overwritten.
  applicationReviews: defineTable({
    applicationId: v.id("applications"),
    reviewerId: v.id("users"),
    fromStatus: v.union(
      v.literal("draft"),
      v.literal("under_review"),
      v.literal("needs_modification"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    toStatus: v.union(
      v.literal("under_review"),
      v.literal("needs_modification"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    notes: v.optional(v.string()),
    rating: v.optional(
      v.union(
        v.literal("excellent"),
        v.literal("good"),
        v.literal("average"),
        v.literal("poor"),
      ),
    ),
    createdAt: v.number(),
  })
    .index("by_application", ["applicationId"])
    .index("by_reviewer", ["reviewerId"]),



  // ============================================
  // Social links (footer)
  // ============================================
  // Admin-managed social media links rendered in the global footer.
  // `platform` is stored as a free-form string (e.g. "facebook",
  // "instagram", "youtube", "email") so new platforms can be added
  // without a schema migration; the client renders a fallback icon
  // for any unknown value. `order` is a manual sort key.
  socialLinks: defineTable({
    platform: v.string(),
    url: v.string(),
    label: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_active", ["isActive"])
    .index("by_order", ["order"]),

  // ============================================
  // Banners (announcements)
  // ============================================
  // Supervisor-managed banners shown on the student dashboard and/or the
  // landing page. Each banner has a visual variant (info/success/warning),
  // an audience ("student" / "landing" / "all"), and an isActive toggle
  // so supervisors can pause without deleting.
  banners: defineTable({
    title: v.string(),
    message: v.string(),
    variant: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
    ),
    audience: v.union(
      v.literal("student"),
      v.literal("supervisor"),
      v.literal("landing"),
      v.literal("all"),
    ),
    isActive: v.boolean(),
    linkHref: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
    // When set, the banner is rendered in the HeroCarousel on the landing
    // page instead of the text BannerList.
    imageUrl: v.optional(v.string()),
    // Discriminates between static text cards ("text"), scrolling marquee
    // bar ("scrolling"), and hero image/video carousel ("hero"). Existing
    // rows without this field are treated as "text".
    bannerType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("scrolling"),
        v.literal("hero"),
      ),
    ),
    // Media discriminator for hero banners: "image" (default), "video",
    // or "youtube". Existing rows without this are treated as "image".
    mediaType: v.optional(
      v.union(
        v.literal("image"),
        v.literal("video"),
        v.literal("youtube"),
      ),
    ),
    // Convex storage ID for uploaded images/videos.
    storageId: v.optional(v.id("_storage")),
    // Unix timestamp (ms). When set, the banner auto-hides after this time.
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_active", ["isActive"])
    .index("by_audience_active", ["audience", "isActive"])
    .index("by_type_active", ["bannerType", "isActive"])
    .index("by_audience_active_expires", ["audience", "isActive", "expiresAt"]),

  // ============================================
  // Notifications
  // ============================================
  // Per-user inbox surfaced by the NotificationBell. The `type` enum drives
  // both the icon and the deep-link target on the client.
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("status_change"),     // Application status changed
      v.literal("new_note"),          // Supervisor left a note
      v.literal("new_application"),   // New application landed in a supervisor's queue
      v.literal("assignment"),        // Sponsor assigned to a project
      v.literal("announcement"),      // Broadcast announcement
      v.literal("system"),            // System notice
      v.literal("upgrade_request"),   // Supervisor-upgrade request update
      v.literal("meeting")            // Supervisor scheduled a meeting with the student
    ),
    applicationId: v.optional(v.id("applications")),
    read: v.boolean(),
    // Some notifications carry an action the user has to acknowledge
    // explicitly (status decisions, meeting invites, upgrade decisions).
    // `requireAck` flags them; `ackedAt` records when the user actually
    // confirmed. Optional everywhere so old rows stay valid as-is.
    requireAck: v.optional(v.boolean()),
    ackedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_user_created", ["userId", "createdAt"])
    // Sole purpose: range-scan all notifications older than the cleanup
    // cutoff. Unused by any user-facing query.
    .index("by_createdAt", ["createdAt"]),

  // ============================================
  // Sponsor ↔ application assignments
  // ============================================
  // Many-to-many: a sponsor can be linked to multiple applications and an
  // application can be shown to multiple sponsors. `isInterested` lets the
  // sponsor record their intent without committing.
  sponsorAssignments: defineTable({
    sponsorId: v.id("users"),
    applicationId: v.id("applications"),
    assignedBy: v.id("users"),
    notes: v.optional(v.string()),
    isInterested: v.optional(v.boolean()),
    // When set, a supervisor/admin has reached out to the sponsor about
    // this interest. Drives the "تم التواصل" pill in the sponsor's
    // interests grid; unset means the request is still pending review.
    adminContactedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sponsor", ["sponsorId"])
    .index("by_application", ["applicationId"])
    .index("by_sponsor_application", ["sponsorId", "applicationId"]),

  // ============================================
  // Student notes (private scratchpad)
  // ============================================
  studentNotes: defineTable({
    userId: v.id("users"),
    content: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ============================================
  // Entrepreneurial guide (resources for students)
  // ============================================
  // Supervisor-managed educational resources (videos, courses, links)
  // visible to all students via /student/entrepreneurial-guide.
  entrepreneurialGuide: defineTable({
    title: v.string(),
    type: v.union(
      v.literal("video"),
      v.literal("course"),
      v.literal("link"),
    ),
    url: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  // ============================================
  // Colleges
  // ============================================
  colleges: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }),

  // ============================================
  // Departments (belong to a college)
  // ============================================
  departments: defineTable({
    name: v.string(),
    collegeId: v.id("colleges"),
    createdAt: v.number(),
  }).index("by_college", ["collegeId"]),

  // ============================================
  // Supervisor upgrade requests
  // ============================================
  // A student requesting to be promoted to a supervisor role. Reviewed by
  // an admin; outcome lands in `status`. Timeline queries use by_createdAt.
  supervisorUpgradeRequests: defineTable({
    studentId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewedBy: v.optional(v.id("users")),
    // Free-form justification the student writes when requesting the
    // promotion. Optional so old rows don't need a backfill, but the new
    // submitRequest UI surfaces it as a required field.
    reason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // ============================================
  // Meetings (supervisor → student)
  // ============================================
  // Lightweight scheduling: a supervisor records a meeting they intend to
  // hold with a student. There's no calendar/RSVP flow yet — the meeting
  // exists primarily so the student can see "you have something coming up"
  // alongside their notifications, and so supervisors can keep a record.
  // location is free-form (room name or video link); notes is anything
  // extra (agenda, what to bring, etc.).
  meetings: defineTable({
    studentId: v.id("users"),
    scheduledBy: v.id("users"),
    scheduledAt: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Optional anchor — when a meeting is rooted in a specific project the
    // student can deep-link straight to it from the meeting card.
    applicationId: v.optional(v.id("applications")),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_student_scheduled", ["studentId", "scheduledAt"])
    .index("by_scheduledBy", ["scheduledBy"]),

  // ============================================
  // Activity log
  // ============================================
  // Append-only feed of meaningful actions across the app, surfaced to admins
  // for traceability. `entityId` is a free-form string because actors may
  // refer to entities from any table.
  activityLogs: defineTable({
    actorId: v.id("users"),
    actorName: v.string(),
    actorRole: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  // ============================================
  // Articles
  // ============================================
  // Supervisor-authored articles rendered in a dedicated page for the
  // students. Each article has a markdown body, optional cover image
  // (Convex storage), free-form tags, and an audience filter ("student"
  // / "supervisor" / "all") so supervisor-only articles can exist too.
  // `isPublished` lets authors draft articles without exposing them.
  articles: defineTable({
    title: v.string(),
    summary: v.optional(v.string()),
    body: v.string(),
    coverStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    audience: v.union(
      v.literal("student"),
      v.literal("supervisor"),
      v.literal("all"),
    ),
    isPublished: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published", ["isPublished"])
    .index("by_audience_published", ["audience", "isPublished"])
    .index("by_author", ["createdBy"])
    .index("by_createdAt", ["createdAt"]),
});
