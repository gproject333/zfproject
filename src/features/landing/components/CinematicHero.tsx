"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Rocket,
  LogIn,
  LayoutDashboard,
  Lightbulb,
  FileText,
  GraduationCap,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock4,
  Bell,
  CalendarClock,
  Heart,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    headline: "من فكرة في رأسك إلى",
    highlight: "مشروع مدعوم بالكامل",
    description:
      "حاضنة الزيتونة منصّة لطلاب جامعة الزيتونة الأردنية: قدّم فكرتك، تواصل مع مشرف أكاديمي، واحصل على دعم لتنفيذها — كل ذلك في مكان واحد.",
    accent: "primary",
    Background: MistBackground,
    Mockup: MistMockup,
  },
  {
    key: "grid",
    eyebrow: "بدون ورق ولا مكاتب",
    headline: "قدّم طلبك،",
    highlight: "وراقب تقدّمه لحظة بلحظة",
    description:
      "نموذج رقمي يأخذ منك دقائق، يصل للمشرف فوراً، ويعطيك إجابة خلال أيام قليلة. لا انتظار في الطوابير، ولا تعقيدات إدارية — فقط فكرتك ومشرفك.",
    accent: "accent",
    Background: GridBackground,
    Mockup: GridMockup,
  },
  {
    key: "spotlight",
    eyebrow: "رحلة كاملة",
    headline: "من القبول إلى",
    highlight: "اللقاء بمشرفك ودعم الراعي",
    description:
      "كل مشرف يراجع طلبك بعناية، يحدّد معك موعد لقاء، ويربطك بالرعاة المهتمين. اقرأ مقالات وأدلّة من أعضاء هيئة التدريس مباشرة.",
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
      {/* Crossfading background canvas — every scene renders its own */}
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

          <motion.ul
            {...fadeUp(0.42)}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-foreground/70"
          >
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

/* ───────────────────── Variant dots (manual control) ───────────────────── */

function VariantDots({
  count,
  activeIndex,
  onSelect,
  accent,
}: {
  count: number;
  activeIndex: number;
  onSelect: (i: number) => void;
  accent: "primary" | "accent" | "secondary";
}) {
  const activeBg =
    accent === "accent"
      ? "bg-accent"
      : accent === "secondary"
        ? "bg-secondary-border"
        : "bg-primary";
  return (
    <div className="mt-5 flex items-center gap-2" role="tablist" aria-label="بدائل العرض">
      {Array.from({ length: count }, (_, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`المشهد ${i + 1} من ${count}`}
            onClick={() => onSelect(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active ? `w-8 ${activeBg}` : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
            }`}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────── Scene 1: Olive Mist ─────────────────────── */

function MistBackground() {
  return (
    <>
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
    </>
  );
}

function MistMockup() {
  const types = [
    { icon: Lightbulb, title: "فكرة ريادية", desc: "فكرة مشروع تجاري ناشئ", active: true },
    { icon: FileText, title: "مشروع IT", desc: "مشروع تقني للتخرّج", active: false },
    { icon: GraduationCap, title: "مشروع للجامعة", desc: "مشروع يخدم الجامعة", active: false },
  ];

  return (
    <div className="relative">
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
                  t.active ? "bg-primary/8 ring-1 ring-primary/30" : "bg-muted/30 ds-border"
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

/* ─────────────────────── Scene 2: Grid ─────────────────────── */

function GridBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Dot grid — small dots on intersections, theme-aware */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--foreground) 16%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Soft fade-to-edges so the grid feels infinite */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 45%, var(--background) 95%)",
        }}
      />
      {/* Slow sheen across the grid */}
      <motion.div
        className="absolute -inset-x-32 top-0 h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, transparent 35%, color-mix(in srgb, var(--accent) 18%, transparent) 50%, transparent 65%)",
        }}
        initial={{ x: "-30%" }}
        animate={{ x: "30%" }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
    </div>
  );
}

function GridMockup() {
  const rows: { name: string; type: string; status: "accepted" | "under_review" | "needs_modification"; time: string }[] = [
    { name: "بستان الزيتون الذكي", type: "فكرة ريادية", status: "accepted", time: "قُبل قبل يومين" },
    { name: "منصة دروس تفاعلية", type: "مشروع IT", status: "under_review", time: "بانتظار المراجعة" },
    { name: "نظام إدارة الفعاليات", type: "للجامعة", status: "needs_modification", time: "ملاحظتان من المشرف" },
  ];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent blur-xl"
      />
      <div className="relative rounded-2xl bg-card ds-border shadow-[0_20px_50px_-20px_rgba(36,82,55,0.25)] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-foreground">طلباتي</p>
            <h3 className="text-base font-extrabold text-foreground mt-1">تحديثات لحظيّة</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            مباشر
          </span>
        </div>

        <ul className="divide-y divide-border/40">
          {rows.map((r, i) => (
            <motion.li
              key={r.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.45, ease: "easeOut" }}
              className="px-5 py-4 flex items-center gap-3"
            >
              <StatusGlyph status={r.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  {r.type} · {r.time}
                </p>
              </div>
              <StatusPill status={r.status} />
            </motion.li>
          ))}
        </ul>

        <div className="px-5 py-3 border-t border-border/40 bg-muted/30 flex items-center justify-between text-[11px] font-bold">
          <span className="text-muted-foreground">3 طلبات</span>
          <span className="text-accent">عرض الكل ←</span>
        </div>
      </div>
    </div>
  );
}

function StatusGlyph({ status }: { status: "accepted" | "under_review" | "needs_modification" }) {
  const Icon =
    status === "accepted" ? CheckCircle2 : status === "under_review" ? Eye : Clock4;
  const cls =
    status === "accepted"
      ? "bg-success/15 text-success"
      : status === "under_review"
        ? "bg-status-pending/20 text-status-pending"
        : "bg-status-modification/15 text-status-modification";
  return (
    <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
      <Icon className="w-5 h-5" />
    </span>
  );
}

function StatusPill({ status }: { status: "accepted" | "under_review" | "needs_modification" }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-success bg-success/15 border border-success/30 px-2 py-1 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        مقبول
      </span>
    );
  }
  if (status === "under_review") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-status-pending bg-status-pending/15 border border-status-pending/30 px-2 py-1 rounded-full">
        <Eye className="w-3 h-3" />
        مراجعة
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-status-modification bg-status-modification/15 border border-status-modification/30 px-2 py-1 rounded-full">
      <Clock4 className="w-3 h-3" />
      تعديل
    </span>
  );
}

/* ─────────────────────── Scene 3: Spotlight (cinema) ─────────────────────── */

function SpotlightBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Deep radial spot from upper-right (RTL start corner) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--secondary) 28%, transparent) 0%, transparent 55%), radial-gradient(circle at 15% 80%, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 55%)",
        }}
      />
      {/* Floating soft shapes */}
      <motion.div
        className="absolute top-12 right-[18%] w-40 h-40 rounded-full opacity-25 blur-2xl"
        style={{ background: "var(--secondary)" }}
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-[20%] w-56 h-56 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--accent)" }}
        animate={{ y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

interface JourneyCard {
  icon: LucideIcon;
  title: string;
  body: string;
  accentBg: string;
  accentText: string;
  rotate: string;
  offsetY: string;
  delay: number;
}

const JOURNEY_CARDS: JourneyCard[] = [
  {
    icon: CheckCircle2,
    title: "تم قبول طلبك",
    body: "بستان الزيتون الذكي · فكرة ريادية",
    accentBg: "bg-success/15",
    accentText: "text-success",
    rotate: "rotate-[-3deg]",
    offsetY: "translate-y-4",
    delay: 0.05,
  },
  {
    icon: CalendarClock,
    title: "موعد لقاء جديد",
    body: "الخميس ١٠ صباحاً · مكتب الكلية",
    accentBg: "bg-accent/15",
    accentText: "text-accent",
    rotate: "rotate-[1.5deg]",
    offsetY: "-translate-y-2",
    delay: 0.18,
  },
  {
    icon: Heart,
    title: "راعٍ مهتم بمشروعك",
    body: "شركة من قطاع الزراعة الذكية",
    accentBg: "bg-secondary/20",
    accentText: "text-secondary-border",
    rotate: "rotate-[-1deg]",
    offsetY: "translate-y-2",
    delay: 0.32,
  },
];

function SpotlightMockup() {
  return (
    <div className="relative h-[360px] sm:h-[400px]">
      {/* Notification flash chip floating above */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="absolute top-0 right-0 sm:right-6 inline-flex items-center gap-2 text-[11px] font-extrabold bg-card/90 backdrop-blur ds-border rounded-full px-3 py-1.5 shadow-lg z-30"
      >
        <Bell className="w-3.5 h-3.5 text-secondary-border" />
        رحلة طالب حقيقي
      </motion.div>

      {/* Stacked journey cards */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-[340px]">
          {JOURNEY_CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24, rotate: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: c.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute inset-x-0 rounded-2xl bg-card ds-border shadow-[0_20px_45px_-15px_rgba(0,0,0,0.25)] p-4 ${c.rotate} ${c.offsetY}`}
              style={{ top: `${i * 78}px`, zIndex: 10 + i }}
            >
              <div className="flex items-start gap-3">
                <span className={`w-11 h-11 rounded-xl ${c.accentBg} ${c.accentText} flex items-center justify-center shrink-0`}>
                  <c.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-foreground truncate">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                    {c.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
