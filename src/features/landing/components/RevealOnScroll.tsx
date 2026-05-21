"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps any block so it fades + slides up the first time it enters the
 * viewport. Used around every landing-page section so the page has a
 * consistent rhythm as the user scrolls. Respects reduced-motion.
 */

interface RevealOnScrollProps {
  children: ReactNode;
  /** Stagger this child's reveal so siblings can ladder in. Defaults to 0. */
  delay?: number;
  /** Slide distance in px. Default 40. */
  y?: number;
  /** Optional className passed through to the wrapper. */
  className?: string;
  /** Allow the reveal to repeat if the element leaves and re-enters. Default false. */
  repeat?: boolean;
}

export default function RevealOnScroll({
  children,
  delay = 0,
  y = 40,
  className,
  repeat = false,
}: RevealOnScrollProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, amount: 0.2 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
