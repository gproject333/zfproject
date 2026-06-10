import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";

/**
 * Second-pass demo fixups, run after the new "attachments required on submit"
 * rule made the first seed batch inconsistent (apps in review/accepted with
 * no files). This:
 *   1. attaches a real PDF + video to file-less needs_modification apps,
 *   2. deletes file-less accepted apps (+ their review rows) — they could
 *      never exist under the new rule,
 *   3. fills out the colleges/departments catalogue (additive, idempotent),
 *   4. adds demo students tied to those colleges/departments,
 *   5. adds fresh applications that DO carry attachments, including a few
 *      accepted-with-video so the sponsor reel feed has content.
 *
 * Run:  npx convex run seed/extend:extendDemo --env-file .env.selfhosted
 */

const SAMPLE_PDF_URL =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const SAMPLE_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

const COLLEGE_SEED: { college: string; departments: string[] }[] = [
  { college: "كلية تكنولوجيا المعلومات", departments: ["علم الحاسوب", "هندسة البرمجيات", "نظم المعلومات الحاسوبية", "الأمن السيبراني", "علم البيانات والذكاء الاصطناعي"] },
  { college: "كلية الهندسة", departments: ["الهندسة الكهربائية", "الهندسة المدنية", "الهندسة الميكانيكية", "هندسة الاتصالات", "الهندسة المعمارية"] },
  { college: "كلية العلوم", departments: ["الرياضيات", "الفيزياء", "الكيمياء", "العلوم الحياتية"] },
  { college: "كلية الآداب", departments: ["اللغة العربية", "اللغة الإنجليزية", "الترجمة", "العلوم السياسية"] },
  { college: "كلية الاقتصاد والعلوم الإدارية", departments: ["المحاسبة", "إدارة الأعمال", "التسويق", "التمويل والمصارف", "نظم المعلومات الإدارية"] },
  { college: "كلية الحقوق", departments: ["القانون"] },
  { college: "كلية الصيدلة", departments: ["الصيدلة"] },
  { college: "كلية التمريض", departments: ["التمريض"] },
];

const NEW_STUDENTS: { name: string; email: string; studentId: string; phone: string }[] = [
  { name: "نور أحمد البطاينة", email: "noor.demo2@std.zuj.edu.jo", studentId: "202310010", phone: "+962790000010" },
  { name: "محمود سامي الزعبي", email: "mahmoud.demo2@std.zuj.edu.jo", studentId: "202310011", phone: "+962790000011" },
  { name: "رهف خالد العتوم", email: "rahaf.demo2@std.zuj.edu.jo", studentId: "202310012", phone: "+962790000012" },
  { name: "كرم وليد الشوبكي", email: "karam.demo2@std.zuj.edu.jo", studentId: "202310013", phone: "+962790000013" },
];

type AppType = "entrepreneurial_idea" | "it_graduation" | "university_entrepreneurial";
type Rating = "excellent" | "good" | "average" | "poor";

const NEW_APPS: {
  studentIndex: number;
  type: AppType;
  status: "under_review" | "accepted";
  projectName: string;
  description: string;
  problemStatement: string;
  targetAudience: string;
  projectGoals?: string;
  projectCategory?: string[];
  targetLocation?: string;
  supervisor?: string;
  universityBenefit?: string;
  phone?: string;
  rating?: Rating;
  notes?: string;
}[] = [
  {
    studentIndex: 0,
    type: "entrepreneurial_idea",
    status: "accepted",
    projectName: "ورشتي — حجز مواعيد ورش صيانة السيارات",
    description: "منصّة تتيح لأصحاب السيارات حجز موعد صيانة لدى أقرب ورشة موثوقة، مع تقييمات وأسعار شفافة وتذكير بمواعيد الصيانة الدورية.",
    problemStatement: "صعوبة إيجاد ورشة موثوقة وحجز موعد دون انتظار طويل أو أسعار مفاجئة.",
    targetAudience: "أصحاب السيارات وورش الصيانة",
    projectGoals: "تنظيم سوق الصيانة ورفع الثقة بين العميل والورشة.",
    projectCategory: ["خدمات", "تطبيقات"],
    phone: "+962790000010",
    rating: "excellent",
    notes: "نموذج عمل واضح وسوق كبير. ننصح بالبدء بمنطقة جغرافية واحدة.",
  },
  {
    studentIndex: 1,
    type: "it_graduation",
    status: "accepted",
    projectName: "ذاكر — منصّة مذاكرة جماعية بالذكاء الاصطناعي",
    description: "منصّة تجمع الطلبة في غرف مذاكرة افتراضية وتولّد ملخّصات وأسئلة تدريبية من محتوى المقرر باستخدام الذكاء الاصطناعي.",
    problemStatement: "ضعف التحصيل بسبب المذاكرة الفردية وغياب أدوات تلخيص ذكية بالعربية.",
    targetAudience: "طلبة الجامعات والمدارس",
    projectGoals: "رفع كفاءة المذاكرة وتشجيع التعلّم التشاركي.",
    projectCategory: ["ذكاء اصطناعي", "تعليم"],
    supervisor: "د. رفيعة قطيش",
    phone: "+962790000011",
    rating: "good",
    notes: "فكرة قوية. يُرجى الانتباه لدقة الملخّصات المولّدة.",
  },
  {
    studentIndex: 2,
    type: "university_entrepreneurial",
    status: "under_review",
    projectName: "تدوير — إدارة نفايات الحرم الجامعي",
    description: "نظام لتتبّع حاويات إعادة التدوير في الحرم وتحفيز الطلبة على الفرز عبر نقاط ومكافآت، مع لوحة بيانات بيئية للجامعة.",
    problemStatement: "ضعف ثقافة إعادة التدوير داخل الحرم وغياب قياس للأثر البيئي.",
    targetAudience: "طلبة وإدارة الجامعة",
    targetLocation: "الحرم الرئيسي لجامعة الزيتونة",
    universityBenefit: "تعزيز الاستدامة وتحسين صورة الجامعة البيئية.",
    phone: "+962790000012",
  },
  {
    studentIndex: 3,
    type: "entrepreneurial_idea",
    status: "under_review",
    projectName: "حِرفة — تعليم الحرف والمهارات أونلاين",
    description: "منصّة تتيح للحرفيين والمهرة تقديم دورات قصيرة مصوّرة في مهاراتهم (نجارة، خياطة، طبخ) للراغبين بالتعلّم مقابل اشتراك.",
    problemStatement: "اندثار بعض الحرف وصعوبة وصول الراغبين بتعلّمها لمصدر موثوق.",
    targetAudience: "الحرفيون والراغبون بتعلّم المهارات",
    projectGoals: "حفظ الحرف وتوفير دخل إضافي لأصحابها.",
    projectCategory: ["تعليم", "محتوى"],
    phone: "+962790000013",
  },
  {
    studentIndex: 0,
    type: "it_graduation",
    status: "accepted",
    projectName: "صحّتك — متابعة مرضى الأمراض المزمنة",
    description: "تطبيق يساعد مرضى الضغط والسكري على تسجيل قراءاتهم وتذكيرهم بالأدوية ومشاركة تقاريرهم مع الطبيب المعالج بشكل دوري.",
    problemStatement: "ضعف الالتزام بمتابعة القراءات والأدوية لدى مرضى الأمراض المزمنة.",
    targetAudience: "مرضى الأمراض المزمنة والأطباء",
    projectGoals: "تحسين الالتزام العلاجي وتقليل المضاعفات.",
    projectCategory: ["صحة", "تطبيقات"],
    supervisor: "د. رفيعة قطيش",
    phone: "+962790000010",
    rating: "good",
    notes: "أثر صحي واضح. راعِ خصوصية البيانات الطبية.",
  },
];

// ── internal helpers (ctx.db lives in queries/mutations) ──────────────────

export const filelessByStatus = internalQuery({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("under_review"),
      v.literal("needs_modification"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, { status }): Promise<Id<"applications">[]> => {
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();
    return apps.filter((a) => !a.pdfFileId).map((a) => a._id);
  },
});

export const setFiles = internalMutation({
  args: {
    id: v.id("applications"),
    pdfFileId: v.id("_storage"),
    videoFileId: v.id("_storage"),
  },
  handler: async (ctx, { id, pdfFileId, videoFileId }) => {
    await ctx.db.patch(id, { pdfFileId, videoFileId, updatedAt: Date.now() });
  },
});

export const removeApp = internalMutation({
  args: { id: v.id("applications") },
  handler: async (ctx, { id }) => {
    const reviews = await ctx.db
      .query("applicationReviews")
      .withIndex("by_application", (q) => q.eq("applicationId", id))
      .collect();
    for (const r of reviews) await ctx.db.delete(r._id);
    await ctx.db.delete(id);
  },
});

export const ensureColleges = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ collegesAdded: number; departmentsAdded: number }> => {
    const now = Date.now();
    let collegesAdded = 0;
    let departmentsAdded = 0;
    const existingColleges = await ctx.db.query("colleges").collect();
    for (const item of COLLEGE_SEED) {
      const col = existingColleges.find((c) => c.name === item.college);
      let collegeId: Id<"colleges">;
      if (col) {
        collegeId = col._id;
      } else {
        collegeId = await ctx.db.insert("colleges", { name: item.college, createdAt: now });
        collegesAdded++;
      }
      const depts = await ctx.db
        .query("departments")
        .withIndex("by_college", (q) => q.eq("collegeId", collegeId))
        .collect();
      for (const dep of item.departments) {
        if (!depts.some((d) => d.name === dep)) {
          await ctx.db.insert("departments", { name: dep, collegeId, createdAt: now });
          departmentsAdded++;
        }
      }
    }
    return { collegesAdded, departmentsAdded };
  },
});

export const collegeOptions = internalQuery({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ collegeId: Id<"colleges">; departmentId: Id<"departments"> | undefined }[]> => {
    const colleges = await ctx.db.query("colleges").collect();
    const out: { collegeId: Id<"colleges">; departmentId: Id<"departments"> | undefined }[] = [];
    for (const c of colleges) {
      const dep = (
        await ctx.db
          .query("departments")
          .withIndex("by_college", (q) => q.eq("collegeId", c._id))
          .take(1)
      )[0];
      out.push({ collegeId: c._id, departmentId: dep?._id });
    }
    return out;
  },
});

export const supervisorId = internalQuery({
  args: {},
  handler: async (ctx): Promise<Id<"users"> | null> => {
    const s = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "supervisor"))
      .take(1);
    return s[0]?._id ?? null;
  },
});

export const addStudent = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    studentId: v.string(),
    phone: v.string(),
    collegeId: v.optional(v.id("colleges")),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      clerkId: `seed_demo_${args.studentId}`,
      email: args.email,
      name: args.name,
      role: "student",
      studentId: args.studentId,
      phone: args.phone,
      collegeId: args.collegeId,
      departmentId: args.departmentId,
      isActive: true,
      whatsappVerified: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addApplication = internalMutation({
  args: {
    studentId: v.id("users"),
    reviewerId: v.optional(v.id("users")),
    type: v.union(
      v.literal("entrepreneurial_idea"),
      v.literal("it_graduation"),
      v.literal("university_entrepreneurial"),
    ),
    status: v.union(v.literal("under_review"), v.literal("accepted")),
    projectName: v.string(),
    description: v.string(),
    problemStatement: v.string(),
    targetAudience: v.string(),
    projectGoals: v.optional(v.string()),
    projectCategory: v.optional(v.array(v.string())),
    targetLocation: v.optional(v.string()),
    supervisor: v.optional(v.string()),
    universityBenefit: v.optional(v.string()),
    phone: v.optional(v.string()),
    rating: v.optional(
      v.union(v.literal("excellent"), v.literal("good"), v.literal("average"), v.literal("poor")),
    ),
    notes: v.optional(v.string()),
    pdfFileId: v.id("_storage"),
    videoFileId: v.id("_storage"),
    createdAt: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"applications">> => {
    const accepted = args.status === "accepted";
    const reviewedAt = accepted ? args.createdAt + 86_400_000 : undefined;
    const appId = await ctx.db.insert("applications", {
      studentId: args.studentId,
      type: args.type,
      status: args.status,
      projectName: args.projectName,
      description: args.description,
      problemStatement: args.problemStatement,
      targetAudience: args.targetAudience,
      projectGoals: args.projectGoals,
      projectCategory: args.projectCategory,
      targetLocation: args.targetLocation,
      supervisor: args.supervisor,
      universityBenefit: args.universityBenefit,
      phone: args.phone,
      pdfFileId: args.pdfFileId,
      videoFileId: args.videoFileId,
      reviewerId: accepted ? args.reviewerId : undefined,
      supervisorNotes: accepted ? args.notes : undefined,
      supervisorRating: accepted ? args.rating : undefined,
      reviewedAt,
      createdAt: args.createdAt,
      updatedAt: reviewedAt ?? args.createdAt,
      submittedAt: args.createdAt,
    });
    if (accepted && args.reviewerId) {
      await ctx.db.insert("applicationReviews", {
        applicationId: appId,
        reviewerId: args.reviewerId,
        fromStatus: "under_review",
        toStatus: "accepted",
        notes: args.notes,
        rating: args.rating,
        createdAt: reviewedAt!,
      });
    }
    return appId;
  },
});

// ── orchestrator ──────────────────────────────────────────────────────────

export const extendDemo = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    pdfOk: boolean;
    videoOk: boolean;
    needsModFixed: number;
    acceptedDeleted: number;
    colleges: { collegesAdded: number; departmentsAdded: number };
    studentsAdded: number;
    appsAdded: number;
  }> => {
    // Fetch sample files first; abort before any mutation if they fail.
    const pdfBuf = await (await fetch(SAMPLE_PDF_URL)).arrayBuffer();
    const vidBuf = await (await fetch(SAMPLE_VIDEO_URL)).arrayBuffer();
    const newPdf = () =>
      ctx.storage.store(new Blob([pdfBuf], { type: "application/pdf" }));
    const newVid = () =>
      ctx.storage.store(new Blob([vidBuf], { type: "video/mp4" }));

    // 3. colleges/departments (additive)
    const colleges = await ctx.runMutation(internal.seed.extend.ensureColleges, {});
    const opts = await ctx.runQuery(internal.seed.extend.collegeOptions, {});
    const supId = await ctx.runQuery(internal.seed.extend.supervisorId, {});

    // 1. needs_modification → attach files
    const nm = await ctx.runQuery(internal.seed.extend.filelessByStatus, {
      status: "needs_modification",
    });
    for (const id of nm) {
      const pdfFileId = await newPdf();
      const videoFileId = await newVid();
      await ctx.runMutation(internal.seed.extend.setFiles, { id, pdfFileId, videoFileId });
    }

    // 2. file-less accepted → delete
    const acc = await ctx.runQuery(internal.seed.extend.filelessByStatus, {
      status: "accepted",
    });
    for (const id of acc) {
      await ctx.runMutation(internal.seed.extend.removeApp, { id });
    }

    // 4. students tied to colleges/departments
    const studentIds: Id<"users">[] = [];
    for (let i = 0; i < NEW_STUDENTS.length; i++) {
      const s = NEW_STUDENTS[i];
      const pick = opts.length ? opts[i % opts.length] : undefined;
      const id = await ctx.runMutation(internal.seed.extend.addStudent, {
        ...s,
        collegeId: pick?.collegeId,
        departmentId: pick?.departmentId,
      });
      studentIds.push(id);
    }

    // 5. new applications WITH files
    const day = 86_400_000;
    const now = Date.now();
    let appsAdded = 0;
    for (let i = 0; i < NEW_APPS.length; i++) {
      const app = NEW_APPS[i];
      const pdfFileId = await newPdf();
      const videoFileId = await newVid();
      await ctx.runMutation(internal.seed.extend.addApplication, {
        studentId: studentIds[app.studentIndex % studentIds.length],
        reviewerId: supId ?? undefined,
        type: app.type,
        status: app.status,
        projectName: app.projectName,
        description: app.description,
        problemStatement: app.problemStatement,
        targetAudience: app.targetAudience,
        projectGoals: app.projectGoals,
        projectCategory: app.projectCategory,
        targetLocation: app.targetLocation,
        supervisor: app.supervisor,
        universityBenefit: app.universityBenefit,
        phone: app.phone,
        rating: app.rating,
        notes: app.notes,
        pdfFileId,
        videoFileId,
        createdAt: now - (i + 1) * day,
      });
      appsAdded++;
    }

    return {
      pdfOk: pdfBuf.byteLength > 0,
      videoOk: vidBuf.byteLength > 0,
      needsModFixed: nm.length,
      acceptedDeleted: acc.length,
      colleges,
      studentsAdded: studentIds.length,
      appsAdded,
    };
  },
});
