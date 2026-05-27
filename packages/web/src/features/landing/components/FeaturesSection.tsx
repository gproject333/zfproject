"use client";

import { type ComponentType, type MouseEvent, type SVGProps } from "react";
import { ArrowLeft, Users, Lightbulb, Code2, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import CountUp from "./CountUp";

/**
 * Stable Unsplash portraits used as community avatars next to the
 * "+1200 طالب مسجَّل" stat. They're free to embed and Unsplash is
 * already allow-listed in next.config remotePatterns.
 */
const COMMUNITY_AVATARS: { src: string; alt: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces&q=80",
    alt: "طالبة في حاضنة الزيتونة",
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces&q=80",
    alt: "طالب في حاضنة الزيتونة",
  },
  {
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces&q=80",
    alt: "طالبة في حاضنة الزيتونة",
  },
  {
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=faces&q=80",
    alt: "طالب في حاضنة الزيتونة",
  },
];

/** Update CSS variables on the card so the spotlight tracks the cursor. */
function useSpotlight() {
  return (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };
}

/**
 * Bento grid of project tracks. One tall hero card on the left + two
 * smaller cards on the right + a wide social-proof tile underneath the
 * smaller cards. Hover lifts each tile and pulls the gradient ring tighter.
 */

interface Feature {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  tag: string;
  /** Brand accent colour used for the icon background + gradient ring. */
  tone: "primary" | "secondary" | "accent";
  /** Application type id — deep-links a signed-in user straight to the
   *  matching submission form (`/student/new/<typeId>`). */
  typeId: string;
}

const FEATURES: Feature[] = [
  {
    icon: Lightbulb,
    title: "فكرة ريادية",
    desc: "مسار مخصَّص لتطوير الأفكار التجارية الناشئة بإشراف أكاديمي، يشمل دراسة السوق وبناء النموذج الأولي وفق منهجية معتمدة.",
    tag: "Startup",
    tone: "primary",
    typeId: "entrepreneurial_idea",
  },
  {
    icon: Code2,
    title: "مشروع تخرج (IT)",
    desc: "مسار لمشاريع التخرج التقنية ضمن تخصصات تكنولوجيا المعلومات، بدعم تقني وإشراف أكاديمي مباشر.",
    tag: "Tech",
    tone: "secondary",
    typeId: "it_graduation",
  },
  {
    icon: Building2,
    title: "مشروع يخدم الجامعة",
    desc: "مسار للمشاريع التي تقدم حلولًا تطبيقية تخدم المجتمع الجامعي وتُسهم في تطوير الخدمات الأكاديمية والإدارية.",
    tag: "Academic",
    tone: "accent",
    typeId: "university_entrepreneurial",
  },
];

function FeatureCard({
  f,
  large = false,
  isSignedIn,
}: {
  f: Feature;
  large?: boolean;
  /** When signed in, the card links to the submission form instead of register. */
  isSignedIn: boolean;
}) {
  const Icon = f.icon;
  const onMove = useSpotlight();
  const href = isSignedIn ? `/student/new/${f.typeId}` : "/register";
  const toneBg = {
    primary: "bg-white text-primary",
    secondary: "bg-white text-secondary",
    accent: "bg-white text-accent",
  }[f.tone];
  const toneRing = {
    primary: "ring-primary/20 hover:ring-primary/40 group-hover:shadow-primary/20",
    secondary: "ring-secondary/20 hover:ring-secondary/40 group-hover:shadow-secondary/20",
    accent: "ring-accent/20 hover:ring-accent/40 group-hover:shadow-accent/20",
  }[f.tone];

  return (
    <Link
      href={href}
      onMouseMove={onMove}
      className={`group relative block overflow-hidden rounded-3xl glass ring-1 ${toneRing}
                  transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl
                  ${large ? "p-8 sm:p-10 h-full" : "p-6 sm:p-7"}`}
    >
      {/* Mouse-tracked spotlight — appears on hover, follows the cursor. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-${f.tone}) 14%, transparent), transparent 50%)`,
        }}
      />
      {/* Soft tone gradient seeping in from the top-left corner */}
      <div
        aria-hidden
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, var(--color-${f.tone}) 0%, transparent 70%)` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div
            className={`${toneBg} ${large ? "w-20 h-20" : "w-14 h-14"} rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon className={large ? "w-10 h-10" : "w-7 h-7"} strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-black tracking-wider uppercase text-foreground/40 bg-foreground/5 px-2.5 py-1 rounded-full">
            {f.tag}
          </span>
        </div>

        <h3 className={`font-black mb-2 leading-tight ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>
          {f.title}
        </h3>
        <p className={`text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed ${large ? "text-base mb-8" : "text-sm mb-5"}`}>
          {f.desc}
        </p>

        <div className="flex items-center gap-1 text-primary font-bold text-sm group-hover:gap-3 transition-all">
          <span>تقديم الطلب</span>
          <ArrowLeft className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

export default function FeaturesSection() {
  // Signed-in users skip register and deep-link into the submission form.
  const { isLoaded, isSignedIn } = useAuth();
  const signedIn = isLoaded && !!isSignedIn;
  return (
    <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
      <div className="relative z-[1] max-w-7xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            مسارات{" "}
            <span className="text-primary">الاحتضان المعتمدة</span>
          </h2>
          <p className="text-foreground/60 mt-4 text-base sm:text-lg">
            تُتاح ثلاثة مسارات رسمية للاحتضان وفق طبيعة المشروع، ويُختار المسار المناسب بالتنسيق مع المشرف الأكاديمي.
          </p>
        </div>

        {/* Bento grid: 3 cols on desktop, 1 large + 2 small + 1 social-proof wide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:auto-rows-fr">
          {/* Tall hero card on the right side in RTL (col-start-1 in DOM is the visual right) */}
          <div className="md:row-span-2">
            <FeatureCard f={FEATURES[0]} large isSignedIn={signedIn} />
          </div>
          <FeatureCard f={FEATURES[1]} isSignedIn={signedIn} />
          <FeatureCard f={FEATURES[2]} isSignedIn={signedIn} />

          {/* Social-proof tile — fills the bottom-right of the bento */}
          <div
            onMouseMove={useSpotlight()}
            className="md:col-span-2 group rounded-3xl glass ring-1 ring-foreground/10 p-6 sm:p-7 relative overflow-hidden transition-all hover:ring-primary/20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 55%)",
              }}
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full blur-3xl opacity-30"
              style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)" }}
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-secondary">
                  <Users className="w-3.5 h-3.5" />
                  مجتمع الحاضنة
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-1.5">
                  أكثر من{" "}
                  <CountUp to={1200} prefix="+" className="text-primary" /> طالب مسجَّل على المنصة
                </h3>
                <p className="text-sm text-foreground/65 font-medium">
                  تشمل المنصة مشاريع التخرج والأفكار الريادية والمشاريع التطبيقية التي تخدم الجامعة.
                </p>
              </div>

              <div className="flex -space-x-2 -space-x-reverse shrink-0">
                {COMMUNITY_AVATARS.map((avatar, i) => (
                  <div
                    key={i}
                    className="relative w-10 h-10 rounded-full ring-2 ring-background shadow overflow-hidden bg-muted"
                  >
                    <Image
                      src={avatar.src}
                      alt={avatar.alt}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full ring-2 ring-background bg-foreground/10 flex items-center justify-center text-xs font-black text-foreground/70">
                  +
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
