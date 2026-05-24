"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Counts from 0 to `to` once when the element first scrolls into view.
 * Renders Arabic-Indic numerals. Respects reduced-motion (snaps to final
 * value immediately). Triggers exactly once.
 */

interface CountUpProps {
  /** Target value to count up to. */
  to: number;
  /** Animation duration in seconds. Default 1.6. */
  duration?: number;
  /** Prepended to the formatted number (e.g. "+" → "+١,٢٠٠"). */
  prefix?: string;
  /** Appended to the formatted number. */
  suffix?: string;
  /** Locale for number formatting. Default "ar-EG" for Arabic-Indic numerals. */
  locale?: string;
  /** Optional className passed to the span. */
  className?: string;
}

const formatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });

export default function CountUp({
  to,
  duration = 1.6,
  prefix = "",
  suffix = "",
  locale,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      // Reduced-motion users skip the animation and snap straight to the
      // final value. This is the effect's sole effect — there's no external
      // store to sync via the React 19 pattern.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setValue(latest),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  const fmt = locale ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }) : formatter;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {fmt.format(Math.round(value))}
      {suffix}
    </span>
  );
}
