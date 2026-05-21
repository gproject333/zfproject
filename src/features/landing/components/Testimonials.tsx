"use client";

import { Quote, GraduationCap, Leaf } from "lucide-react";

/**
 * Auto-scrolling testimonials carousel. Two duplicated tracks slide
 * horizontally via the existing `marquee` keyframes so the loop is
 * seamless. Hovering pauses motion (handled by `.nb-marquee-track:hover`).
 * Cards are glass with a tone-tinted left border and a small olive-leaf
 * accent — keeping the page's olive identity even in social proof.
 */

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  tone: "primary" | "secondary" | "accent";
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "أحمد الخطيب",
    role: "طالب ريادة أعمال",
    quote:
      "حاضنة الزيتونة ساعدتني على تحويل فكرتي من مجرد مشروع تخرج إلى شركة ناشئة حقيقية. الدعم الأكاديمي والإرشاد كانا لا يقدران بثمن.",
    tone: "primary",
  },
  {
    name: "سارة المحمود",
    role: "مشروع تخرج IT",
    quote:
      "التقديم الرقمي والمتابعة المباشرة مع المشرفين جعلا العملية سلسة جداً. أنصح كل طالب بتجربة المنصة.",
    tone: "secondary",
  },
  {
    name: "محمد العبادي",
    role: "مشروع يخدم الجامعة",
    quote:
      "حصلت على ملاحظات بنّاءة من المشرفين خلال أيام، وتم قبول مشروعي بسرعة. تجربة ممتازة من البداية إلى النهاية.",
    tone: "accent",
  },
  {
    name: "ليال الزعبي",
    role: "تخرج هندسة برمجيات",
    quote:
      "الواجهة بسيطة وواضحة، ولوحة المتابعة خلتني أعرف بالضبط وين مشروعي بكل مرحلة. شكراً للفريق.",
    tone: "primary",
  },
  {
    name: "خالد الرفاعي",
    role: "ريادي شاب",
    quote:
      "وجدت في المنصة المكان المناسب للحوار مع المشرفين وتطوير فكرتي خطوة بخطوة، وانتهت بحصولي على تمويل أولي.",
    tone: "secondary",
  },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article
      className={`relative shrink-0 w-[340px] sm:w-[420px] glass rounded-3xl ring-1 ring-foreground/10 p-6 sm:p-7 shadow-lg shadow-${t.tone}/5
                  overflow-hidden`}
      style={{ borderInlineStart: `4px solid var(--color-${t.tone})` }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -left-12 w-44 h-44 rounded-full blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, var(--color-${t.tone}) 0%, transparent 70%)` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <Quote className="w-8 h-8 text-primary/30" />
          <Leaf className={`w-4 h-4 text-${t.tone}/60`} />
        </div>
        <p className="text-sm sm:text-base font-medium leading-relaxed text-foreground/90 mb-5 min-h-[6rem]">
          &ldquo;{t.quote}&rdquo;
        </p>
        <div className="flex items-center gap-3 pt-4 border-t border-foreground/10">
          <div
            className="w-10 h-10 rounded-full ring-2 ring-background flex items-center justify-center text-sm font-black text-white"
            style={{
              background: `linear-gradient(135deg, var(--color-${t.tone}), color-mix(in srgb, var(--color-${t.tone}) 55%, white))`,
            }}
          >
            {t.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-extrabold leading-tight">{t.name}</p>
            <p className="text-xs text-foreground/55 font-bold">{t.role}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  return (
    <section className="px-4 py-20 sm:py-28 overflow-hidden bg-muted/30 dark:bg-muted/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            ماذا يقول طلابنا
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            قصص نجاح{" "}
            <span className="gradient-text">ملهمة</span>
          </h2>
        </div>
      </div>

      {/* Marquee row — full-bleed, with edge fades */}
      <div className="relative nb-marquee-track">
        <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-muted/30 dark:from-muted/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-0  w-24 sm:w-40 bg-gradient-to-r from-muted/30 dark:from-muted/40 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-6 py-2" style={{ animationDuration: "60s" }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-stretch gap-6 shrink-0 px-3">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={`${copy}-${i}`} t={t} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
