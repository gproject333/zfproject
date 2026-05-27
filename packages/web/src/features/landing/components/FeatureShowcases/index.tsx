"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { getRoleHomepage } from "@smart-zuj/core";
import { SubmitShowcase } from "./showcases/Submit";
import { TrackShowcase } from "./showcases/Track";
import { LearnShowcase } from "./showcases/Learn";
import { WhatsappShowcase } from "./showcases/Whatsapp";
import { ThemeShowcase } from "./showcases/Theme";

/**
 * Auth-aware CTA targets for the three showcases. Non-authed visitors are
 * always pushed to /register so they don't hit a Clerk login wall after a
 * marketing click; signed-in users are routed to the role-appropriate
 * surface for that section (their dashboard for "Track", their articles
 * library for "Learn", the new-application flow for "Submit"). Skipping
 * the role check until Convex has the user means we render `/register`
 * for the first paint and upgrade once the role resolves.
 */
function useShowcaseCtas() {
  const { isLoaded, isSignedIn } = useAuth();
  const user = useQuery(
    api.users.shared.currentUser,
    isLoaded && isSignedIn ? undefined : "skip",
  );

  const signedIn = isLoaded && !!isSignedIn;
  const role = user?.role;

  // SUBMIT — only students submit applications. Other roles get pointed
  // to their dashboard; guests to /register.
  const submitHref = !signedIn
    ? "/register"
    : role === "student"
      ? "/student/new"
      : getRoleHomepage(role);

  // TRACK — the role's own dashboard, or /register for guests.
  const trackHref = !signedIn ? "/register" : getRoleHomepage(role);

  // LEARN — students + supervisors have their own articles routes; admins
  // and sponsors fall back to the student-style library which the
  // notification bell already deep-links to.
  const learnHref = !signedIn
    ? "/register"
    : role === "supervisor"
      ? "/supervisor/articles"
      : "/student/articles";

  return { submitHref, trackHref, learnHref };
}

/**
 * Three full-feature showcases that each get hero-style breathing room:
 * substantial copy + a detailed product mockup + a CTA. They alternate
 * layout (mockup left / right / left) for visual rhythm and replace the
 * compact 3-card ProductPreview grid.
 *
 * Stays within DESIGN.md: light surface, no decorative motion at rest,
 * entrance reveal only, all status colors via tokens.
 */
export default function FeatureShowcases() {
  const ctas = useShowcaseCtas();
  return (
    <div className="relative">
      <SubmitShowcase ctaHref={ctas.submitHref} />
      <WhatsappShowcase ctaHref={ctas.submitHref} />
      <TrackShowcase ctaHref={ctas.trackHref} />
      <ThemeShowcase ctaHref={ctas.trackHref} />
      <LearnShowcase ctaHref={ctas.learnHref} />
    </div>
  );
}

/* ─────────────────────── Shared section primitives ─────────────────────── */

export function FeatureSection({
  headline,
  highlight,
  description,
  bullets,
  cta,
  ctaHref,
  mockup,
  mockupSide,
}: {
  headline: string;
  highlight: string;
  description: string;
  bullets: { icon: LucideIcon; label: string }[];
  cta: string;
  ctaHref: string;
  mockup: React.ReactNode;
  mockupSide: "left" | "right";
}) {
  const reduce = useReducedMotion();
  const copyOrder = mockupSide === "right" ? "order-1 lg:order-1" : "order-1 lg:order-2";
  const mockupOrder = mockupSide === "right" ? "order-2 lg:order-2" : "order-2 lg:order-1";

  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`${copyOrder} text-right`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.15] text-foreground">
            {headline}{" "}
            <span className="text-primary">{highlight}</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-foreground/65 font-medium leading-relaxed max-w-xl">
            {description}
          </p>

          <ul className="mt-7 space-y-3">
            {bullets.map((b) => (
              <li key={b.label} className="flex items-start gap-3 text-sm sm:text-base">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-3.5 h-3.5 text-primary" />
                </span>
                <span className="font-medium text-foreground/85">{b.label}</span>
              </li>
            ))}
          </ul>

          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold text-base ds-shadow-sm hover:bg-accent transition-colors"
          >
            {cta}
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className={`${mockupOrder} relative`}
        >
          {/* Decorative offset card behind */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-primary/8 -rotate-[2deg] translate-x-3 translate-y-3"
          />
          <div className="relative">{mockup}</div>
        </motion.div>
      </div>
    </section>
  );
}

export function MockupFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl bg-card overflow-hidden ds-border shadow-[0_20px_50px_-20px_rgba(31,92,46,0.25)]"
      aria-hidden
    >
      {children}
    </div>
  );
}

export function MockupHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-5 pb-4 border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
      <h3 className="text-base font-extrabold text-foreground">{title}</h3>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}
