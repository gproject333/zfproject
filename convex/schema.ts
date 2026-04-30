import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // المستخدمون
  // ============================================
  users: defineTable({
    // بيانات أساسية
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("student"),
      v.literal("supervisor"),
      v.literal("admin"),
      v.literal("sponsor")
    )),

    // بيانات الطالب
    studentId: v.optional(v.string()),
    college: v.optional(v.string()),
    department: v.optional(v.string()),

    // بيانات إضافية
    phone: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    linkedinUrl: v.optional(v.string()),

    // معلومات النظام
    isActive: v.optional(v.boolean()),
    emailVerified: v.optional(v.boolean()),
    // حقول مطلوبة من @convex-dev/auth
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
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
  // الطلبات / المشاريع
  // ============================================
  applications: defineTable({
    // مقدم الطلب
    studentId: v.id("users"),

    // نوع الاحتضان
    type: v.union(
      v.literal("entrepreneurial_idea"), // فكرة ريادية
      v.literal("it_graduation"),        // مشروع تخرج IT
      v.literal("university_entrepreneurial") // مشروع ريادي للجامعة
    ),

    // حالة الطلب
    status: v.union(
      v.literal("draft"),              // مسودة — student-only
      v.literal("under_review"),       // قيد المراجعة
      v.literal("needs_modification"), // يحتاج تعديل
      v.literal("accepted"),           // مقبول
      v.literal("rejected")            // مرفوض
    ),

    // === بيانات النموذج المشتركة ===
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

    // === حقول جديدة مشتركة (تُعرض بحسب النوع في الواجهة) ===
    phone: v.optional(v.string()),            // رقم الهاتف — الثلاثة أنواع
    projectGoals: v.optional(v.string()),     // أهداف المشروع — entrepreneurial_idea + it_graduation
    projectCategory: v.optional(v.array(v.string())),  // نوع المشروع — مصفوفة (IT متعدد، الباقي واحد)
    targetLocation: v.optional(v.string()),   // المكان المستهدف — university_entrepreneurial

    // === حقول خاصة بمشروع IT ===
    supervisor: v.optional(v.string()),         // اسم المشرف الأكاديمي

    // === حقول خاصة بمشروع ريادي للجامعة ===
    universityBenefit: v.optional(v.string()),   // الفائدة للجامعة

    // === الملفات المرفقة ===
    pdfFileId: v.optional(v.id("_storage")),
    videoFileId: v.optional(v.id("_storage")),

    // === مراجعة المشرف ===
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

    // === الطوابع الزمنية ===
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
  // سجل المراجعات (audit log)
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
  // حضور المستخدمين على الطلب (presence)
  // ============================================
  // Lightweight heartbeat-based presence — every user viewing an
  // application page upserts a row with `lastSeenAt = Date.now()` on
  // mount and on a 10-second interval. The query reads rows whose
  // lastSeenAt is within the last 30 seconds; older rows are filtered
  // out and lazily cleaned up by the next heartbeat. No cron job
  // needed: stale rows are invisible to readers and replaced (not
  // accumulated) by the user's next visit.
  applicationPresence: defineTable({
    applicationId: v.id("applications"),
    userId: v.id("users"),
    lastSeenAt: v.number(),
  })
    .index("by_application", ["applicationId"])
    .index("by_user_application", ["userId", "applicationId"]),

  // ============================================
  // روابط التواصل الاجتماعي
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
  // البنرات الإعلانية (announcements)
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
    .index("by_type_active", ["bannerType", "isActive"]),

  // ============================================
  // الإشعارات
  // ============================================
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("status_change"),     // تغيير حالة
      v.literal("new_note"),          // ملاحظة جديدة
      v.literal("new_application"),   // طلب جديد
      v.literal("assignment"),        // تعيين مشروع
      v.literal("announcement"),     // إعلان جديد
      v.literal("system"),           // نظام
      v.literal("upgrade_request")   // طلب ترقية
    ),
    applicationId: v.optional(v.id("applications")),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ============================================
  // ربط السبونسر بالمشاريع
  // ============================================
  sponsorAssignments: defineTable({
    sponsorId: v.id("users"),
    applicationId: v.id("applications"),
    assignedBy: v.id("users"),
    notes: v.optional(v.string()),
    isInterested: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_sponsor", ["sponsorId"])
    .index("by_application", ["applicationId"])
    .index("by_sponsor_application", ["sponsorId", "applicationId"]),

  studentNotes: defineTable({
    userId: v.id("users"),
    content: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ============================================
  // الدليل الريادي
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
  // الكليات
  // ============================================
  colleges: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }),

  // ============================================
  // التخصصات
  // ============================================
  departments: defineTable({
    name: v.string(),
    collegeId: v.id("colleges"),
    createdAt: v.number(),
  }).index("by_college", ["collegeId"]),

  // ============================================
  // طلبات ترقية المشرف
  // ============================================
  supervisorUpgradeRequests: defineTable({
    studentId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"]),

  // ============================================
  // سجل النشاطات
  // ============================================
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
  // المقالات
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
    .index("by_author", ["createdBy"]),
});
