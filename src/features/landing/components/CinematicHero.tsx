"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Rocket, LogIn, LayoutDashboard, ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * HERO_IMAGE — the full-bleed hero photograph.
 *
 * Real Unsplash CDN URLs (free licence, no attribution required, hotlink-friendly).
 * Swap by changing this one constant. Alternates:
 *   Tuscan tower framed by olives:  https://images.unsplash.com/photo-1744139056941-6200ae72e7cb
 *   Warm golden-hour landscape:     https://images.unsplash.com/photo-1562785212-f4f6999e4707
 * To host locally instead: drop a file in `public/` and set this to e.g. "/hero.jpg".
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1601397702554-ce9ecbebc514?q=80&w=2400&auto=format&fit=crop";

interface CinematicHeroProps {
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

/* Shared button styles — bright enough to read on the dark photo. */
const goldBtn =
  "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground font-black text-base shadow-2xl shadow-black/40 hover:scale-105 active:scale-95 transition-transform";
const glassBtn =
  "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur text-white font-black text-base ring-1 ring-white/30 hover:bg-white/20 active:scale-95 transition-all";

export default function CinematicHero({
  dashboardHref = "/student",
  userName,
  authReady = false,
  isSignedIn = false,
}: CinematicHeroProps) {
  const root = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleInnerRef = useRef<HTMLSpanElement>(null);
  const taglineInnerRef = useRef<HTMLSpanElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Reduced motion: no Lenis, no parallax, no reveal — content shows as-is.
      if (reduce) return;

      // Lenis smooth scroll, synced into GSAP's ticker so ScrollTrigger stays exact.
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // ── On-load choreography ──────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(eyebrowRef.current, { opacity: 0, y: 16, duration: 0.7 }, 0.2)
        // Masked line reveal — inner span wipes up from behind its overflow-hidden mask.
        .from(titleInnerRef.current, { yPercent: 120, duration: 1.0 }, 0.35)
        .from(taglineInnerRef.current, { yPercent: 120, duration: 1.0 }, 0.5)
        .from(dividerRef.current, { scaleX: 0, duration: 0.7 }, 0.8)
        .from(ctaRef.current, { opacity: 0, y: 24, duration: 0.7 }, 0.95)
        .from(cueRef.current, { opacity: 0, duration: 0.6 }, 1.15);

      // Perpetual gentle bob on the scroll cue.
      gsap.to(cueRef.current, {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: "sine.inOut",
      });

      // ── Scroll parallax (no pinning) ──────────────────────────────
      // Background drifts slower than the scroll → depth.
      gsap.to(imageWrapRef.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      // Content drifts up and fades as the hero leaves the viewport.
      gsap.to(contentRef.current, {
        yPercent: -38,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      return () => {
        lenis.destroy();
        gsap.ticker.remove(raf);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-screen w-full overflow-hidden -mt-[68px]">
      {/* Photograph — oversized wrapper gives the parallax headroom; Ken Burns on inner. */}
      <div
        ref={imageWrapRef}
        className="absolute left-0 right-0 -top-[20%] h-[140%] will-change-transform"
      >
        <div className="absolute inset-0 animate-kenburns">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Cinematic colour-grade — keeps any source photo warm and on-brand */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-soft-light"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), transparent 55%, var(--color-secondary))",
        }}
      />

      {/* Legibility gradient — darker toward the bottom where the content sits */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-black/25 to-black/85" />

      {/* Content — lower third */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex flex-col items-center justify-end text-center px-4 pb-24 sm:pb-28"
      >
        <div
          ref={eyebrowRef}
          className="text-xs sm:text-sm font-bold tracking-[0.35em] text-white/70 mb-5"
        >
          الجامعة الزيتونة الأردنية
        </div>

        {/* Title — masked line reveal */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.12]">
          <span className="block overflow-hidden py-[0.12em]">
            <span ref={titleInnerRef} className="block">
              حاضنة الزيتونة
            </span>
          </span>
        </h1>

        {/* Tagline — masked line reveal */}
        <p className="mt-3 text-lg sm:text-2xl font-bold text-white/85 max-w-2xl leading-relaxed">
          <span className="block overflow-hidden py-[0.12em]">
            <span ref={taglineInnerRef} className="block">
              نزرع الأفكار، ونرعى نموّها حتى تُثمر مشاريعَ حقيقية
            </span>
          </span>
        </p>

        {/* Gold divider */}
        <div
          ref={dividerRef}
          className="w-24 h-1 rounded-full bg-secondary my-8 origin-center"
        />

        {/* Auth-aware CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 min-h-[56px]">
          {!authReady ? (
            <div className="w-52 h-14 rounded-2xl bg-white/10 animate-pulse" />
          ) : isSignedIn ? (
            <Link href={dashboardHref} className={goldBtn}>
              <LayoutDashboard className="w-5 h-5" />
              {userName ? `لوحة ${userName}` : "اذهب إلى لوحتي"}
            </Link>
          ) : (
            <>
              <Link href="/register" className={goldBtn}>
                <Rocket className="w-5 h-5" />
                ابدأ رحلتك الآن
              </Link>
              <Link href="/login" className={glassBtn}>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        ref={cueRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/70"
      >
        <span className="text-xs font-bold tracking-wider">مرّر للأسفل</span>
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  );
}
