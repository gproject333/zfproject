"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Quote, GraduationCap, Leaf, Star, Users, Building2 } from "lucide-react";

/**
 * Testimonials section: a centered hero quote that auto-rotates every 8s,
 * a small trust strip above the title, and a slow marquee row of the
 * remaining quotes below. The hero quote carries the emotional weight;
 * the marquee fills out the social proof without competing for attention.
 *
 * Cards in the marquee still use the existing glass + tone-tinted left
 * border so the visual vocabulary stays consistent with the rest of the
 * landing page.
 */

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  tone: "primary" | "secondary" | "accent";
  rating?: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "أحمد الخطيب",
    role: "طالب ريادة أعمال",
    quote:
      "حاضنة الزيتونة ساعدتني على تحويل فكرتي من مجرد مشروع تخرج إلى شركة ناشئة حقيقية. الدعم الأكاديمي والإرشاد كانا لا يقدران بثمن.",
    tone: "primary",
    rating: 5,
  },
  {
    name: "سارة المحمود",
    role: "مشروع تخرج IT",
    quote:
      "التقديم الرقمي والمتابعة المباشرة مع المشرفين جعلا العملية سلسة جداً. أنصح كل طالب بتجربة المنصة.",
    tone: "secondary",
    rating: 5,
  },
  {
    name: "محمد العبادي",
    role: "مشروع يخدم الجامعة",
    quote:
      "حصلت على ملاحظات بنّاءة من المشرفين خلال أيام، وتم قبول مشروعي بسرعة. تجربة ممتازة من البداية إلى النهاية.",
    tone: "accent",
    rating: 5,
  },
  {
    name: "ليال الزعبي",
    role: "تخرج هندسة برمجيات",
    quote:
      "الواجهة بسيطة وواضحة، ولوحة المتابعة خلتني أعرف بالضبط وين مشروعي بكل مرحلة. شكراً للفريق.",
    tone: "primary",
    rating: 5,
  },
  {
    name: "خالد الرفاعي",
    role: "ريادي شاب",
    quote:
      "وجدت في المنصة المكان المناسب للحوار مع المشرفين وتطوير فكرتي خطوة بخطوة، وانتهت بحصولي على تمويل أولي.",
    tone: "secondary",
    rating: 5,
  },
];

const TRUST_STATS: { icon: typeof Users; value: string; label: string }[] = [
  { icon: Users, value: "+١٠٠", label: "طالب على المنصة" },
  { icon: GraduationCap, value: "+٥٠", label: "مشروع مقبول" },
  { icon: Building2, value: "+٢٠", label: "راعٍ من القطاع الخاص" },
];

const ROTATE_MS = 8000;

export default function Testimonials() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  return (
    <section className="px-4 py-20 sm:py-28 overflow-hidden bg-muted/30 dark:bg-muted/40">
      <div className="max-w-6xl mx-auto">
        {/* Trust stats strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-10">
          {TRUST_STATS.map((s) => (
            <div
              key={s.label}
              className="text-center rounded-2xl bg-card/70 backdrop-blur ds-border p-4 sm:p-5"
            >
              <s.icon className="w-5 h-5 mx-auto text-primary mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight tabular-nums">
                {s.value}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-bold mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mb-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            ماذا يقول طلابنا
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            قصص نجاح <span className="text-primary">ملهمة</span>
          </h2>
        </div>

        {/* Featured hero quote — auto-rotates */}
        <div
          className="relative max-w-3xl mx-auto mb-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <FeaturedQuote
            t={TESTIMONIALS[active]}
            reduce={reduce ?? false}
            keyId={active}
          />
          <Dots
            count={TESTIMONIALS.length}
            activeIndex={active}
            onSelect={setActive}
          />
        </div>
      </div>

      {/* Slower marquee row of the remaining quotes — sized down so it
          plays as ambient social proof instead of competing with the
          featured card. */}
      <div className="relative ds-marquee-track">
        <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-muted/30 dark:from-muted/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-muted/30 dark:from-muted/40 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-5 py-2" style={{ animationDuration: "75s" }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-stretch gap-5 shrink-0 px-3">
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

function FeaturedQuote({
  t,
  reduce,
  keyId,
}: {
  t: Testimonial;
  reduce: boolean;
  keyId: number;
}) {
  return (
    <div className="relative rounded-3xl bg-card ds-border-thick shadow-[0_30px_60px_-25px_rgba(31,92,46,0.25)] overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-25"
        style={{ background: `var(--color-${t.tone})` }}
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{ background: `var(--color-${t.tone})` }}
      />

      <div className="relative p-8 sm:p-12 text-center">
        <Quote
          className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-5 opacity-30"
          style={{ color: `var(--color-${t.tone})` }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={keyId}
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -10 }}
            transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-lg sm:text-2xl font-bold leading-[1.7] text-foreground/90 max-w-2xl mx-auto mb-7">
              «{t.quote}»
            </p>

            {/* Star rating */}
            {t.rating && (
              <div className="flex items-center justify-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.rating! ? "fill-status-pending text-status-pending" : "text-foreground/15"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center text-base font-black text-white ring-4 ring-card shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--color-${t.tone}), color-mix(in srgb, var(--color-${t.tone}) 55%, white))`,
                }}
              >
                {t.name.charAt(0)}
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card flex items-center justify-center"
                >
                  <Leaf
                    className="w-3 h-3"
                    style={{ color: `var(--color-${t.tone})` }}
                  />
                </span>
              </div>
              <div className="text-start">
                <p className="text-sm sm:text-base font-extrabold leading-tight">
                  {t.name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-bold mt-0.5">
                  {t.role}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Dots({
  count,
  activeIndex,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2" role="tablist">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`القصة ${i + 1}`}
            onClick={() => onSelect(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active ? "w-8 bg-primary" : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
            }`}
          />
        );
      })}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article
      className="relative shrink-0 w-[300px] sm:w-[360px] glass rounded-2xl ring-1 ring-foreground/10 p-5 overflow-hidden"
      style={{ borderInlineStart: `3px solid var(--color-${t.tone})` }}
    >
      <div
        aria-hidden
        className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-15"
        style={{ background: `var(--color-${t.tone})` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <Quote className="w-6 h-6 text-primary/30" />
          <Leaf className={`w-3.5 h-3.5 text-${t.tone}/60`} />
        </div>
        <p className="text-sm font-medium leading-relaxed text-foreground/85 mb-4 line-clamp-4 min-h-[5rem]">
          «{t.quote}»
        </p>
        <div className="flex items-center gap-3 pt-3 border-t border-foreground/10">
          <div
            className="w-9 h-9 rounded-full ring-2 ring-background flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--color-${t.tone}), color-mix(in srgb, var(--color-${t.tone}) 55%, white))`,
            }}
          >
            {t.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold leading-tight truncate">
              {t.name}
            </p>
            <p className="text-[11px] text-foreground/55 font-bold truncate">
              {t.role}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
