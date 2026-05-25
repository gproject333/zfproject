"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Quote, Leaf, Star, Users, GraduationCap, Building2 } from "lucide-react";

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
    name: "محمد العبادي",
    role: "مشروع يخدم الجامعة",
    quote:
      "تلقّيتُ ملاحظات أكاديمية مفصَّلة من المشرف خلال أيام، واعتُمد مشروعي وفق الإجراءات المعتمدة في الحاضنة.",
    tone: "accent",
    rating: 5,
  },
  {
    name: "خالد الرفاعي",
    role: "مسار فكرة ريادية",
    quote:
      "أتاحت لي المنصة التواصل المنهجي مع المشرف الأكاديمي وتطوير المشروع بصورة متدرجة، حتى الحصول على دعم من إحدى الجهات الداعمة.",
    tone: "secondary",
    rating: 5,
  },
];

const TRUST_STATS: { icon: typeof Users; value: string; label: string }[] = [
  { icon: Users, value: "+١٠٠", label: "طالب مسجَّل على المنصة" },
  { icon: GraduationCap, value: "+٥٠", label: "مشروع معتمد" },
  { icon: Building2, value: "+٢٠", label: "جهة داعمة" },
];

const ROTATE_MS = 3500;

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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            شهادات <span className="text-primary">الطلبة</span>
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

