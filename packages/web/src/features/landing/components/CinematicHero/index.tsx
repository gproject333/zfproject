"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Rocket, LogIn, LayoutDashboard, ArrowLeft } from "lucide-react";

interface CinematicHeroProps {
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

/**
 * Light, calm, generous hero modeled after cache-team.com:
 *
 *  - Soft on-brand background with a faint dotted grid overlay.
 *  - One enormous fluid headline; the brand phrase is rendered as a
 *    horizontal gradient text (foreground → primary), nothing else competes.
 *  - One sub-headline, two CTAs (solid primary + outline), three pillar chips.
 *  - Lots of vertical breathing room; collapses to a single column with
 *    smaller type and looser CTAs on phones.
 *
 * Motion is staggered fade-up with reduced-motion fallback.
 */
export default function CinematicHero({
  dashboardHref = "/student",
  userName,
  authReady = false,
  isSignedIn = false,
}: CinematicHeroProps) {
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section
      dir="rtl"
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Faint dotted grid — calm, technical, never noisy. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, var(--foreground) 6%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 6%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 100%)",
        }}
      />

      {/* Soft brand glow behind the headline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/3 -z-10 h-[420px] pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-28 sm:pt-36 pb-20 sm:pb-28 text-center">
        {/* Eyebrow */}
        <motion.div
          {...fadeUp(0.05)}
          className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-primary/85 mb-7"
        >
          <span className="w-7 h-px bg-primary/40" />
          ZUJ Incubator · حاضنة الزيتونة
          <span className="w-7 h-px bg-primary/40" />
        </motion.div>

        {/* Massive headline with gradient brand phrase */}
        <motion.h1
          {...fadeUp(0.18)}
          className="font-black leading-[1.35] sm:leading-[1.3] text-foreground text-[clamp(2.25rem,7.5vw,5.75rem)]"
        >
          <span className="inline-block pb-2">من فكرة طالب</span>
          <br />
          <span
            className="inline-block bg-clip-text text-transparent pb-2"
            style={{
              backgroundImage:
                "linear-gradient(to left, var(--foreground) 10%, var(--primary) 65%, var(--accent) 100%)",
            }}
          >
            إلى مشروع معتمد
          </span>
        </motion.h1>

        {/* One subline, narrow column for comfortable reading */}
        <motion.p
          {...fadeUp(0.32)}
          className="mt-7 sm:mt-8 mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-foreground/65 leading-relaxed font-medium"
        >
          منصة رسمية تابعة لجامعة الزيتونة الأردنية تتيح للطالب تقديم مشروعه إلى
          مشرف أكاديمي ومتابعته خطوة بخطوة حتى الاعتماد.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.46)}
          className="mt-10 sm:mt-12 flex flex-col-reverse sm:flex-row-reverse items-stretch sm:items-center justify-center gap-3 sm:gap-4"
        >
          {!authReady ? (
            <div className="w-full sm:w-56 h-14 rounded-full bg-foreground/5 animate-pulse" />
          ) : isSignedIn ? (
            <Link
              href={dashboardHref}
              className="group inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-4 rounded-full bg-foreground text-background font-extrabold text-base shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--foreground)_50%,transparent)] hover:shadow-[0_18px_44px_-12px_color-mix(in_srgb,var(--foreground)_60%,transparent)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <LayoutDashboard className="w-5 h-5" />
              {userName ? `لوحة ${userName}` : "اذهب إلى لوحتي"}
              <ArrowLeft className="w-4 h-4 -mr-1 transition-transform group-hover:-translate-x-1" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-4 rounded-full bg-foreground text-background font-extrabold text-base shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--foreground)_50%,transparent)] hover:shadow-[0_18px_44px_-12px_color-mix(in_srgb,var(--foreground)_60%,transparent)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 transition-transform group-hover:-rotate-12" />
                إنشاء حساب جديد
                <ArrowLeft className="w-4 h-4 -mr-1 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-4 rounded-full bg-transparent text-foreground font-bold text-base border-2 border-foreground/15 hover:bg-foreground/5 hover:border-foreground/30 transition-all duration-300"
              >
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </Link>
            </>
          )}
        </motion.div>

        {/* Pillar chips */}
        <motion.ul
          {...fadeUp(0.6)}
          className="mt-14 sm:mt-20 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold"
        >
          {[
            { label: "ثلاثة مسارات احتضان", dot: "var(--primary)" },
            { label: "إشراف أكاديمي معتمد", dot: "var(--accent)" },
            { label: "شراكات مع جهات داعمة", dot: "var(--secondary)" },
          ].map(({ label, dot }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/30 text-foreground/75"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: dot }}
              />
              {label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
