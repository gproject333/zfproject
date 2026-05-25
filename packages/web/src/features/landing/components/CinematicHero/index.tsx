"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Rocket, LogIn, LayoutDashboard, ArrowDown } from "lucide-react";

interface CinematicHeroProps {
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

/**
 * Full-bleed cinematic hero: dark, ambient, and intentionally dramatic.
 * One huge headline + subline, two CTAs, and a layered backdrop of slow
 * drifting orbs over a deep gradient. Mobile-first — the layout collapses
 * to a single column with reduced motion and tighter spacing.
 */
export default function CinematicHero({
  dashboardHref = "/student",
  userName,
  authReady = false,
  isSignedIn = false,
}: CinematicHeroProps) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const orbOneY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -120]);
  const orbTwoY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 80]);
  const headlineY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -60]);
  const headlineOpacity = useTransform(scrollY, [0, 400], [1, reduce ? 1 : 0.4]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      dir="rtl"
      className="relative isolate min-h-[100svh] flex flex-col items-center justify-center overflow-hidden text-white"
    >
      {/* Base gradient — deep night with a hint of olive */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_top,_#0f3d1f_0%,_#0a0e1a_55%,_#05080f_100%)]" />

      {/* Slow drifting orbs — parallax + ambient pulse */}
      <motion.div
        aria-hidden
        style={{ y: orbOneY }}
        className="absolute -z-20 top-[-12%] right-[-15%] w-[60vw] h-[60vw] max-w-[820px] max-h-[820px] rounded-full bg-[radial-gradient(circle,_rgba(76,175,80,0.28)_0%,_transparent_65%)] blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: orbTwoY }}
        className="absolute -z-20 bottom-[-18%] left-[-18%] w-[55vw] h-[55vw] max-w-[760px] max-h-[760px] rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.20)_0%,_transparent_65%)] blur-3xl"
      />
      {mounted && !reduce && (
        <>
          <motion.div
            aria-hidden
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -z-20 top-[20%] left-[10%] w-[260px] h-[260px] rounded-full bg-emerald-400/15 blur-3xl"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -z-20 bottom-[18%] right-[14%] w-[200px] h-[200px] rounded-full bg-amber-300/15 blur-3xl"
          />
        </>
      )}

      {/* Subtle grain / noise overlay for tactile feel */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      {/* Top fade so the (transparent) navbar reads cleanly over the gradient */}
      <div className="absolute top-0 inset-x-0 h-32 -z-10 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      {/* Bottom fade so the hero bleeds into the next section */}
      <div className="absolute bottom-0 inset-x-0 h-40 -z-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Content */}
      <motion.div
        style={{ y: headlineY, opacity: headlineOpacity }}
        className="relative w-full max-w-5xl mx-auto px-5 sm:px-8 text-center pt-28 sm:pt-32 pb-20"
      >
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="inline-block text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-emerald-300/85 mb-6"
        >
          ZUJ Incubator · حاضنة الزيتونة
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="font-black leading-[1.05] tracking-tight text-[clamp(2.5rem,8vw,6.5rem)]"
        >
          من فكرة طالب
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-l from-emerald-300 via-emerald-200 to-amber-200 bg-clip-text text-transparent">
            {" "}إلى مشروع{" "}
          </span>
          معتمد
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          className="mt-7 sm:mt-8 mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-white/75 leading-relaxed font-medium"
        >
          منصة رسمية تابعة لجامعة الزيتونة الأردنية تتيح للطالب تقديم مشروعه إلى مشرف
          أكاديمي ومتابعته خطوة بخطوة حتى الاعتماد.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
          className="mt-10 sm:mt-12 flex flex-col-reverse sm:flex-row-reverse items-center justify-center gap-3 sm:gap-4"
        >
          {!authReady ? (
            <div className="w-full sm:w-56 h-14 rounded-full bg-white/5 animate-pulse" />
          ) : isSignedIn ? (
            <Link
              href={dashboardHref}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-gray-900 font-extrabold text-base shadow-[0_10px_40px_-10px_rgba(255,255,255,0.45)] hover:shadow-[0_18px_50px_-10px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <LayoutDashboard className="w-5 h-5" />
              {userName ? `لوحة ${userName}` : "اذهب إلى لوحتي"}
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-gray-900 font-extrabold text-base shadow-[0_10px_40px_-10px_rgba(255,255,255,0.45)] hover:shadow-[0_18px_50px_-10px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 transition-transform group-hover:-rotate-12" />
                إنشاء حساب جديد
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white/8 backdrop-blur-md text-white font-bold text-base border border-white/20 hover:bg-white/15 hover:border-white/35 transition-all duration-300"
              >
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </Link>
            </>
          )}
        </motion.div>

        {/* Pillar chips — quick, scannable value props */}
        <motion.ul
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.85 }}
          className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold"
        >
          {[
            "ثلاثة مسارات احتضان",
            "إشراف أكاديمي معتمد",
            "شراكات مع جهات داعمة",
          ].map((label, i) => (
            <li
              key={label}
              className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/80"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {label}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Scroll cue — gently breathes */}
      {mounted && !reduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { duration: 1.2, delay: 1.2 },
            y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
          }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-white/40 pointer-events-none"
          aria-hidden
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      )}
    </section>
  );
}
