"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Send,
  Lightbulb,
  FileText,
  GraduationCap,
  CheckCircle2,
  Clock,
  TrendingUp,
  BookOpen,
  PlayCircle,
  Compass,
  ArrowLeft,
  Sparkles,
  Bell,
  type LucideIcon,
} from "lucide-react";

/**
 * Three full-feature showcases that each get hero-style breathing room:
 * substantial copy + a detailed product mockup + a CTA. They alternate
 * layout (mockup left / right / left) for visual rhythm and replace the
 * compact 3-card ProductPreview grid.
 *
 * Stays within DESIGN.md: light surface, no decorative motion at rest,
 * entrance reveal only, all status colors via tokens.
 */
export default function FeatureShowcases() {
  return (
    <div className="relative">
      <SubmitShowcase />
      <TrackShowcase />
      <LearnShowcase />
    </div>
  );
}

/* ─────────────────────── Shared section primitives ─────────────────────── */

function FeatureSection({
  eyebrow,
  headline,
  highlight,
  description,
  bullets,
  cta,
  ctaHref,
  mockup,
  mockupSide,
}: {
  eyebrow: string;
  headline: string;
  highlight: string;
  description: string;
  bullets: { icon: LucideIcon; label: string }[];
  cta: string;
  ctaHref: string;
  mockup: React.ReactNode;
  mockupSide: "left" | "right";
}) {
  const reduce = useReducedMotion();
  const copyOrder = mockupSide === "right" ? "order-1 lg:order-1" : "order-1 lg:order-2";
  const mockupOrder = mockupSide === "right" ? "order-2 lg:order-2" : "order-2 lg:order-1";

  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`${copyOrder} text-right`}
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.15] text-foreground">
            {headline}{" "}
            <span className="text-primary">{highlight}</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-foreground/65 font-medium leading-relaxed max-w-xl">
            {description}
          </p>

          <ul className="mt-7 space-y-3">
            {bullets.map((b) => (
              <li key={b.label} className="flex items-start gap-3 text-sm sm:text-base">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-3.5 h-3.5 text-primary" />
                </span>
                <span className="font-medium text-foreground/85">{b.label}</span>
              </li>
            ))}
          </ul>

          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold text-base ds-shadow-sm hover:bg-accent transition-colors"
          >
            {cta}
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className={`${mockupOrder} relative`}
        >
          {/* Decorative offset card behind */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-primary/8 -rotate-[2deg] translate-x-3 translate-y-3"
          />
          <div className="relative">{mockup}</div>
        </motion.div>
      </div>
    </section>
  );
}

function MockupFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl bg-card overflow-hidden ds-border shadow-[0_20px_50px_-20px_rgba(31,92,46,0.25)]"
      aria-hidden
    >
      {children}
    </div>
  );
}

function MockupHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-5 pb-4 border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
      <h3 className="text-base font-extrabold text-foreground">{title}</h3>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

/* ─────────────────────── Showcase 1: Submit ─────────────────────── */

function SubmitShowcase() {
  return (
    <FeatureSection
      eyebrow="الخطوة الأولى"
      headline="قدّم فكرتك في"
      highlight="دقائق"
      description="اختر نوع احتضانك من ثلاثة مسارات، عبّي التفاصيل بنموذج ذكي يكشف الحقول حسب نوع المشروع، وأرسله مباشرة للمشرف الأكاديمي. ما تحتاج تنزل من مكتب لمكتب — كل خطوة رقمية."
      bullets={[
        { icon: Lightbulb, label: "ثلاثة أنواع: فكرة ريادية، مشروع IT، أو مشروع للجامعة" },
        { icon: FileText, label: "نموذج تكيّفي — يطلب فقط ما يحتاجه نوع مشروعك" },
        { icon: Send, label: "ارفع PDF أو فيديو تعريفي مع طلبك" },
      ]}
      cta="ابدأ تقديمك"
      ctaHref="/register"
      mockupSide="right"
      mockup={<SubmitMockup />}
    />
  );
}

function SubmitMockup() {
  return (
    <MockupFrame>
      <MockupHeader title="طلب احتضان جديد" subtitle="عبّي البيانات وأرسلها للمراجعة" />
      <div className="p-6 space-y-5">
        <div>
          <div className="text-xs font-bold text-foreground/65 mb-2">نوع الاحتضان</div>
          <div className="grid grid-cols-3 gap-2">
            <TypeChip icon={Lightbulb} label="فكرة ريادية" desc="فكرة تجارية" active />
            <TypeChip icon={FileText} label="مشروع IT" desc="مشروع تقني" />
            <TypeChip icon={GraduationCap} label="للجامعة" desc="يخدم الجامعة" />
          </div>
        </div>
        <MockField label="اسم المشروع" value="بستان الزيتون الذكي" />
        <MockTextarea
          label="وصف الفكرة"
          value="نظام ري ذكي يستعمل مستشعرات الرطوبة لتقنين استهلاك المياه في مزارع الزيتون الأردنية. الفكرة تستهدف المزارعين الصغار..."
        />
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-xs font-bold text-muted-foreground">المرحلة 1 من 3</span>
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-bold text-sm">
            متابعة
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ─────────────────────── Showcase 2: Track ─────────────────────── */

function TrackShowcase() {
  return (
    <FeatureSection
      eyebrow="بعد التقديم"
      headline="اعرف حالة طلبك"
      highlight="في الحال"
      description="إشعار لحظي مع كل قرار من المشرف. اقرأ ملاحظاته بالتفصيل، عدّل وأعد التقديم لو احتاج تعديل، أو احتفل بالقبول. كل تحديث يصلك فوراً بدون انتظار."
      bullets={[
        { icon: Bell, label: "إشعارات فورية عند كل تغيير حالة" },
        { icon: TrendingUp, label: "ملاحظات تفصيلية من المشرف الأكاديمي" },
        { icon: CheckCircle2, label: "خمس حالات واضحة: مسودة، مراجعة، تعديل، قبول، رفض" },
      ]}
      cta="استعرض لوحتك"
      ctaHref="/student"
      mockupSide="left"
      mockup={<TrackMockup />}
    />
  );
}

function TrackMockup() {
  return (
    <MockupFrame>
      <MockupHeader title="طلباتي" subtitle="تابع كل مشاريعك في مكان واحد" />
      <ul className="divide-y divide-border/40">
        <TrackRow
          name="بستان الزيتون الذكي"
          type="فكرة ريادية"
          status="accepted"
          time="قُبل قبل يومين"
          highlight
        />
        <TrackRow
          name="منصة دروس تفاعلية"
          type="مشروع IT"
          status="under_review"
          time="بانتظار المراجعة"
        />
        <TrackRow
          name="نظام إدارة الفعاليات"
          type="للجامعة"
          status="needs_modification"
          time="ملاحظتان من المشرف"
        />
      </ul>
      <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
        <div className="text-xs">
          <span className="font-extrabold text-foreground">3 طلبات</span>
          <span className="text-muted-foreground font-medium"> · 1 مقبول · 1 قيد المراجعة · 1 يحتاج تعديل</span>
        </div>
        <span className="text-xs font-extrabold text-primary">طلب جديد +</span>
      </div>
    </MockupFrame>
  );
}

function TrackRow({
  name,
  type,
  status,
  time,
  highlight = false,
}: {
  name: string;
  type: string;
  status: "under_review" | "accepted" | "needs_modification";
  time: string;
  highlight?: boolean;
}) {
  const chipMap = {
    under_review: {
      label: "قيد المراجعة",
      cls: "bg-status-pending/15 text-status-pending border-status-pending/30",
      Icon: Clock,
    },
    accepted: {
      label: "مقبول",
      cls: "bg-status-accepted/15 text-status-accepted border-status-accepted/30",
      Icon: CheckCircle2,
    },
    needs_modification: {
      label: "يحتاج تعديل",
      cls: "bg-status-modification/15 text-status-modification border-status-modification/30",
      Icon: TrendingUp,
    },
  } as const;
  const chip = chipMap[status];

  return (
    <li className={`flex items-center justify-between gap-3 p-4 ${highlight ? "bg-status-accepted/5" : ""}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          {type} · {time}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${chip.cls} shrink-0`}
      >
        <chip.Icon className="w-3 h-3" />
        {chip.label}
      </span>
    </li>
  );
}

/* ─────────────────────── Showcase 3: Learn ─────────────────────── */

function LearnShowcase() {
  return (
    <FeatureSection
      eyebrow="مكتبة المعرفة"
      headline="محتوى من مشرفيك،"
      highlight="خاص لطلابك"
      description="مقالات وأدلّة وفيديوهات يكتبها المشرفون أنفسهم — مش محتوى عام من الإنترنت، بل توجيه مفصّل للسياق الأكاديمي والريادي في جامعة الزيتونة الأردنية تحديداً."
      bullets={[
        { icon: BookOpen, label: "مقالات متخصّصة في كتابة المشاريع وخطط العمل" },
        { icon: PlayCircle, label: "فيديوهات تعليمية في الريادة ونماذج العمل" },
        { icon: Compass, label: "دليل ريادي خطوة بخطوة لتأسيس شركة" },
      ]}
      cta="تصفّح المكتبة"
      ctaHref="/student/articles"
      mockupSide="right"
      mockup={<LearnMockup />}
    />
  );
}

function LearnMockup() {
  return (
    <MockupFrame>
      <MockupHeader title="مقالات والدليل الريادي" subtitle="محتوى يكتبه المشرفون لطلابهم" />
      <ul className="divide-y divide-border/40">
        <ArticleRow
          icon={BookOpen}
          tone="text-info"
          tag="مقال"
          title="كيف تكتب وصف مشروع يقنع المشرف؟"
          author="مشرف الحاضنة"
          readTime="٥ دقائق قراءة"
        />
        <ArticleRow
          icon={PlayCircle}
          tone="text-status-modification"
          tag="فيديو"
          title="نموذج العمل التجاري للمشاريع الطلابية"
          author="الدليل الريادي"
          readTime="١٢ دقيقة"
        />
        <ArticleRow
          icon={Compass}
          tone="text-secondary"
          tag="دورة"
          title="خطوات تأسيس شركة ناشئة في الأردن"
          author="الدليل الريادي"
          readTime="٨ وحدات"
        />
      </ul>
      <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
        <div className="text-xs">
          <span className="font-extrabold text-foreground">مكتبة متجدّدة</span>
          <span className="text-muted-foreground font-medium"> · مقالات + فيديو + دورات + روابط</span>
        </div>
        <span className="text-xs font-extrabold text-primary">عرض الكل ←</span>
      </div>
    </MockupFrame>
  );
}

function ArticleRow({
  icon: Icon,
  tone,
  tag,
  title,
  author,
  readTime,
}: {
  icon: LucideIcon;
  tone: string;
  tag: string;
  title: string;
  author: string;
  readTime: string;
}) {
  return (
    <li className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
      <div className={`w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold text-foreground/55 tracking-wide uppercase">
            {tag}
          </span>
          <span className="w-1 h-1 rounded-full bg-foreground/30" />
          <span className="text-[10px] font-bold text-muted-foreground">{readTime}</span>
        </div>
        <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{title}</p>
        <p className="text-xs text-muted-foreground font-medium mt-1">{author}</p>
      </div>
    </li>
  );
}

/* ─────────────────────── Mockup primitives ─────────────────────── */

function TypeChip({
  icon: Icon,
  label,
  desc,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/40 text-foreground/70 ds-border"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-bold">{label}</span>
      <span className={`text-[9px] font-medium ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {desc}
      </span>
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-foreground/65 mb-1.5">{label}</div>
      <div className="ds-input !py-2.5 text-sm text-foreground bg-card font-medium truncate">{value}</div>
    </div>
  );
}

function MockTextarea({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-foreground/65 mb-1.5">{label}</div>
      <div className="ds-input !py-3 text-sm text-foreground bg-card font-medium leading-relaxed line-clamp-3">
        {value}
      </div>
    </div>
  );
}
