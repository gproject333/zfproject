import { internalMutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Demo content seeder for the ZUJ Incubator platform.
 *
 * Populates articles, the entrepreneurial guide, banners (announcements),
 * and a set of demo student applications across every status so the
 * supervisor review queue, sponsor feed, and student/landing surfaces all
 * have realistic, professional Arabic content for demos/presentations.
 *
 * Mirrors the `bootstrapSeed` pattern in colleges.ts: an internalMutation
 * run once via `npx convex run seed/content:bootstrap`. Idempotent — a second
 * run detects the sentinel article and no-ops.
 *
 * All demo users are created with a `seed_demo_` clerkId prefix so they can
 * be identified and removed later if needed.
 */

const SENTINEL_ARTICLE = "كيف تحوّل فكرتك إلى مشروع ريادي قابل للتنفيذ";

// ── Articles ────────────────────────────────────────────────────────────
const ARTICLES: {
  title: string;
  summary: string;
  body: string;
  tags: string[];
  audience: "student" | "supervisor" | "all";
}[] = [
  {
    title: SENTINEL_ARTICLE,
    summary:
      "خطوات عملية لتحويل فكرة أولية إلى مشروع واضح المعالم قابل للتقديم لحاضنة الأعمال.",
    body: "## من الفكرة إلى المشروع\n\nالكثير من الأفكار الريادية تبقى حبيسة الأذهان لأن أصحابها لا يعرفون كيف يحوّلونها إلى خطوة عملية. في هذا المقال نستعرض إطاراً بسيطاً يساعدك على بلورة فكرتك.\n\n### 1. حدّد المشكلة بوضوح\nابدأ من المشكلة لا من الحل. اسأل نفسك: من يعاني من هذه المشكلة؟ وما حجم معاناته؟\n\n### 2. تحقّق من وجود سوق\nتحدّث مع عشرة أشخاص على الأقل من جمهورك المستهدف قبل أن تكتب سطراً واحداً من الكود.\n\n### 3. ابنِ نموذجاً أولياً (MVP)\nأبسط نسخة تثبت أن الحل يعمل. لا تنتظر الكمال.\n\n### 4. قدّم لحاضنة الأعمال\nجهّز عرضاً موجزاً يوضّح المشكلة والحل والسوق والفريق، ثم قدّم طلبك عبر المنصة.",
    tags: ["ريادة", "أفكار", "بداية"],
    audience: "all",
  },
  {
    title: "كتابة دراسة الجدوى: دليل عملي للطلبة",
    summary:
      "ما هي دراسة الجدوى ولماذا تطلبها لجان التقييم، مع قالب مبسّط لإعدادها.",
    body: "## دراسة الجدوى\n\nدراسة الجدوى هي الأداة التي تثبت أن مشروعك ليس فكرة جميلة فقط، بل فرصة واقعية.\n\n### المكوّنات الأساسية\n- **الجدوى السوقية**: حجم السوق والمنافسون.\n- **الجدوى الفنية**: هل تملك القدرة على بناء المنتج؟\n- **الجدوى المالية**: التكاليف، الإيرادات المتوقعة، ونقطة التعادل.\n\nابدأ بأرقام تقديرية واقعية، ووثّق مصادرك. اللجنة تقدّر الصدق أكثر من المبالغة.",
    tags: ["دراسة جدوى", "تخطيط", "مالية"],
    audience: "student",
  },
  {
    title: "بناء نموذج العمل التجاري Business Model Canvas",
    summary:
      "أداة من تسع خانات تساعدك على رؤية مشروعك بالكامل في صفحة واحدة.",
    body: "## نموذج العمل التجاري\n\nمخطط نموذج العمل (BMC) يلخّص مشروعك في تسع خانات: شرائح العملاء، القيمة المقترحة، القنوات، العلاقة مع العملاء، مصادر الإيراد، الموارد الرئيسية، الأنشطة الرئيسية، الشركاء، وهيكل التكاليف.\n\nاملأ الخانات بملاحظات لاصقة (Sticky Notes) وعدّلها باستمرار كلما تعلّمت شيئاً جديداً عن السوق. النموذج وثيقة حيّة لا تُكتب مرة واحدة.",
    tags: ["نموذج عمل", "استراتيجية"],
    audience: "all",
  },
  {
    title: "أساسيات التمويل والاستثمار للمشاريع الناشئة",
    summary: "مصادر التمويل المختلفة من التمويل الذاتي إلى المستثمر الملائكي.",
    body: "## كيف تموّل مشروعك؟\n\n### مراحل التمويل\n1. **التمويل الذاتي (Bootstrapping)**: من مدّخراتك أو إيرادات أولية.\n2. **الأصدقاء والعائلة**.\n3. **المستثمر الملائكي (Angel Investor)**.\n4. **رأس المال الجريء (VC)**.\n\nلكل مرحلة توقّعاتها. لا تطلب تمويلاً ضخماً قبل أن تثبت جدوى فكرتك بأرقام حقيقية. تذكّر أن التمويل وسيلة وليس هدفاً.",
    tags: ["تمويل", "استثمار", "مالية"],
    audience: "student",
  },
  {
    title: "حماية الملكية الفكرية لمشروعك",
    summary: "متى وكيف تحمي علامتك التجارية واختراعك قبل الإطلاق.",
    body: "## الملكية الفكرية\n\nقبل أن تعرض فكرتك على العالم، افهم كيف تحميها:\n- **العلامة التجارية**: تحمي اسم وشعار مشروعك.\n- **براءة الاختراع**: تحمي الابتكار التقني.\n- **حقوق المؤلف**: تحمي المحتوى والكود.\n\nفي الأردن يمكنك تسجيل علامتك التجارية لدى الجهات المختصة. استشر مختصاً مبكراً لتتجنّب النزاعات لاحقاً.",
    tags: ["ملكية فكرية", "قانون", "علامة تجارية"],
    audience: "all",
  },
  {
    title: "دليل المشرف: معايير تقييم مشاريع الحاضنة",
    summary: "إطار موحّد يساعد المشرفين على تقييم الطلبات بعدالة واتساق.",
    body: "## معايير التقييم\n\nعند مراجعة طلب، وازِن بين المعايير التالية:\n\n| المعيار | الوزن |\n|---|---|\n| وضوح المشكلة | عالٍ |\n| ابتكار الحل | عالٍ |\n| جدوى التنفيذ | متوسط |\n| قوة الفريق | متوسط |\n| الأثر على الجامعة/المجتمع | متوسط |\n\nاحرص على كتابة ملاحظات بنّاءة عند طلب التعديل أو الرفض، فهي أهم ما يستفيد منه الطالب.",
    tags: ["تقييم", "مشرفين", "إرشادات"],
    audience: "supervisor",
  },
  {
    title: "من الجامعة إلى السوق: قصص نجاح ملهمة",
    summary: "أمثلة لمشاريع طلابية انطلقت من الحاضنة ووصلت إلى السوق.",
    body: "## قصص نجاح\n\nالعديد من الشركات الناشئة الناجحة بدأت كمشاريع تخرّج. القاسم المشترك بينها:\n\n- فريق متماسك آمن بالفكرة.\n- استعداد للتعلّم من الفشل المبكر.\n- تركيز على حل مشكلة حقيقية لمستخدم حقيقي.\n\nمشروعك القادم قد يكون القصة الملهمة التالية. ابدأ اليوم.",
    tags: ["قصص نجاح", "إلهام"],
    audience: "all",
  },
];

// ── Entrepreneurial guide ───────────────────────────────────────────────
const GUIDE: { title: string; type: "video" | "course" | "link"; url: string }[] =
  [
    {
      title: "ريادة الأعمال 101 — Y Combinator Startup School",
      type: "video",
      url: "https://www.youtube.com/watch?v=CBYhVcO4WgI",
    },
    {
      title: "Coursera — تخصص ريادة الأعمال (Entrepreneurship Specialization)",
      type: "course",
      url: "https://www.coursera.org/specializations/wharton-entrepreneurship",
    },
    {
      title: "نموذج العمل التجاري — Strategyzer Business Model Canvas",
      type: "link",
      url: "https://www.strategyzer.com/library/the-business-model-canvas",
    },
    {
      title: "كيف تقدّم عرضك أمام المستثمرين (Pitch Deck)",
      type: "video",
      url: "https://www.youtube.com/watch?v=ASA917q4U18",
    },
    {
      title: "إدارة المشاريع الناشئة — منصّة إدراك",
      type: "course",
      url: "https://www.edraak.org/programs/",
    },
    {
      title: "أدوات بحث السوق المجانية — Google Trends",
      type: "link",
      url: "https://trends.google.com/trends/",
    },
    {
      title: "أساسيات التسويق الرقمي للمشاريع الناشئة",
      type: "video",
      url: "https://www.youtube.com/watch?v=nU-IIXBWlS4",
    },
    {
      title: "دليل تسجيل العلامة التجارية في الأردن",
      type: "link",
      url: "https://mit.gov.jo/",
    },
  ];

// ── Banners / announcements ─────────────────────────────────────────────
const BANNERS: {
  title: string;
  message: string;
  variant: "info" | "success" | "warning";
  audience: "student" | "supervisor" | "landing" | "all";
  bannerType: "text" | "scrolling" | "hero";
  isActive: boolean;
  linkHref?: string;
  linkLabel?: string;
}[] = [
  {
    title: "مرحباً بكم في حاضنة الزيتونة",
    message:
      "منصّة حاضنة الأعمال في جامعة الزيتونة الأردنية — قدّم فكرتك الريادية وتابع رحلتها من التقديم حتى الاحتضان.",
    variant: "info",
    audience: "landing",
    bannerType: "hero",
    isActive: true,
    linkHref: "/sign-up",
    linkLabel: "ابدأ الآن",
  },
  {
    title: "آخر موعد لتقديم مشاريع الفصل الحالي",
    message:
      "📢 يُغلق باب استقبال الطلبات يوم الخميس القادم الساعة 4:00 مساءً — سارِع بإكمال طلبك.",
    variant: "warning",
    audience: "student",
    bannerType: "scrolling",
    isActive: true,
  },
  {
    title: "تهانينا للدفعة الجديدة",
    message:
      "تم قبول 12 مشروعاً في برنامج الاحتضان لهذا الفصل. نتمنى لكم التوفيق ونحن بانتظار إبداعاتكم!",
    variant: "success",
    audience: "student",
    bannerType: "text",
    isActive: true,
  },
  {
    title: "فعّل إشعارات الواتساب",
    message:
      "لتصلك قرارات المراجعة ومواعيد الاجتماعات فوراً، أكمل التحقق من رقم الواتساب من صفحة الملف الشخصي.",
    variant: "info",
    audience: "all",
    bannerType: "text",
    isActive: true,
  },
  {
    title: "تذكير للمشرفين",
    message:
      "هناك طلبات بانتظار المراجعة في قائمتك. يُرجى إنهاء المراجعة خلال 5 أيام عمل.",
    variant: "warning",
    audience: "supervisor",
    bannerType: "text",
    isActive: true,
  },
];

// ── Demo students ───────────────────────────────────────────────────────
const STUDENTS: { name: string; email: string; studentId: string; phone: string }[] =
  [
    { name: "أحمد خالد العمري", email: "ahmad.demo@std.zuj.edu.jo", studentId: "202210001", phone: "+962790000001" },
    { name: "ليان محمد السعيد", email: "layan.demo@std.zuj.edu.jo", studentId: "202210002", phone: "+962790000002" },
    { name: "عمر يوسف الحديد", email: "omar.demo@std.zuj.edu.jo", studentId: "202210003", phone: "+962790000003" },
    { name: "سارة عدنان القيسي", email: "sara.demo@std.zuj.edu.jo", studentId: "202210004", phone: "+962790000004" },
    { name: "يزن طارق النعيمي", email: "yazan.demo@std.zuj.edu.jo", studentId: "202210005", phone: "+962790000005" },
  ];

type AppType = "entrepreneurial_idea" | "it_graduation" | "university_entrepreneurial";
type AppStatus = "draft" | "under_review" | "needs_modification" | "accepted" | "rejected";
type Rating = "excellent" | "good" | "average" | "poor";

// ── Applications (studentIndex points into STUDENTS) ────────────────────
const APPLICATIONS: {
  studentIndex: number;
  type: AppType;
  status: AppStatus;
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
    projectName: "سلّة — توصيل منتجات المزارعين المحليين",
    description:
      "منصّة إلكترونية تربط المزارعين المحليين بالمستهلكين مباشرة دون وسطاء، مع خدمة توصيل في نفس اليوم لضمان الطزاجة وأسعار عادلة للطرفين.",
    problemStatement:
      "يفقد المزارع جزءاً كبيراً من ربحه بسبب الوسطاء، بينما يدفع المستهلك أسعاراً مرتفعة لمنتجات أقل طزاجة.",
    targetAudience: "المزارعون المحليون والأسر في عمّان والزرقاء",
    projectGoals: "تقليل الفاقد الزراعي وزيادة دخل المزارع بنسبة 30%.",
    projectCategory: ["زراعة", "تجارة إلكترونية"],
    phone: "+962790000001",
    rating: "excellent",
    notes: "فكرة ناضجة وسوق واضح. ننصح بالتركيز على لوجستيات التوصيل في المرحلة الأولى.",
  },
  {
    studentIndex: 1,
    type: "it_graduation",
    status: "accepted",
    projectName: "مُعين — مساعد ذكي لذوي الإعاقة البصرية",
    description:
      "تطبيق هاتف يستخدم الذكاء الاصطناعي ورؤية الحاسوب لوصف المحيط وقراءة النصوص بصوت عربي طبيعي، لمساعدة المكفوفين على التنقّل بأمان.",
    problemStatement:
      "تفتقر التطبيقات المساعدة الحالية لدعم اللغة العربية بجودة عالية، ما يحدّ من استفادة المكفوفين الناطقين بالعربية.",
    targetAudience: "الأشخاص ذوو الإعاقة البصرية",
    projectGoals: "توفير أداة مجانية تعمل دون اتصال بالإنترنت في معظم الوظائف.",
    projectCategory: ["ذكاء اصطناعي", "تطبيقات", "دمج"],
    supervisor: "د. رفيعة قطيش",
    phone: "+962790000002",
    rating: "good",
    notes: "مشروع ذو أثر اجتماعي عالٍ. يُفضّل توثيق دقة النموذج على بيانات عربية.",
  },
  {
    studentIndex: 2,
    type: "university_entrepreneurial",
    status: "under_review",
    projectName: "خريطة الحرم الذكية",
    description:
      "نظام ملاحة داخلي للحرم الجامعي يرشد الطلبة الجدد والزوّار إلى القاعات والمكاتب والخدمات عبر تطبيق ويب تفاعلي ولوحات رقمية.",
    problemStatement:
      "يواجه الطلبة الجدد والزوّار صعوبة في الوصول إلى القاعات والمكاتب داخل الحرم الواسع.",
    targetAudience: "طلبة الجامعة الجدد والزوّار",
    targetLocation: "الحرم الرئيسي لجامعة الزيتونة",
    universityBenefit:
      "تحسين تجربة الطلبة الجدد وتقليل العبء على مكاتب الاستقبال خلال أسبوع التسجيل.",
    phone: "+962790000003",
  },
  {
    studentIndex: 3,
    type: "entrepreneurial_idea",
    status: "under_review",
    projectName: "دِرس — منصّة دروس خصوصية بين الطلبة",
    description:
      "منصّة تتيح للطلبة المتفوّقين تقديم دروس خصوصية لزملائهم في المواد الصعبة بأسعار مناسبة، مع نظام تقييم وحجز إلكتروني.",
    problemStatement:
      "صعوبة إيجاد مدرّس موثوق وبسعر مناسب للمواد الجامعية الصعبة.",
    targetAudience: "طلبة الجامعات في الأردن",
    projectGoals: "بناء مجتمع تعليمي تشاركي وتوفير دخل للطلبة المتفوّقين.",
    projectCategory: ["تعليم", "تطبيقات"],
    phone: "+962790000004",
  },
  {
    studentIndex: 4,
    type: "it_graduation",
    status: "needs_modification",
    projectName: "حافظ — تطبيق إدارة المصاريف الشخصية",
    description:
      "تطبيق لإدارة المصاريف الشخصية يصنّف النفقات تلقائياً ويقترح ميزانية شهرية ذكية بناءً على عادات الإنفاق.",
    problemStatement:
      "يعاني كثير من الشباب من ضعف إدارة مصاريفهم الشهرية وغياب أدوات بسيطة بالعربية.",
    targetAudience: "الشباب والموظفون الجدد",
    projectGoals: "رفع الوعي المالي وتشجيع الادخار.",
    projectCategory: ["تقنية مالية", "تطبيقات"],
    supervisor: "د. رفيعة قطيش",
    phone: "+962790000005",
    notes: "الفكرة جيدة لكن يلزم توضيح ميزة المنتج عن التطبيقات المنافسة، وإضافة دراسة سوق مختصرة.",
  },
  {
    studentIndex: 0,
    type: "university_entrepreneurial",
    status: "rejected",
    projectName: "مواقف ذكية داخل الحرم",
    description:
      "نظام استشعار لمواقف السيارات داخل الحرم يعرض المواقف الشاغرة على تطبيق لحظي لتقليل وقت البحث عن موقف.",
    problemStatement: "ازدحام مواقف الحرم وصعوبة إيجاد موقف شاغر في أوقات الذروة.",
    targetAudience: "طلبة وموظفو الجامعة",
    targetLocation: "مواقف الحرم الرئيسي",
    universityBenefit: "تقليل الازدحام وتحسين انسيابية الحركة داخل الحرم.",
    phone: "+962790000001",
    notes: "تكلفة أجهزة الاستشعار مرتفعة مقارنة بالأثر، ويوجد حلول جاهزة. يُنصح بإعادة التفكير في النطاق.",
  },
  {
    studentIndex: 1,
    type: "entrepreneurial_idea",
    status: "under_review",
    projectName: "صنعة — سوق للحرف اليدوية الأردنية",
    description:
      "متجر إلكتروني يعرض منتجات الحرفيين الأردنيين للسوق المحلي والعالمي مع سرد قصّة كل منتج لتعزيز قيمته.",
    problemStatement:
      "يفتقر الحرفيون لقناة تسويق رقمية تصل بمنتجاتهم إلى جمهور أوسع.",
    targetAudience: "الحرفيون والمهتمون بالمنتجات اليدوية",
    projectGoals: "دعم الاقتصاد الإبداعي المحلي وتصدير المنتجات.",
    projectCategory: ["تجارة إلكترونية", "تراث"],
    phone: "+962790000002",
  },
  {
    studentIndex: 2,
    type: "it_graduation",
    status: "accepted",
    projectName: "تشخيص — منصّة فرز طبي أولي بالذكاء الاصطناعي",
    description:
      "منصّة تساعد المراكز الصحية على فرز الحالات حسب الأولوية اعتماداً على الأعراض المُدخلة، لتسريع وصول الحالات الحرجة للطبيب.",
    problemStatement:
      "طول فترات الانتظار في الطوارئ وصعوبة تحديد أولوية الحالات يدوياً.",
    targetAudience: "المراكز الصحية والمستشفيات",
    projectGoals: "تقليل زمن انتظار الحالات الحرجة.",
    projectCategory: ["ذكاء اصطناعي", "صحة"],
    supervisor: "د. رفيعة قطيش",
    phone: "+962790000003",
    rating: "good",
    notes: "مشروع واعد. ضرورة مراعاة الجوانب الأخلاقية والخصوصية الطبية.",
  },
  {
    studentIndex: 3,
    type: "entrepreneurial_idea",
    status: "draft",
    projectName: "خضار — اشتراك صناديق خضار أسبوعية",
    description:
      "خدمة اشتراك تُوصل صناديق خضار وفواكه موسمية أسبوعياً للأسر بأسعار الجملة مباشرة من المزرعة.",
    problemStatement: "ارتفاع أسعار الخضار في المتاجر وصعوبة ضمان الطزاجة.",
    targetAudience: "الأسر في المدن الكبرى",
    projectCategory: ["زراعة", "اشتراكات"],
    phone: "+962790000004",
  },
];

export const bootstrap = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Idempotency guard
    const sentinel = await ctx.db
      .query("articles")
      .withIndex("by_createdAt")
      .take(200);
    if (sentinel.some((a) => a.title === SENTINEL_ARTICLE)) {
      return { note: "already seeded — sentinel article exists", inserted: 0 };
    }

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // ── pick / create a staff author (createdBy) and a reviewer ──
    async function pickStaff(
      role: "admin" | "supervisor",
    ): Promise<Id<"users">> {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", role))
        .take(1);
      if (existing.length > 0) return existing[0]._id;
      return await ctx.db.insert("users", {
        clerkId: `seed_demo_${role}`,
        email: `${role}.demo@zuj.edu.jo`,
        name: role === "admin" ? "مدير النظام (تجريبي)" : "د. رفيعة قطيش",
        role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    const authorId = await pickStaff("supervisor");
    const reviewerId = authorId; // supervisor reviews applications

    // optional: attach demo students to an existing college/department
    const college = (await ctx.db.query("colleges").take(1))[0];
    const department = college
      ? (
          await ctx.db
            .query("departments")
            .withIndex("by_college", (q) => q.eq("collegeId", college._id))
            .take(1)
        )[0]
      : undefined;

    const counts = {
      articles: 0,
      guide: 0,
      banners: 0,
      students: 0,
      applications: 0,
      reviews: 0,
    };

    // ── Articles ──
    for (let i = 0; i < ARTICLES.length; i++) {
      const a = ARTICLES[i];
      await ctx.db.insert("articles", {
        title: a.title,
        summary: a.summary,
        body: a.body,
        tags: a.tags,
        audience: a.audience,
        isPublished: true,
        createdBy: authorId,
        createdAt: now - i * 60_000,
        updatedAt: now - i * 60_000,
      });
      counts.articles++;
    }

    // ── Entrepreneurial guide ──
    for (let i = 0; i < GUIDE.length; i++) {
      const g = GUIDE[i];
      await ctx.db.insert("entrepreneurialGuide", {
        title: g.title,
        type: g.type,
        url: g.url,
        createdBy: authorId,
        createdAt: now - i * 60_000,
        updatedAt: now - i * 60_000,
      });
      counts.guide++;
    }

    // ── Banners ──
    for (const b of BANNERS) {
      await ctx.db.insert("banners", {
        title: b.title,
        message: b.message,
        variant: b.variant,
        audience: b.audience,
        bannerType: b.bannerType,
        isActive: b.isActive,
        linkHref: b.linkHref,
        linkLabel: b.linkLabel,
        createdBy: authorId,
        createdAt: now,
        updatedAt: now,
      });
      counts.banners++;
    }

    // ── Demo students ──
    const studentIds: Id<"users">[] = [];
    for (const s of STUDENTS) {
      const id = await ctx.db.insert("users", {
        clerkId: `seed_demo_${s.studentId}`,
        email: s.email,
        name: s.name,
        role: "student",
        studentId: s.studentId,
        phone: s.phone,
        collegeId: college?._id,
        departmentId: department?._id,
        isActive: true,
        whatsappVerified: true,
        createdAt: now,
        updatedAt: now,
      });
      studentIds.push(id);
      counts.students++;
    }

    // ── Applications (+ review audit rows for decided ones) ──
    for (let i = 0; i < APPLICATIONS.length; i++) {
      const app = APPLICATIONS[i];
      const decided =
        app.status === "accepted" ||
        app.status === "rejected" ||
        app.status === "needs_modification";
      const createdAt = now - (i + 1) * 2 * day;
      const submittedAt = app.status === "draft" ? undefined : createdAt;

      const appId = await ctx.db.insert("applications", {
        studentId: studentIds[app.studentIndex],
        type: app.type,
        status: app.status,
        projectName: app.projectName,
        description: app.description,
        problemStatement: app.problemStatement,
        targetAudience: app.targetAudience,
        phone: app.phone,
        projectGoals: app.projectGoals,
        projectCategory: app.projectCategory,
        targetLocation: app.targetLocation,
        supervisor: app.supervisor,
        universityBenefit: app.universityBenefit,
        reviewerId: decided ? reviewerId : undefined,
        supervisorNotes: decided ? app.notes : undefined,
        supervisorRating: app.status === "accepted" ? app.rating : undefined,
        reviewedAt: decided ? createdAt + day : undefined,
        createdAt,
        updatedAt: decided ? createdAt + day : createdAt,
        submittedAt,
      });
      counts.applications++;

      if (decided) {
        await ctx.db.insert("applicationReviews", {
          applicationId: appId,
          reviewerId,
          fromStatus: "under_review",
          toStatus: app.status as "needs_modification" | "accepted" | "rejected",
          notes: app.notes,
          rating: app.status === "accepted" ? app.rating : undefined,
          createdAt: createdAt + day,
        });
        counts.reviews++;
      }
    }

    return { note: "seeded", ...counts };
  },
});
