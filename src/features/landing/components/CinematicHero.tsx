"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Rocket,
  LogIn,
  LayoutDashboard,
  Lightbulb,
  FileText,
  GraduationCap,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface CinematicHeroProps {
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

/**
 * Landing hero. Split layout: copy + CTAs on the right (RTL primary), a
 * stylised product mockup on the left. Light Olive Mist background with
 * soft tinted orbs — no full-bleed Unsplash photo, no Ken Burns, no
 * Lenis/GSAP choreography. The previous version was visually striking
 * but heavy (Lenis + ScrollTrigger + masked-text reveals) and showed
 * the brand without ever showing the product. This version shows both,
 * and respects DESIGN.md's "Trust over flash" + "Olive Reading Room".
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
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section className="relative px-4 pt-24 sm:pt-28 pb-16 sm:pb-24 overflow-hidden">
      {/* Calm background tint — two soft olive orbs, no animation. */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-30 pointer-events-none blur-3xl"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-24 w-[460px] h-[460px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: "var(--color-secondary)" }}
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
        {/* Mockup — visually on the left (LTR), reads after copy on RTL mobile */}
        <motion.div {...fadeUp(0.35)} className="order-2 lg:order-1">
          <HeroMockup />
        </motion.div>

        {/* Copy side */}
        <div className="order-1 lg:order-2 text-right">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            جامعة الزيتونة الأردنية
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-foreground"
          >
            من فكرة في رأسك
            <br />
            إلى مشروع{" "}
            <span className="text-primary">مدعوم بالكامل</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.18)}
            className="mt-5 text-base sm:text-lg text-foreground/70 font-medium max-w-xl leading-relaxed"
          >
            حاضنة الزيتونة منصّة لطلاب جامعة الزيتونة الأردنية: قدّم فكرتك،
            تواصل مع مشرف أكاديمي، واحصل على دعم لتنفيذها — كل ذلك في مكان واحد.
          </motion.p>

          <motion.div {...fadeUp(0.28)} className="mt-7 flex flex-col sm:flex-row-reverse sm:justify-end gap-3 min-h-[56px]">
            {!authReady ? (
              <div className="w-48 h-12 rounded-md bg-foreground/5 animate-pulse" />
            ) : isSignedIn ? (
              <Link
                href={dashboardHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold text-base ds-shadow-sm hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                {userName ? `لوحة ${userName}` : "اذهب إلى لوحتي"}
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold text-base ds-shadow-sm hover:bg-accent transition-colors"
                >
                  <Rocket className="w-5 h-5" />
                  ابدأ رحلتك الآن
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-card text-foreground font-bold text-base ds-border hover:bg-muted transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </Link>
              </>
            )}
          </motion.div>

          <motion.ul {...fadeUp(0.42)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-foreground/65">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              ثلاثة أنواع احتضان
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              مشرفون أكاديميون
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              رعاة من القطاع الخاص
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Hero mockup: type selection ─────────────────────── */

function HeroMockup() {
  const types = [
    {
      icon: Lightbulb,
      title: "ريادي",
      desc: "فكرة مشروع تجاري ناشئ",
      active: true,
    },
    {
      icon: FileText,
      title: "تخرّج IT",
      desc: "مشروع تقني للتخرّج",
      active: false,
    },
    {
      icon: GraduationCap,
      title: "جامعي",
      desc: "مشروع يخدم الجامعة",
      active: false,
    },
  ];

  return (
    <div className="relative">
      {/* Decorative offset card behind the main one */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-primary/8 -rotate-[2deg] translate-x-3 translate-y-3"
      />

      <div className="relative rounded-2xl bg-card ds-border shadow-[0_20px_50px_-20px_rgba(31,92,46,0.25)] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
          <p className="text-xs font-extrabold text-foreground">الخطوة الأولى</p>
          <h3 className="text-base font-extrabold text-foreground mt-1">اختر نوع احتضانك</h3>
          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
            كل نوع يناسب مرحلة مختلفة من رحلتك
          </p>
        </div>

        <ul className="p-3 space-y-2">
          {types.map((t) => (
            <li key={t.title}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  t.active
                    ? "bg-primary/8 ring-1 ring-primary/30"
                    : "bg-muted/30 ds-border"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    t.active ? "bg-primary text-primary-foreground" : "bg-card text-foreground/60"
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{t.desc}</p>
                </div>
                {t.active && (
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    مختار
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="px-5 pb-5 pt-2 border-t border-border/40">
          <div className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm">
            متابعة
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
