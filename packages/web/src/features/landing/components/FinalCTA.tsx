"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Sparkles, Check, Rocket, BookOpen } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { JoinIcon } from "@/components/CustomIcons";

/**
 * The closing call-to-action. Olive-branch silhouettes in the corners and a
 * gradient mesh background carry the page's identity to the very last
 * pixel before the footer. Adds a trust strip under the buttons and a
 * secondary "browse types" CTA for first-time visitors so the section
 * stops feeling like a one-button dead end.
 */
const TRUST_POINTS = [
  "مجاني دائماً",
  "رد المشرف خلال 3–5 أيام",
  "بدون بطاقة ائتمان",
];

export default function FinalCTA() {
  const { isAuthenticated } = useConvexAuth();
  const reduce = useReducedMotion();

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <div
          className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-primary/20"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 60%, color-mix(in srgb, var(--color-primary) 80%, black) 100%)",
          }}
        >
          {/* Olive-branch silhouettes in the corners */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute -top-12 -right-12 w-64 h-64 opacity-[0.08] pointer-events-none"
          >
            <g fill="white">
              <path d="M 100 180 C 80 120, 70 80, 50 30 C 70 60, 90 100, 100 180 Z" />
              <ellipse cx="80" cy="60" rx="18" ry="7" transform="rotate(-30 80 60)" />
              <ellipse cx="65" cy="40" rx="16" ry="6" transform="rotate(-40 65 40)" />
              <ellipse cx="90" cy="90" rx="20" ry="7" transform="rotate(-20 90 90)" />
              <ellipse cx="95" cy="120" rx="22" ry="8" transform="rotate(-10 95 120)" />
            </g>
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute -bottom-16 -left-16 w-72 h-72 opacity-[0.06] pointer-events-none rotate-180"
          >
            <g fill="white">
              <path d="M 100 180 C 80 120, 70 80, 50 30 C 70 60, 90 100, 100 180 Z" />
              <ellipse cx="80" cy="60" rx="18" ry="7" transform="rotate(-30 80 60)" />
              <ellipse cx="65" cy="40" rx="16" ry="6" transform="rotate(-40 65 40)" />
              <ellipse cx="90" cy="90" rx="20" ry="7" transform="rotate(-20 90 90)" />
            </g>
          </svg>

          {/* Subtle radial highlight from top-centre */}
          <div
            aria-hidden
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 60%)",
            }}
          />

          {/* Slow floating sparkle motes — cinematic touch */}
          {!reduce && (
            <>
              <FloatingMote className="top-10 right-[18%]" size={6} delay={0} />
              <FloatingMote className="top-24 left-[22%]" size={4} delay={1.4} />
              <FloatingMote className="bottom-16 right-[28%]" size={5} delay={2.8} />
            </>
          )}

          <div className="relative z-[1] max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-white/85 mb-5 bg-white/12 backdrop-blur rounded-full px-3 py-1.5 ring-1 ring-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              ابدأ اليوم — مجاناً
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              جاهز تزرع فكرتك؟
            </h2>
            <p className="text-base md:text-lg text-white/85 font-medium max-w-xl mx-auto mb-9 leading-relaxed">
              انضم لمئات الطلاب الذين حوّلوا أفكارهم إلى مشاريع حقيقية. قدّم
              طلبك الآن وابدأ رحلتك مع حاضنة الزيتونة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-7">
              <Link
                href={isAuthenticated ? "/student" : "/register"}
                className="inline-flex items-center gap-2 px-9 py-4 bg-white text-primary font-black text-base rounded-2xl shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-transform"
              >
                {isAuthenticated ? (
                  <>
                    <JoinIcon className="w-5 h-5" />
                    الذهاب للوحة التحكم
                    <ArrowLeft className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    قدّم مشروعك الآن
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </Link>

              {!isAuthenticated && (
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-base rounded-2xl backdrop-blur-md ring-1 ring-white/25 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  كيف تشتغل المنصة؟
                </Link>
              )}
            </div>

            {/* Trust strip — sets expectations under the button. */}
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-bold text-white/75">
              {TRUST_POINTS.map((p) => (
                <li key={p} className="inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/15 ring-1 ring-white/25">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingMote({
  className,
  size,
  delay,
}: {
  className: string;
  size: number;
  delay: number;
}) {
  return (
    <motion.span
      aria-hidden
      className={`absolute rounded-full bg-white/70 pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: "0 0 12px rgba(255,255,255,0.7)",
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.9, 0], y: [0, -40, -80] }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}
