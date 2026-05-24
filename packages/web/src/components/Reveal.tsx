"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void): () => void {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

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
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

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
