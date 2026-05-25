"use client";

import { useRef, type ReactElement } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Sprout, Leaf, Trees, Award, type LucideIcon, Mail, FileText, CheckCircle2, Bell, Sparkles, Lightbulb, GraduationCap } from "lucide-react";

/**
 * Growth-metaphor timeline. Each stage of the student journey mirrors a
 * stage in the life of an olive tree: seed → sapling → mature tree → harvest.
 * A vertical line on the start-edge (right in RTL) fills as the user scrolls
 * through the section. Steps fade-up individually as they enter view; each
 * step pairs its descriptive copy with a small product snippet (signup card,
 * form field, status notification, dashboard tile) so the visitor sees the
 * actual screens, not just abstract icons.
 */

interface Stage {
  num: string;
  title: string;
  desc: string;
  metaphor: string;
  icon: LucideIcon;
  snippet: () => ReactElement;
}

const STAGES: Stage[] = [
  {
    num: "١",
    title: "تسجيل الطالب",
    desc: "يُنشئ الطالب حسابه الرسمي على المنصة باستخدام البريد الجامعي المعتمد، للوصول إلى لوحة التحكم الأكاديمية.",
    metaphor: "تسجيل الطالب",
    icon: Sprout,
    snippet: SignupSnippet,
  },
  {
    num: "٢",
    title: "تقديم ملف المشروع",
    desc: "يقوم الطالب باختيار نوع الاحتضان المناسب (فكرة ريادية / مشروع IT / مشروع يخدم الجامعة) وتعبئة نموذج الطلب وفق المتطلبات الرسمية.",
    metaphor: "تقديم ملف المشروع",
    icon: Leaf,
    snippet: ApplicationSnippet,
  },
  {
    num: "٣",
    title: "المراجعة الأكاديمية",
    desc: "يتولّى المشرف الأكاديمي دراسة ملف المشروع وتقييمه وفق المعايير المعتمدة، ثم يُبلَّغ الطالب بالنتيجة خلال مدة وجيزة.",
    metaphor: "المراجعة الأكاديمية",
    icon: Trees,
    snippet: ReviewSnippet,
  },
  {
    num: "٤",
    title: "اعتماد المشروع والبدء في التنفيذ",
    desc: "بعد اعتماد المشروع رسميًّا، يشرع الطالب في تنفيذه بإشراف الفريق الأكاديمي وبالاستفادة من الأدوات المتاحة على المنصة.",
    metaphor: "اعتماد المشروع",
    icon: Award,
    snippet: DashboardSnippet,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 50%"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]);

  return (
    <section ref={sectionRef} className="relative px-4 py-20 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            إجراءات{" "}
            <span className="text-primary">الاحتضان الأكاديمي</span>
          </h2>
          <p className="text-foreground/60 mt-4 text-base sm:text-lg">
            تعتمد الحاضنة منهجية واضحة تضمن سير المشروع داخل إطار أكاديمي منضبط، عبر أربع مراحل متسلسلة.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute top-8 bottom-8 right-[23px] sm:right-[27px] w-0.5 bg-foreground/10 rounded-full"
          />
          <motion.div
            aria-hidden
            className="absolute top-8 right-[23px] sm:right-[27px] w-0.5 origin-top rounded-full shadow-[0_0_12px_rgba(31,92,46,0.4)]"
            style={{
              bottom: 32,
              scaleY: lineScaleY,
              background: "linear-gradient(to bottom, var(--color-primary), var(--color-accent), var(--color-secondary))",
            }}
          />

          <ul className="space-y-12 sm:space-y-14">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const Snippet = stage.snippet;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: reduce ? 0 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative pr-16 sm:pr-20"
                >
                  <div className="absolute right-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white ring-2 ring-primary/25 flex items-center justify-center shadow-lg shadow-primary/15">
                    <Icon className="relative w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                  </div>

                  <div className="grid sm:grid-cols-[1fr_auto] gap-5 sm:gap-8 items-start">
                    <div className="pt-1">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className="text-xs font-black text-primary tracking-widest">
                          {stage.metaphor}
                        </span>
                        <span className="text-[10px] font-bold text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full">
                          المرحلة {stage.num}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black mb-2 leading-tight">
                        {stage.title}
                      </h3>
                      <p className="text-foreground/65 dark:text-foreground/75 text-sm sm:text-base font-medium leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>

                    {/* Product snippet — sits beside the text on desktop, below on mobile. */}
                    <div className="w-full sm:w-72" aria-hidden>
                      <Snippet />
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Stage snippets ─────────────────────── */

function SnippetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card ds-border p-4 shadow-[0_4px_16px_-8px_rgba(31,92,46,0.15)]">
      {children}
    </div>
  );
}

function SignupSnippet() {
  return (
    <SnippetCard>
      <div className="text-[10px] font-extrabold text-foreground/55 tracking-wide mb-3">
        إنشاء حساب
      </div>
      <div className="space-y-2.5">
        <MiniField icon={Mail} value="ahmed@std-zuj.edu.jo" mono />
        <MiniField icon={GraduationCap} value="••••••••" />
        <div className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          إنشاء الحساب
        </div>
      </div>
    </SnippetCard>
  );
}

function ApplicationSnippet() {
  return (
    <SnippetCard>
      <div className="text-[10px] font-extrabold text-foreground/55 tracking-wide mb-3">
        تقديم طلب جديد
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <TypeChip icon={Lightbulb} label="فكرة ريادية" active />
        <TypeChip icon={FileText} label="مشروع IT" />
        <TypeChip icon={GraduationCap} label="للجامعة" />
      </div>
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-foreground/60">اسم المشروع</div>
        <div className="text-[11px] font-medium px-3 py-2 ds-border rounded-md bg-card text-foreground truncate">
          نظام إدارة المخزون الذكي
        </div>
      </div>
    </SnippetCard>
  );
}

function ReviewSnippet() {
  return (
    <SnippetCard>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-extrabold text-foreground/65 tracking-wide">
          إشعار جديد
        </span>
      </div>
      <p className="text-xs font-bold text-foreground mb-2 leading-snug">
        تم قبول طلبك &quot;نظام إدارة المخزون الذكي&quot;
      </p>
      <p className="text-[11px] text-muted-foreground font-medium mb-3 leading-relaxed line-clamp-2">
        راجع المشرف الأكاديمي طلبك ووافق عليه. تابع التحديثات في لوحتك.
      </p>
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border bg-status-accepted/15 text-status-accepted border-status-accepted/30">
        <CheckCircle2 className="w-3 h-3" />
        مقبول
      </span>
    </SnippetCard>
  );
}

function DashboardSnippet() {
  return (
    <SnippetCard>
      <div className="text-[10px] font-extrabold text-foreground/55 tracking-wide mb-3">
        لوحة الطالب
      </div>
      <div className="bg-muted/40 rounded-lg p-3 ds-border mb-3">
        <p className="text-[10px] font-bold text-foreground/60 mb-1">مشروعك الحالي</p>
        <p className="text-xs font-extrabold text-foreground mb-2">نظام إدارة المخزون الذكي</p>
        <div className="flex h-1 rounded-full overflow-hidden bg-muted">
          <div className="bg-status-accepted" style={{ width: "100%" }} />
        </div>
        <p className="text-[10px] font-bold text-success mt-1.5">قُبل بنجاح ✓</p>
      </div>
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="text-muted-foreground">الخطوة التالية</span>
        <span className="text-primary">ابدأ التنفيذ ←</span>
      </div>
    </SnippetCard>
  );
}

/* ─────────────────────── Shared primitives ─────────────────────── */

function MiniField({
  icon: Icon,
  value,
  mono = false,
}: {
  icon: LucideIcon;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      <div
        className={`text-[11px] font-medium px-3 pr-8 py-2 ds-border rounded-md bg-card text-foreground truncate ${
          mono ? "font-mono" : ""
        }`}
        dir={mono ? "ltr" : "rtl"}
      >
        {value}
      </div>
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
      className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-md text-[9px] font-bold transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground/70 ds-border"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}
