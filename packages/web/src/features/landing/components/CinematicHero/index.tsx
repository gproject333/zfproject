"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Rocket, LogIn, LayoutDashboard, Sparkles } from "lucide-react";
import { VariantDots } from "./VariantDots";
import { MistBackground, MistMockup } from "./scenes/MistScene";
import { GridBackground, GridMockup } from "./scenes/GridScene";
import { SpotlightBackground, SpotlightMockup } from "./scenes/SpotlightScene";

interface CinematicHeroProps {
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

/**
 * Three rotating hero "scenes". Each scene swaps **everything** the eye
 * notices — background pattern, product mockup, accent color, and copy —
 * so the visitor sees a fully fresh framing of the same product every
 * ~7 seconds. CTAs, bullet strip, and the variant dots stay fixed so the
 * layout never jitters.
 *
 *  1. Olive Mist (warm) — type-selection card on a tinted-orbs canvas.
 *  2. Grid (techy)      — application-status feed on a subtle dot grid.
 *  3. Spotlight (cinema)— stacked journey cards on a dark radial spot.
 *
 * Rotation auto-pauses on hover/focus and is disabled for prefers-reduced-
 * motion (the carousel still renders, but the user drives it via the dots).
 */
type SceneKey = "mist" | "grid" | "spotlight";

interface Scene {
  key: SceneKey;
  eyebrow: string;
  headline: string;
  highlight: string;
  description: string;
  accent: "primary" | "accent" | "secondary";
  Background: () => React.ReactElement;
  Mockup: () => React.ReactElement;
}

const SCENES: Scene[] = [
  {
    key: "mist",
    eyebrow: "جامعة الزيتونة الأردنية",
    headline: "من الفكرة إلى",
    highlight: "مشروع معتمد أكاديميًّا",
    description:
      "حاضنة الزيتونة منصة رسمية تتبع جامعة الزيتونة الأردنية، تتيح للطالب تقديم مشروعه إلى مشرف أكاديمي ومتابعة مراحله حتى الاعتماد.",
    accent: "primary",
    Background: MistBackground,
    Mockup: MistMockup,
  },
  {
    key: "grid",
    eyebrow: "نظام رقمي متكامل",
    headline: "قدِّم طلبك",
    highlight: "وتابع حالته أولًا بأوَّل",
    description:
      "نموذج رقمي تُعبَّأ بياناته في دقائق، يُحال مباشرة إلى المشرف الأكاديمي، ويُبلَّغ الطالب بقرار المراجعة خلال مدة محدودة.",
    accent: "accent",
    Background: GridBackground,
    Mockup: GridMockup,
  },
  {
    key: "spotlight",
    eyebrow: "إشراف ودعم متكامل",
    headline: "من اعتماد المشروع إلى",
    highlight: "اللقاء بالمشرف والجهات الداعمة",
    description:
      "يتولى المشرف الأكاديمي دراسة الطلب وتحديد مواعيد المتابعة، مع إتاحة التواصل مع الجهات الداعمة والاطلاع على المراجع المنشورة من أعضاء هيئة التدريس.",
    accent: "secondary",
    Background: SpotlightBackground,
    Mockup: SpotlightMockup,
  },
];

const ROTATE_INTERVAL_MS = 7000;

export default function CinematicHero({
  dashboardHref = "/student",
  userName,
  authReady = false,
  isSignedIn = false,
}: CinematicHeroProps) {
  const reduce = useReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      setSceneIndex((i) => (i + 1) % SCENES.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  const scene = SCENES[sceneIndex];
  const accentText =
    scene.accent === "accent"
      ? "text-accent"
      : scene.accent === "secondary"
        ? "text-secondary-border"
        : "text-primary";
  const accentChipBg =
    scene.accent === "accent"
      ? "bg-accent/12 text-accent"
      : scene.accent === "secondary"
        ? "bg-secondary/15 text-secondary-border"
        : "bg-primary/10 text-primary";

  return (
    <section
      className="relative px-4 pt-24 sm:pt-28 pb-16 sm:pb-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${scene.key}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.8, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <scene.Background />
        </motion.div>
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
        <motion.div {...fadeUp(0.35)} className="order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`mockup-${scene.key}`}
              initial={{ opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10, scale: reduce ? 1 : 0.97 }}
              transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <scene.Mockup />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="order-1 lg:order-2 text-right">
          <AnimatePresence mode="wait">
            <motion.div
              key={`eyebrow-${scene.key}`}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -4 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
              className={`inline-flex items-center gap-2 text-xs font-bold mb-4 rounded-full px-3 py-1.5 ${accentChipBg}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {scene.eyebrow}
            </motion.div>
          </AnimatePresence>

          <div className="min-h-[230px] sm:min-h-[260px] lg:min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${scene.key}`}
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-foreground">
                  {scene.headline}
                  <br />
                  <span className={accentText}>{scene.highlight}</span>
                </h1>
                <p className="mt-5 text-base sm:text-lg text-foreground/75 font-medium max-w-xl leading-relaxed">
                  {scene.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <VariantDots
            count={SCENES.length}
            activeIndex={sceneIndex}
            onSelect={setSceneIndex}
            accent={scene.accent}
          />

          <motion.div
            {...fadeUp(0.28)}
            className="mt-7 flex flex-col sm:flex-row-reverse sm:justify-end gap-3 min-h-[56px]"
          >
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
                  إنشاء حساب جديد
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

          <motion.ul
            {...fadeUp(0.42)}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-foreground/70"
          >
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              ثلاثة مسارات لاحتضان المشاريع
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              إشراف أكاديمي معتمد
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              شراكات مع جهات داعمة
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
