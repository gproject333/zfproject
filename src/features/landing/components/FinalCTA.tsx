"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { JoinIcon } from "@/components/CustomIcons";

/**
 * The closing call-to-action. Olive-branch silhouettes in the corners and a
 * gradient mesh background carry the page's identity to the very last
 * pixel before the footer.
 */
export default function FinalCTA() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-primary/20"
             style={{
               background:
                 "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 60%, color-mix(in srgb, var(--color-primary) 80%, black) 100%)",
             }}>
          {/* Faint olive-branch silhouettes in the corners */}
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

          <div className="relative z-[1] max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-white/80 mb-5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 ring-1 ring-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              ابدأ اليوم — مجاناً
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              جاهز تزرع فكرتك؟
            </h2>
            <p className="text-base md:text-lg text-white/80 font-medium max-w-xl mx-auto mb-9 leading-relaxed">
              انضم لمئات الطلاب الذين حوّلوا أفكارهم إلى مشاريع حقيقية. قدّم
              طلبك الآن وابدأ رحلتك مع حاضنة الزيتونة.
            </p>

            <Link
              href={isAuthenticated ? "/student" : "/register"}
              className="inline-flex items-center gap-2 px-9 py-4 bg-white text-primary font-black text-base rounded-2xl shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <JoinIcon className="w-5 h-5" />
              {isAuthenticated ? "الذهاب للوحة التحكم" : "قدّم مشروعك الآن"}
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
