"use client";

import Link from "next/link";
import { useRef } from "react";
import { Rocket, LogIn, LayoutDashboard, Sparkles, ChevronDown } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { buttonVariants } from "@/components/ui";
import OliveTreeSVG from "./OliveTreeSVG";
import LeafParticles from "./LeafParticles";
import CountUp from "./CountUp";

interface HeroProps {
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

/** Words in the headline. The one matching `gradientWord` gets the gradient treatment. */
const TITLE_WORDS = ["حوّل", "فكرتك", "إلى", "مشروع", "حقيقي."];
const GRADIENT_WORD = "فكرتك";

/* ────────────────────────────────────────────────────────────────
 * Animation variants. With reduced-motion, transitions become
 * instant; otherwise children stagger in a calm sequence.
 * ──────────────────────────────────────────────────────────────── */

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────── */

export default function Hero({
  dashboardHref = "/student",
  userName,
  authReady = false,
  isSignedIn = false,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-linked parallax: fade hero out gently as the user scrolls past it.
  // No pinning — just opacity/translateY tied to the section's own scroll range.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // When reduced-motion is on, leave everything static.
  const opacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.4]);
  const y       = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity, y }}
      className="relative min-h-[92vh] flex items-center px-4 pt-12 pb-20 overflow-hidden"
    >
      {/* Background — bg-pattern stays for continuity, plus a gentle gradient mesh. */}
      <div className="absolute inset-0 bg-dots opacity-[0.04] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-secondary/[0.05] pointer-events-none" />

      {/* Two glowing orbs sit in the corners for warmth. */}
      <div
        aria-hidden
        className="landing-orb absolute top-16 -right-20 w-[26rem] h-[26rem] rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", opacity: 0.15 }}
      />
      <div
        aria-hidden
        className="landing-orb absolute bottom-10 -left-20 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)", opacity: 0.12, animationDelay: "1.4s" }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* ─── Text column ─────────────────────────────────────── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1"
          >
            {/* Eyebrow glass pill */}
            <motion.span
              variants={item}
              className="glass inline-flex items-center gap-2 text-xs font-bold text-primary mb-6 rounded-full px-3 py-1.5 ring-1 ring-primary/15 w-fit"
            >
              <Sparkles className="w-3.5 h-3.5" />
              حاضنة الزيتونة — الجامعة الزيتونة الأردنية
            </motion.span>

            {/* Headline — word-by-word reveal */}
            <motion.h1
              variants={wordContainer}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] mb-6 text-foreground flex flex-wrap gap-x-3 gap-y-1"
            >
              {TITLE_WORDS.map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  variants={word}
                  className="inline-block"
                >
                  {w === GRADIENT_WORD ? (
                    <span className="gradient-text">{w}</span>
                  ) : (
                    w
                  )}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              variants={item}
              className="text-base sm:text-lg text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed mb-8 max-w-lg"
            >
              منصة احتضان رقمية تربط طلاب الجامعة الزيتونة بمشرفين أكاديميين، مع
              تتبع فوري لحالة كل طلب ومراجعة مباشرة من قِبَل المشرف. ازرع فكرتك،
              نحن نهتم بنموّها.
            </motion.p>

            {/* CTAs — preserve all existing auth-aware behaviour */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 min-h-[52px]">
              {!authReady ? (
                <>
                  <div className="w-44 h-12 rounded-lg bg-foreground/10 animate-pulse" />
                  <div className="w-36 h-12 rounded-lg bg-foreground/10 animate-pulse" />
                </>
              ) : isSignedIn ? (
                <Link
                  href={dashboardHref}
                  className={`${buttonVariants({ variant: "secondary", size: "lg" })} w-full sm:w-auto transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {userName ? `لوحة ${userName}` : "اذهب إلى لوحتي"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className={`${buttonVariants({ variant: "secondary", size: "lg" })} w-full sm:w-auto transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5`}
                  >
                    <Rocket className="w-5 h-5" />
                    ابدأ تقديم مشروعك
                  </Link>
                  <Link
                    href="/login"
                    className={`${buttonVariants({ variant: "outline", size: "lg" })} w-full sm:w-auto transition-all hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust strip — 3 stacked gradient avatars (with initials) + count */}
            <motion.div variants={item} className="flex items-center gap-3 mt-7">
              <div className="flex -space-x-2 -space-x-reverse">
                {([
                  { tone: "primary", initial: "أ" },
                  { tone: "accent", initial: "س" },
                  { tone: "secondary", initial: "م" },
                ] as const).map(({ tone, initial }, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full ring-2 ring-background shadow-sm flex items-center justify-center text-xs font-black text-white"
                    style={{
                      background: `linear-gradient(135deg, var(--color-${tone}), color-mix(in srgb, var(--color-${tone}) 55%, white))`,
                    }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-sm text-foreground/70">
                <CountUp to={1200} prefix="+" className="font-black text-foreground" />{" "}
                طالب نشط على المنصة منذ ٢٠٢٤
              </p>
            </motion.div>

            {/* Scroll cue — last in the stagger */}
            <motion.div
              variants={item}
              className="hidden lg:flex items-center gap-2 mt-10 text-xs text-foreground/40 font-medium"
            >
              <ChevronDown className="w-4 h-4 animate-float" />
              مرر للأسفل لتعرف المزيد
            </motion.div>
          </motion.div>

          {/* ─── Olive tree column ──────────────────────────────── */}
          <div className="order-1 lg:order-2 relative flex justify-center items-center min-h-[360px] sm:min-h-[460px] lg:min-h-[560px]">
            {/* Soft halo behind the tree */}
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="landing-orb w-[80%] aspect-square rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, var(--color-primary) 0%, var(--color-secondary) 40%, transparent 75%)",
                  opacity: 0.18,
                }}
              />
            </div>

            {/* Drifting leaf particles confined to this column */}
            <LeafParticles count={6} />

            {/* The tree itself */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[520px] aspect-[6/7]"
            >
              <OliveTreeSVG className="w-full h-full" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
