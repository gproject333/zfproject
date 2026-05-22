"use client";

import { Sprout } from "lucide-react";

/**
 * A slow, infinite horizontal ticker showcasing the kinds of projects that
 * graduate from the incubator. Sits right below the hero and gives the
 * page a moment of subtle motion before the static content sections begin.
 *
 * Uses the existing `marquee` keyframes from globals.css. The track is
 * duplicated so the loop is seamless. Pause-on-hover via `.ds-marquee-track`.
 */

const ITEMS = [
  "تطبيقات الويب",
  "تطبيقات الجوال",
  "الذكاء الاصطناعي",
  "الواقع المعزّز",
  "الأمن السيبراني",
  "ريادة الأعمال",
  "إنترنت الأشياء",
  "أبحاث علمية",
  "تجارة إلكترونية",
  "التصميم التفاعلي",
  "تحليل البيانات",
  "روبوتات وأتمتة",
];

export default function MarqueeStrip() {
  return (
    <section
      aria-label="مجالات المشاريع"
      className="relative w-full py-8 ds-marquee-track overflow-hidden border-y border-foreground/5 bg-foreground/[0.015]"
    >
      {/* Edge fade — content fades into the background at the strip ends. */}
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0  w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

      {/* Two copies of the track — the keyframe slides one full content-width. */}
      <div className="animate-marquee gap-8 sm:gap-12 whitespace-nowrap">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex items-center gap-8 sm:gap-12 px-6 shrink-0"
          >
            {ITEMS.map((item, i) => (
              <li
                key={`${copy}-${i}`}
                className="flex items-center gap-3 text-foreground/60 hover:text-primary transition-colors"
              >
                <Sprout className="w-4 h-4 text-primary/60 shrink-0" />
                <span className="text-sm sm:text-base font-bold tracking-wide">{item}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
