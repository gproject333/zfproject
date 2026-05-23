"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Lightbulb,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  TrendingUp,
  GraduationCap,
  BookOpen,
  PlayCircle,
  Compass,
  type LucideIcon,
} from "lucide-react";

/**
 * Landing's "show, don't tell" section. Three stylised previews of the
 * actual student-facing screens — submit, track, learn. The landing is
 * public and student-led, so the previews focus on what a prospective
 * student will actually use (not on supervisor/admin internals).
 *
 * The previews are React markup, not real screenshots, so they stay in
 * sync with the design tokens automatically.
 *
 * DESIGN.md context:
 *  - Stays light (Olive Reading Room), no dark gradient backdrop.
 *  - Uses status tokens for the chips (Status-Five Rule).
 *  - Decorative motion limited to entrance reveal — landing is brand
 *    register so motion is allowed here, but each preview is static at
 *    rest (no perpetual loops).
 */
export default function ProductPreview() {
  const reduce = useReducedMotion();

  const items: Array<{
    component: () => React.ReactElement;
    label: string;
    icon: LucideIcon;
  }> = [
    { component: SubmitApplicationPreview, label: "قدّم فكرتك", icon: Send },
    { component: TrackApplicationsPreview, label: "تابع طلباتك", icon: TrendingUp },
    { component: LearnFromSupervisorsPreview, label: "تعلّم من الخبراء", icon: BookOpen },
  ];

  return (
    <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            ماذا ستفعل على المنصة
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            ثلاث خطوات من فكرة{" "}
            <span className="text-primary">إلى مشروع</span>
          </h2>
          <p className="text-foreground/60 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
            هذه الشاشات الثلاث الأساسية اللي رح تستعملها كطالب — قدّم، تابع، تعلّم.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const Preview = item.component;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                className="flex flex-col gap-3"
              >
                <div className="text-xs font-extrabold text-foreground/55 flex items-center gap-1.5 tracking-wide">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </div>
                <Preview />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── Preview 1: Submit your application ───────────────── */

function SubmitApplicationPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader title="تقديم طلب احتضان" subtitle="املأ التفاصيل وأرسلها للمراجعة" />
      <div className="p-5 space-y-4">
        <div>
          <div className="text-[11px] font-bold text-foreground/65 mb-2">نوع الاحتضان</div>
          <div className="grid grid-cols-3 gap-1.5">
            <TypeChip icon={Lightbulb} label="ريادي" active />
            <TypeChip icon={FileText} label="تخرّج IT" />
            <TypeChip icon={GraduationCap} label="جامعي" />
          </div>
        </div>
        <MockField label="اسم المشروع" value="بستان الزيتون الذكي" />
        <MockTextarea
          label="وصف الفكرة"
          value="نظام ري ذكي يستعمل مستشعرات الرطوبة لتقنين استهلاك المياه في مزارع الزيتون..."
        />
        <button
          type="button"
          aria-disabled
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm pointer-events-none"
        >
          <Send className="w-4 h-4" />
          إرسال للمراجعة
        </button>
      </div>
    </PreviewFrame>
  );
}

/* ──────────────────── Preview 2: Track your applications ───────────────── */

function TrackApplicationsPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader title="طلباتي" subtitle="تابع حالة كل مشاريعك في مكان واحد" />
      <ul className="divide-y divide-border/40">
        <MyApplicationRow
          name="بستان الزيتون الذكي"
          type="ريادي"
          status="accepted"
          time="قُبل قبل يومين"
        />
        <MyApplicationRow
          name="منصة دروس تفاعلية"
          type="تخرّج IT"
          status="under_review"
          time="بانتظار المراجعة"
        />
        <MyApplicationRow
          name="نظام إدارة الفعاليات"
          type="جامعي"
          status="needs_modification"
          time="يحتاج تعديل"
        />
      </ul>
      <div className="p-3 border-t border-border/40 bg-muted/40 flex items-center justify-between text-[11px] font-bold">
        <span className="text-muted-foreground">3 طلبات</span>
        <span className="text-primary">طلب جديد +</span>
      </div>
    </PreviewFrame>
  );
}

function MyApplicationRow({
  name,
  type,
  status,
  time,
}: {
  name: string;
  type: string;
  status: "under_review" | "accepted" | "needs_modification";
  time: string;
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
    <li className="flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold truncate text-foreground">{name}</p>
        <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
          {type} · {time}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${chip.cls} shrink-0`}
      >
        <chip.Icon className="w-3 h-3" />
        {chip.label}
      </span>
    </li>
  );
}

/* ───────────────── Preview 3: Learn from supervisors ──────────────────── */

function LearnFromSupervisorsPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader title="مقالات ودليل ريادي" subtitle="محتوى يكتبه المشرفون لطلابهم" />
      <ul className="divide-y divide-border/40">
        <ArticleRow
          icon={BookOpen}
          tone="text-info"
          tag="مقال"
          title="كيف تكتب وصف مشروع يقنع المشرف؟"
          author="د. أحمد محمد"
        />
        <ArticleRow
          icon={PlayCircle}
          tone="text-status-modification"
          tag="فيديو"
          title="نموذج العمل التجاري للمشاريع الطلابية"
          author="د. سارة الحجاج"
        />
        <ArticleRow
          icon={Compass}
          tone="text-secondary"
          tag="دليل"
          title="خطوات تأسيس شركة ناشئة في الأردن"
          author="مكتب الريادة"
        />
      </ul>
      <div className="p-3 border-t border-border/40 bg-muted/40 flex items-center justify-between text-[11px] font-bold">
        <span className="text-muted-foreground">+ 18 مقالاً</span>
        <span className="text-primary">عرض الكل ←</span>
      </div>
    </PreviewFrame>
  );
}

function ArticleRow({
  icon: Icon,
  tone,
  tag,
  title,
  author,
}: {
  icon: LucideIcon;
  tone: string;
  tag: string;
  title: string;
  author: string;
}) {
  return (
    <li className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors">
      <div className={`w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-extrabold text-foreground/55 tracking-wide uppercase">
            {tag}
          </span>
        </div>
        <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{title}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-1">{author}</p>
      </div>
    </li>
  );
}

/* ───────────────────────────── Shared primitives ───────────────────────── */

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl bg-card overflow-hidden ds-border shadow-[0_8px_28px_-12px_rgba(31,92,46,0.18)]"
      aria-hidden
    >
      {children}
    </div>
  );
}

function PreviewHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-5 pt-5 pb-4 border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
      <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

function TypeChip({
  icon: Icon,
  label,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 py-2 px-2 rounded-md text-[10px] font-bold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/50 text-foreground/70 ds-border"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-foreground/65 mb-1.5">{label}</div>
      <div className="ds-input !py-2 !text-xs text-foreground bg-card font-medium truncate">
        {value}
      </div>
    </div>
  );
}

function MockTextarea({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-foreground/65 mb-1.5">{label}</div>
      <div className="ds-input !py-2.5 !text-xs text-foreground bg-card font-medium leading-relaxed line-clamp-3">
        {value}
      </div>
    </div>
  );
}
