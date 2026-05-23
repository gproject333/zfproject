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
  Building2,
  ShieldCheck,
  Users,
} from "lucide-react";

/**
 * Landing's "show, don't tell" section. Three stylised previews — one per
 * persona — of the actual product screens (application form, supervisor
 * review queue, admin stats). The previews are React markup, not real
 * screenshots, so they stay in sync with the design tokens automatically.
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

  const items = [
    { component: <StudentFormPreview />, persona: "للطالب", icon: GraduationCap },
    { component: <SupervisorReviewPreview />, persona: "للمشرف الأكاديمي", icon: ShieldCheck },
    { component: <AdminStatsPreview />, persona: "لمشرف النظام", icon: Sparkles },
  ];

  return (
    <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            نظرة على المنصة
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            هكذا تبدو رحلتك على{" "}
            <span className="text-primary">حاضنة الزيتونة</span>
          </h2>
          <p className="text-foreground/60 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
            ثلاث شاشات حقيقية من المنصة، واحدة لكل دور — لتعرف ما الذي ستراه قبل أن تسجّل.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
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
                {item.persona}
              </div>
              {item.component}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Preview 1: Student form ─────────────────── */

function StudentFormPreview() {
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

/* ─────────────────────── Preview 2: Supervisor review ──────────────────── */

function SupervisorReviewPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader title="طلبات بانتظار مراجعتك" subtitle="3 طلبات جديدة هذا الأسبوع" />
      <ul className="divide-y divide-border/40">
        <ApplicationRow
          name="منصة دروس تفاعلية"
          student="أحمد محمد"
          status="under_review"
          time="قبل ساعتين"
        />
        <ApplicationRow
          name="تطبيق إدارة الفعاليات"
          student="ليلى ياسين"
          status="needs_modification"
          time="أمس"
        />
        <ApplicationRow
          name="نظام تخطيط الرحلات"
          student="عمر الخطيب"
          status="accepted"
          time="قبل 3 أيام"
        />
      </ul>
      <div className="p-3 border-t border-border/40 bg-muted/40 flex items-center justify-between text-[11px] font-bold">
        <span className="text-muted-foreground">عرض 3 من 12</span>
        <span className="text-primary">عرض الكل ←</span>
      </div>
    </PreviewFrame>
  );
}

function ApplicationRow({
  name,
  student,
  status,
  time,
}: {
  name: string;
  student: string;
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
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-extrabold text-primary">{student.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold truncate text-foreground">{name}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {student} · {time}
          </p>
        </div>
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

/* ──────────────────────── Preview 3: Admin stats ───────────────────────── */

function AdminStatsPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader title="لوحة الإدارة" subtitle="نظرة شاملة على المنصة" />
      <div className="p-5 space-y-4">
        <div className="bg-muted/40 rounded-lg p-4 ds-border">
          <p className="text-[11px] font-bold text-foreground/60 mb-1">معدل القبول</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-success tabular-nums">85%</span>
            <span className="text-[10px] font-bold text-muted-foreground">من 103 طلب</span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-status-accepted" style={{ width: "85%" }} />
            <div className="bg-status-rejected" style={{ width: "15%" }} />
          </div>
        </div>

        <ul className="space-y-2">
          <StatRow icon={GraduationCap} label="الطلاب المسجّلون" value="350" tone="text-info" />
          <StatRow icon={Users} label="المشرفون" value="24" tone="text-accent" />
          <StatRow icon={Building2} label="الرعاة" value="12" tone="text-secondary" />
        </ul>

        <div className="rounded-lg bg-primary/5 ds-border p-3 flex items-center gap-2 text-[11px] font-bold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          4 طلبات ترقية تنتظر مراجعتك
        </div>
      </div>
    </PreviewFrame>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs font-bold text-foreground">
        <Icon className={`w-3.5 h-3.5 ${tone}`} />
        {label}
      </span>
      <span className="text-lg font-extrabold tabular-nums">{value}</span>
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
  icon: typeof Lightbulb;
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
