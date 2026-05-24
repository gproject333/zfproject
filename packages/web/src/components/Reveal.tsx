"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

type RevealAnimation = "slide-up" | "fade-in" | "scale-in" | "slide-right" | "slide-left";

interface RevealProps {
  children: ReactNode;
  /** Which keyframe animation to play (maps to globals.css classes). */
  animation?: RevealAnimation;
  /** Delay in ms before the animation starts — useful for stagger effects. */
  delay?: number;
  /** Visibility threshold (0–1). Default: 0.15. */
  threshold?: number;
  /** Re-play whenever the element re-enters the viewport. Default: false. */
  replay?: boolean;
  /** Extra class names merged onto the wrapping element. */
  className?: string;
}

const ANIMATION_CLASS: Record<RevealAnimation, string> = {
  "slide-up": "animate-slide-up",
  "fade-in": "animate-fade-in",
  "scale-in": "animate-scale-in",
  "slide-right": "animate-slide-right",
  "slide-left": "animate-slide-left",
};

/**
 * Plays a keyframe animation (defined in globals.css) once the wrapping
 * element enters the viewport. Honors `prefers-reduced-motion` by
 * rendering children immediately without any animation.
 */
export default function Reveal({
  children,
  animation = "slide-up",
  delay = 0,
  threshold = 0.15,
  replay = false,
  className,
}: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: !replay, threshold });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn(inView ? ANIMATION_CLASS[animation] : "opacity-0", className)}
      style={inView && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
