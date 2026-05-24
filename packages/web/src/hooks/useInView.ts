"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export interface UseInViewOptions {
  /** Stop observing after the first intersection. Default: true. */
  once?: boolean;
  /** IntersectionObserver threshold (0–1). Default: 0.15. */
  threshold?: number;
  /** IntersectionObserver rootMargin. Default: "0px". */
  rootMargin?: string;
}

/**
 * Observes an element and reports whether it is currently intersecting
 * the viewport. When `once` is true (the default) the observer
 * disconnects after the first intersection so the flag never flips back.
 *
 * In environments without IntersectionObserver (e.g. older browsers or
 * certain SSR paths) the flag is reported as `true` immediately so
 * content never gets stuck in its pre-reveal state.
 */
export function useInView<T extends Element = HTMLElement>(
  options: UseInViewOptions = {},
): readonly [RefObject<T | null>, boolean] {
  const { once = true, threshold = 0.15, rootMargin = "0px" } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, inView] as const;
}
