"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

/**
 * Animated SVG olive tree — the hero centrepiece.
 *
 * Mount sequence (~2.4s, single GSAP timeline):
 *   1. Trunk fades in instantly (no draw — it reads as "always there")
 *   2. Main branches: stroke-dashoffset draw, stagger 60ms
 *   3. Secondary branches: stroke draw, stagger 40ms
 *   4. Leaves: scale 0 → 1 with random-order stagger and back-out ease
 *   5. Olives: elastic pop with stagger
 * After mount, CSS class `.tree-sway` (defined in globals.css) takes over with
 * a 6s rotate ±1° loop. `prefers-reduced-motion` shows the fully-drawn tree
 * instantly via gsap.matchMedia.
 */

/** Branch endpoints around which leaves cluster. */
const LEAF_TIPS: Array<{ x: number; y: number; count: number; radius: number }> = [
  { x: 140, y: 320, count: 7, radius: 24 }, // far left
  { x: 460, y: 320, count: 7, radius: 24 }, // far right
  { x: 230, y: 240, count: 7, radius: 24 }, // upper left
  { x: 370, y: 240, count: 7, radius: 24 }, // upper right
  { x: 300, y: 195, count: 9, radius: 28 }, // top centre — densest
  { x: 130, y: 290, count: 5, radius: 20 },
  { x: 470, y: 290, count: 5, radius: 20 },
  { x: 200, y: 280, count: 5, radius: 20 },
  { x: 400, y: 280, count: 5, radius: 20 },
  { x: 270, y: 290, count: 4, radius: 16 },
  { x: 330, y: 290, count: 4, radius: 16 },
  // Soft mid-canopy fill
  { x: 250, y: 340, count: 4, radius: 16 },
  { x: 350, y: 340, count: 4, radius: 16 },
];

/** Hand-picked olive positions — fewer, more deliberate placement than leaves. */
const OLIVES: Array<{ cx: number; cy: number }> = [
  { cx: 160, cy: 312 },
  { cx: 200, cy: 268 },
  { cx: 445, cy: 312 },
  { cx: 408, cy: 268 },
  { cx: 250, cy: 250 },
  { cx: 348, cy: 250 },
  { cx: 300, cy: 215 },
];

export default function OliveTreeSVG({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  /** Pre-compute leaf positions deterministically so SSR and CSR agree. */
  const leaves = useMemo(() => {
    const out: Array<{ cx: number; cy: number; rot: number; rx: number; ry: number; id: string }> = [];
    LEAF_TIPS.forEach((tip, i) => {
      for (let j = 0; j < tip.count; j++) {
        // Deterministic-but-varied angle/distance using prime offsets.
        const angle = (j * 360) / tip.count + i * 17;
        const dist = tip.radius * (0.6 + ((j * 7) % 5) * 0.1);
        const cx = tip.x + Math.cos((angle * Math.PI) / 180) * dist;
        const cy = tip.y + Math.sin((angle * Math.PI) / 180) * dist;
        const rot = angle + 30; // align leaf long-axis with radial direction
        const rx = 7 + ((j + i) % 3); // 7-9
        const ry = 3;
        out.push({ cx, cy, rot, rx, ry, id: `${i}-${j}` });
      }
    });
    return out;
  }, []);

  useLayoutEffect(() => {
    const root = svgRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const branches = root.querySelectorAll<SVGPathElement>("[data-draw]");
        const leafEls = root.querySelectorAll<SVGEllipseElement>("[data-leaf]");
        const oliveEls = root.querySelectorAll<SVGCircleElement>("[data-olive]");

        // Initialise dashed-stroke state for every drawable path.
        branches.forEach((p) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
        });
        gsap.set(leafEls, { scale: 0, opacity: 0, transformOrigin: "center center" });
        gsap.set(oliveEls, { scale: 0, transformOrigin: "center center" });

        const tl = gsap.timeline();
        // Branches draw — primary stems first (data-primary), then secondary.
        const primary = root.querySelectorAll("[data-draw][data-primary]");
        const secondary = root.querySelectorAll("[data-draw]:not([data-primary])");

        tl.to(primary, {
          strokeDashoffset: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: "power2.out",
        });
        tl.to(secondary, {
          strokeDashoffset: 0,
          duration: 0.45,
          stagger: 0.035,
          ease: "power2.out",
        }, "-=0.25");
        tl.to(leafEls, {
          scale: 1,
          opacity: 1,
          duration: 0.55,
          stagger: { each: 0.012, from: "random" },
          ease: "back.out(2.2)",
        }, "-=0.15");
        tl.to(oliveEls, {
          scale: 1,
          duration: 0.55,
          stagger: 0.04,
          ease: "elastic.out(1.2, 0.55)",
        }, "-=0.3");
      });

      // Reduced-motion branch: fully composed instantly.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const branches = root.querySelectorAll<SVGPathElement>("[data-draw]");
        branches.forEach((p) => {
          p.style.strokeDasharray = "";
          p.style.strokeDashoffset = "0";
        });
        gsap.set(root.querySelectorAll("[data-leaf]"), { scale: 1, opacity: 1 });
        gsap.set(root.querySelectorAll("[data-olive]"), { scale: 1 });
      });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 700"
      className={`tree-sway ${className}`}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a2614" />
          <stop offset="0.5" stopColor="#5a3a1f" />
          <stop offset="1" stopColor="#2c1c0d" />
        </linearGradient>
        <radialGradient id="oliveGrad" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#5a3d6e" />
          <stop offset="0.7" stopColor="#2B1F3A" />
          <stop offset="1" stopColor="#16111f" />
        </radialGradient>
        <radialGradient id="leafGrad" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="var(--color-accent, #2D7A3E)" />
          <stop offset="1" stopColor="var(--color-primary, #1F5C2E)" />
        </radialGradient>
        <radialGradient id="leafGradLight" cx="0.4" cy="0.25" r="0.75">
          <stop offset="0" stopColor="#7fb685" />
          <stop offset="1" stopColor="var(--color-accent, #2D7A3E)" />
        </radialGradient>
      </defs>

      {/* Soft ground ellipse — anchors the tree visually so it doesn't float. */}
      <ellipse cx="300" cy="702" rx="120" ry="8" fill="var(--color-primary, #1F5C2E)" opacity="0.12" />

      {/* Trunk — wider, with subtle taper. */}
      <path
        d="M 281 700
           C 276 620, 280 540, 290 460
           L 310 460
           C 320 540, 324 620, 319 700 Z"
        fill="url(#trunkGrad)"
      />
      {/* Trunk texture — bark grooves. */}
      <g stroke="#1a0f08" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none">
        <path d="M 292 670 C 295 600, 294 540, 296 480" />
        <path d="M 306 670 C 304 600, 305 540, 303 480" />
        <path d="M 299 670 C 300 600, 300 540, 300 480" opacity="0.35" />
      </g>

      {/* A few grass blades at the trunk base. */}
      <g stroke="var(--color-primary, #1F5C2E)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55">
        <path d="M 255 700 Q 252 685, 260 670" />
        <path d="M 270 700 Q 273 686, 268 672" />
        <path d="M 330 700 Q 333 685, 326 670" />
        <path d="M 345 700 Q 342 686, 350 672" />
      </g>

      {/* Primary branches — drawn first. */}
      <g
        stroke="var(--color-primary, #1F5C2E)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      >
        <path data-draw data-primary d="M 300 475 C 240 440, 190 395, 145 330" />
        <path data-draw data-primary d="M 300 475 C 360 440, 410 395, 455 330" />
        <path data-draw data-primary d="M 300 470 C 275 395, 250 320, 235 245" />
        <path data-draw data-primary d="M 300 470 C 325 395, 350 320, 365 245" />
        <path data-draw data-primary d="M 300 470 C 295 360, 298 290, 300 210" />
      </g>

      {/* Secondary branches — drawn after primary with a finer stroke. */}
      <g
        stroke="var(--color-primary, #1F5C2E)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      >
        <path data-draw d="M 195 390 C 175 360, 155 325, 135 295" />
        <path data-draw d="M 230 360 C 215 330, 205 305, 200 280" />
        <path data-draw d="M 405 390 C 425 360, 445 325, 465 295" />
        <path data-draw d="M 370 360 C 385 330, 395 305, 400 280" />
        <path data-draw d="M 280 380 C 275 350, 273 320, 270 295" />
        <path data-draw d="M 320 380 C 325 350, 327 320, 330 295" />
        <path data-draw d="M 290 310 C 286 280, 286 250, 290 220" />
        <path data-draw d="M 310 310 C 314 280, 314 250, 310 220" />
      </g>

      {/* Leaves — colour-filled, deterministically scattered around branch tips.
          Alternate between two shades so the canopy reads as organic, not flat. */}
      <g>
        {leaves.map((l, idx) => (
          <ellipse
            key={l.id}
            data-leaf
            cx={l.cx}
            cy={l.cy}
            rx={l.rx}
            ry={l.ry}
            fill={idx % 3 === 0 ? "url(#leafGradLight)" : "url(#leafGrad)"}
            transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}
            opacity={idx % 3 === 0 ? 0.85 : 0.95}
          />
        ))}
      </g>

      {/* Olives — rendered AFTER leaves so they sit on top. Gold highlight ring. */}
      <g>
        {OLIVES.map((o, i) => (
          <g key={i}>
            <circle data-olive cx={o.cx} cy={o.cy} r="6.5" fill="url(#oliveGrad)" />
            <circle
              data-olive
              cx={o.cx - 1.5}
              cy={o.cy - 1.5}
              r="1.6"
              fill="var(--color-secondary, #C9A227)"
              opacity="0.8"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
