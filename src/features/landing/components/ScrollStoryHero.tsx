"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  LogIn,
  LayoutDashboard,
  Sparkles,
  Users,
  GraduationCap,
  Trophy,
  Activity,
  MessageCircle,
  FolderOpen,
  BarChart3,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buttonVariants } from "@/components/ui";
import { DottedDiamond, RotatedSquare } from "./SectionDecorations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ────────────────────────────────────────────────────────────────
 * Content configuration — swap to repurpose for any site
 * ──────────────────────────────────────────────────────────────── */

type Stat = { label: string; value: number; suffix?: string; icon: LucideIcon };
type Bullet = { label: string; icon: LucideIcon };

export interface ScrollStoryContent {
  phase1: {
    eyebrow?: string;
    title: ReactNode;
    description?: string;
    trust?: { count: string; label: string };
    preview?: { title: string; subtitle: string; status: string; supervisor: string };
  };
  phase2: { title: string; description: string; stats: Stat[] };
  phase3: { title: string; description: string; bullets: Bullet[]; cta?: { label: string; href: string } };
  illustration: { src: string; alt: string };
}

const defaultContent: ScrollStoryContent = {
  phase1: {
    eyebrow: "حاضنة الزيتونة",
    title: (
      <>
        حوّل{" "}
        <span className="bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text text-transparent">
          فكرتك
        </span>{" "}
        إلى <br className="hidden sm:block" />
        مشروع حقيقي.
      </>
    ),
    description:
      "منصة احتضان رقمية تربط طلاب الجامعة الزيتونة بمشرفين أكاديميين، مع تتبع فوري لحالة كل طلب ومراجعة من قِبَل المشرف.",
    trust: { count: "+١,٢٠٠", label: "طالب نشط منذ ٢٠٢٤" },
    preview: {
      title: "تطبيق لإدارة المخزون",
      subtitle: "كلية تكنولوجيا المعلومات",
      status: "قيد المراجعة",
      supervisor: "د. أحمد",
    },
  },
  phase2: {
    title: "خطوة واحدة تفصلك عن مشروعك القادم",
    description: "قدّم فكرتك، احصل على مشرف، وتابع رحلتك من لوحة تحكم واحدة.",
    stats: [
      { label: "طلاب نشطون", value: 1200, suffix: "+", icon: Users },
      { label: "مشرفون أكاديميون", value: 45, suffix: "+", icon: GraduationCap },
      { label: "مشاريع مكتملة", value: 300, suffix: "+", icon: Trophy },
    ],
  },
  phase3: {
    title: "كل ما تحتاجه في مكان واحد",
    description: "أدوات متكاملة لإدارة مشروعك من اللحظة الأولى حتى تخرّجك.",
    bullets: [
      { label: "تتبّع مباشر لحالة الطلب", icon: Activity },
      { label: "مراسلة فورية مع المشرف", icon: MessageCircle },
      { label: "أرشيف للملفات والمسودّات", icon: FolderOpen },
      { label: "تقارير دورية وتحليلات تقدّم", icon: BarChart3 },
    ],
    cta: { label: "اكتشف الميزات كاملة", href: "#features" },
  },
  illustration: { src: "/team.png", alt: "طالب ريادي" },
};

/* Arabic-Indic numeral formatter used by the animated counters. */
const arDigits = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });

/* ────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────── */

interface ScrollStoryHeroProps {
  content?: ScrollStoryContent;
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

export default function ScrollStoryHero({
  content = defaultContent,
  dashboardHref = "/student",
  userName,
  authReady = false,
  isSignedIn = false,
}: ScrollStoryHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const heroElRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  // One ref per stat value DOM node so the counter tween can write to it.
  const statRefs = useRef<Array<HTMLSpanElement | null>>([]);
  // Refs to each bullet row for staggered slide-in inside phase 3.
  const bulletRefs = useRef<Array<HTMLLIElement | null>>([]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ── Standard motion ─────────────────────────────────────── */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Initial hidden state for phase 2 + 3 + bullets.
        gsap.set(phase2Ref.current, { autoAlpha: 0, y: 60 });
        gsap.set(phase3Ref.current, { autoAlpha: 0, xPercent: -110 });
        gsap.set(bulletRefs.current.filter(Boolean), { autoAlpha: 0, x: -20 });

        // Scroll-driven master timeline — every progress unit is one scroll unit (scrub 1).
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        /* 0.00 → 0.20 — scroll cue fades, preview lifts */
        tl.to(scrollCueRef.current, { autoAlpha: 0 }, 0)
          .to(previewRef.current, { y: -10 }, 0);

        /* 0.00 → 0.35 — illustration grows, phase-1 text drifts up + dims */
        tl.to(heroElRef.current, { scale: 1.15, rotate: -3 }, 0)
          .to(glowRef.current, { opacity: 1, scale: 1.3 }, 0)
          .to(phase1Ref.current, { y: -30, autoAlpha: 0.4 }, 0);

        /* 0.18 → 0.45 — phase 2 fades + slides up */
        tl.to(phase2Ref.current, { autoAlpha: 1, y: 0, duration: 0.27 }, 0.18);

        /* 0.40 → 0.65 — illustration shrinks + drifts off-center, preview fades */
        tl.to(heroElRef.current, { scale: 0.6, xPercent: 30, yPercent: -20 }, 0.4)
          .to(previewRef.current, { autoAlpha: 0, x: -40 }, 0.4)
          .to(glowRef.current, { opacity: 0.45 }, 0.4);

        /* 0.65 → 1.00 — phase 3 slides in; phase 1 + 2 give way */
        tl.to(phase1Ref.current, { autoAlpha: 0 }, 0.65)
          .to(phase2Ref.current, { autoAlpha: 0.25, y: -10 }, 0.65)
          .to(phase3Ref.current, { autoAlpha: 1, xPercent: 0, duration: 0.2 }, 0.7);

        // Bullets stagger AFTER the panel is in position (≥ 0.82 of scroll).
        bulletRefs.current.filter(Boolean).forEach((node, i) => {
          tl.to(node, { autoAlpha: 1, x: 0 }, 0.82 + i * 0.035);
        });

        /* ── Stat counters — interpolate based on scroll progress (0.18 → 0.45). */
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            // Map full-scroll progress to the 0.18–0.45 window where stats animate.
            const local = gsap.utils.clamp(0, 1, (self.progress - 0.18) / (0.45 - 0.18));
            content.phase2.stats.forEach((stat, idx) => {
              const node = statRefs.current[idx];
              if (!node) return;
              const current = Math.round(stat.value * local);
              node.textContent = `${stat.suffix ?? ""}${arDigits.format(current)}`;
            });
          },
        });

        /* ── Independent: subtle yoyo bob on the floating preview card */
        gsap.to(previewRef.current, {
          y: "+=6",
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      /* ── Reduced motion: snap to the composed final state, no scrubbing. */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(phase2Ref.current, { autoAlpha: 1, y: 0 });
        gsap.set(phase3Ref.current, { autoAlpha: 1, xPercent: 0 });
        gsap.set(bulletRefs.current.filter(Boolean), { autoAlpha: 1, x: 0 });
        // Populate stats with their full values.
        content.phase2.stats.forEach((stat, idx) => {
          const node = statRefs.current[idx];
          if (node) node.textContent = `${stat.suffix ?? ""}${arDigits.format(stat.value)}`;
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [content]);

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-pattern">
        {/* ── Background layers ───────────────────────────────────── */}
        <div className="absolute inset-0 bg-dots opacity-[0.04] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-secondary/[0.06] pointer-events-none" />

        {/* Floating gradient orbs — purely decorative, animate-float independent of scroll */}
        <div
          aria-hidden
          className="absolute top-12 left-[8%] w-72 h-72 rounded-full blur-3xl animate-float opacity-50 pointer-events-none hidden md:block"
          style={{ background: "radial-gradient(circle, var(--color-primary, #1F5C2E) 0%, transparent 70%)", opacity: 0.18 }}
        />
        <div
          aria-hidden
          className="absolute bottom-16 right-[12%] w-80 h-80 rounded-full blur-3xl animate-float opacity-50 pointer-events-none hidden md:block"
          style={{ background: "radial-gradient(circle, var(--color-secondary, #C9A227) 0%, transparent 70%)", opacity: 0.16, animationDelay: "1.2s" }}
        />

        {/* Small geometric accents — corners */}
        <DottedDiamond
          className="absolute top-24 right-8 text-primary hidden md:block opacity-40"
          size={56}
        />
        <RotatedSquare
          className="absolute bottom-32 left-10 text-secondary hidden md:block opacity-40 animate-float"
          size={42}
        />

        <div className="relative h-full max-w-7xl mx-auto px-4">
          {/* ── Hero illustration with soft radial glow ─────────────── */}
          <div
            ref={heroElRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 will-change-transform"
          >
            <div className="relative flex items-center justify-center">
              {/* Soft glow replaces the old rotated color slabs */}
              <div
                ref={glowRef}
                aria-hidden
                className="absolute w-[26rem] h-[26rem] rounded-full blur-3xl opacity-60 will-change-transform"
                style={{
                  background:
                    "radial-gradient(circle, var(--color-primary, #1F5C2E) 0%, var(--color-secondary, #C9A227) 45%, transparent 75%)",
                  filter: "blur(60px)",
                  opacity: 0.35,
                }}
              />
              <Image
                src={content.illustration.src}
                alt={content.illustration.alt}
                width={400}
                height={400}
                className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* ── Floating "live application" preview — fills the empty left side ─ */}
          <div
            ref={previewRef}
            aria-hidden
            className="absolute top-1/2 left-4 lg:left-12 -translate-y-[10%] z-20 w-64 hidden md:block will-change-transform"
          >
            <div className="glass rounded-2xl shadow-2xl shadow-primary/10 p-4 ring-1 ring-primary/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-foreground/50 tracking-wider">
                  طلب رقم #٢٤٧
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                  {content.phase1.preview?.status}
                </span>
              </div>
              <h3 className="text-sm font-black mb-1">{content.phase1.preview?.title}</h3>
              <p className="text-xs text-foreground/60 mb-3">
                {content.phase1.preview?.subtitle}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-foreground/5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
                  {content.phase1.preview?.supervisor.split(" ").pop()?.[0]}
                </div>
                <div className="text-xs">
                  <div className="font-bold leading-tight">{content.phase1.preview?.supervisor}</div>
                  <div className="text-foreground/50 text-[10px]">المشرف الأكاديمي</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── PHASE 1 — headline, CTAs, trust strip ───────────────── */}
          <div
            ref={phase1Ref}
            className="absolute inset-y-0 right-0 z-20 flex flex-col justify-center max-w-xl pe-2 sm:pe-6 will-change-transform"
          >
            {content.phase1.eyebrow && (
              <span className="glass inline-flex items-center gap-2 text-xs font-bold text-primary mb-5 w-fit rounded-full px-3 py-1.5 ring-1 ring-primary/15">
                <Sparkles className="w-3.5 h-3.5" />
                {content.phase1.eyebrow}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
              {content.phase1.title}
            </h1>
            {content.phase1.description && (
              <p className="text-base sm:text-lg text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed mb-8 max-w-lg">
                {content.phase1.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 min-h-[52px]">
              {!authReady ? (
                <>
                  <div className="w-44 h-12 rounded-lg bg-foreground/10 animate-pulse" />
                  <div className="w-36 h-12 rounded-lg bg-foreground/10 animate-pulse" />
                </>
              ) : isSignedIn ? (
                <Link
                  href={dashboardHref}
                  className={`${buttonVariants({ variant: "secondary", size: "lg" })} w-full sm:w-auto`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {userName ? `لوحة ${userName}` : "اذهب إلى لوحتي"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className={`${buttonVariants({ variant: "secondary", size: "lg" })} w-full sm:w-auto`}
                  >
                    <Rocket className="w-5 h-5" />
                    ابدأ تقديم مشروعك
                  </Link>
                  <Link
                    href="/login"
                    className={`${buttonVariants({ variant: "outline", size: "lg" })} w-full sm:w-auto`}
                  >
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>

            {/* Trust strip — stacked avatars + count */}
            {content.phase1.trust && (
              <div className="flex items-center gap-3 mt-6">
                <div className="flex -space-x-2 -space-x-reverse">
                  {["primary", "accent", "secondary"].map((tone, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full ring-2 ring-background"
                      style={{
                        background: `linear-gradient(135deg, var(--color-${tone}, #1F5C2E), color-mix(in srgb, var(--color-${tone}, #1F5C2E) 60%, white))`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/70">
                  <span className="font-black text-foreground">{content.phase1.trust.count}</span>{" "}
                  {content.phase1.trust.label}
                </p>
              </div>
            )}
          </div>

          {/* ── PHASE 2 — stepper + glass stat cards with animated counters ─ */}
          <div
            ref={phase2Ref}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-2 z-20 will-change-transform"
          >
            <div className="text-center">
              {/* "01 — 02 — 03" stepper */}
              <div className="inline-flex items-center gap-3 mb-4 text-xs font-bold tracking-wider">
                <span className="text-foreground/30">٠١</span>
                <span className="w-8 h-px bg-foreground/20" />
                <span className="text-primary">٠٢</span>
                <span className="w-8 h-px bg-foreground/20" />
                <span className="text-foreground/30">٠٣</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">{content.phase2.title}</h2>
              <p className="text-foreground/70 mb-6">{content.phase2.description}</p>
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {content.phase2.stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className="glass rounded-2xl p-4 sm:p-5 ring-1 ring-foreground/5 shadow-lg shadow-primary/5"
                    >
                      <Icon className="w-5 h-5 mx-auto mb-2 text-primary/80" />
                      <div
                        className="text-2xl sm:text-3xl font-black bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent"
                      >
                        <span ref={(el) => { statRefs.current[i] = el; }}>
                          {`${s.suffix ?? ""}٠`}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-foreground/70 font-medium mt-1">
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── PHASE 3 — glass side panel with icon-row bullets ────── */}
          <aside
            ref={phase3Ref}
            className="absolute top-1/2 -translate-y-1/2 left-0 z-30 h-[78vh] w-full sm:w-[400px] max-w-full
                       glass rounded-r-3xl shadow-2xl shadow-primary/10 ring-1 ring-primary/10
                       p-6 sm:p-8 flex flex-col justify-center will-change-transform"
          >
            <span className="text-xs font-bold text-primary tracking-wider mb-2">٠٣ — الميزات</span>
            <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight">
              {content.phase3.title}
            </h2>
            <p className="text-foreground/70 mb-6 text-sm sm:text-base">
              {content.phase3.description}
            </p>
            <ul className="space-y-3 mb-6">
              {content.phase3.bullets.map((b, i) => {
                const Icon = b.icon;
                return (
                  <li
                    key={b.label}
                    ref={(el) => { bulletRefs.current[i] = el; }}
                    className="flex items-center gap-3 text-sm sm:text-base font-medium will-change-transform"
                  >
                    <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/15">
                      <Icon className="w-5 h-5 text-primary" />
                    </span>
                    <span>{b.label}</span>
                  </li>
                );
              })}
            </ul>
            {content.phase3.cta && (
              <Link
                href={content.phase3.cta.href}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all w-fit"
              >
                {content.phase3.cta.label}
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
          </aside>

          {/* Scroll affordance — visible only at the very start (fades by progress 0.2) */}
          <div
            ref={scrollCueRef}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-foreground/40 font-medium z-0 flex flex-col items-center gap-1"
          >
            <span>مرر للأسفل</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
