"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Mail, Heart } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { getPlatformMeta } from "@/lib/configs/socialPlatforms";
import OliveLogo from "./OliveLogo";

/**
 * Global footer. Four columns on desktop:
 *   1. Brand — large logo + tagline + university line.
 *   2. للطلاب — student-facing routes.
 *   3. المنصة — about / FAQ / auth.
 *   4. تواصل — social icons + contact email.
 * Collapses to a single stacked column on mobile.
 *
 * Soft warm-dark background (deep olive tint) instead of pure black so
 * the page→footer transition stays inside the Olive Reading Room family
 * instead of feeling like a SaaS dark switch.
 */
const STUDENT_LINKS: { label: string; href: string }[] = [
  { label: "تقديم طلب جديد", href: "/student/new" },
  { label: "طلباتي", href: "/student/applications" },
  { label: "المقالات", href: "/student/articles" },
  { label: "الدليل الريادي", href: "/student/guide" },
];

const PLATFORM_LINKS: { label: string; href: string }[] = [
  { label: "الصفحة الرئيسية", href: "/" },
  { label: "إنشاء حساب", href: "/register" },
  { label: "تسجيل الدخول", href: "/login" },
  { label: "نسيت كلمة المرور", href: "/forgot-password" },
];

export default function AppFooter() {
  const year = new Date().getFullYear();
  const socialLinks = useQuery(api.socialLinks.listActive, {});

  return (
    <footer
      className="mt-auto text-background"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--foreground) 92%, var(--primary) 8%) 0%, var(--foreground) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] mb-12">
          {/* Brand column */}
          <div className="lg:pl-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label="حاضنة الزيتونة — الصفحة الرئيسية"
            >
              <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center shrink-0 transition-transform group-hover:-rotate-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)]">
                <OliveLogo className="w-12 h-12" />
              </div>
              <div>
                <p className="font-extrabold text-xl leading-tight">حاضنة الزيتونة</p>
                <p className="text-xs text-background/60 font-bold tracking-wide mt-1">
                  ZUJ INCUBATOR
                </p>
              </div>
            </Link>
            <p className="text-sm text-background/70 font-medium leading-relaxed mt-5 max-w-sm">
              منصّة احتضان المشاريع الريادية والتقنية والأكاديمية لطلاب
              جامعة الزيتونة الأردنية — من فكرة إلى مشروع مدعوم بالكامل.
            </p>
          </div>

          {/* Student links column */}
          <nav aria-label="روابط الطلاب">
            <p className="text-[11px] font-extrabold text-background/50 uppercase tracking-[0.15em] mb-4">
              للطلاب
            </p>
            <ul className="space-y-3 text-sm font-medium">
              {STUDENT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-background/80 hover:text-background hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Platform links column */}
          <nav aria-label="روابط المنصة">
            <p className="text-[11px] font-extrabold text-background/50 uppercase tracking-[0.15em] mb-4">
              المنصة
            </p>
            <ul className="space-y-3 text-sm font-medium">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-background/80 hover:text-background hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact column */}
          <div>
            <p className="text-[11px] font-extrabold text-background/50 uppercase tracking-[0.15em] mb-4">
              تواصل
            </p>
            <a
              href="mailto:incubator@zuj.edu.jo"
              className="inline-flex items-center gap-2 text-sm font-medium text-background/80 hover:text-background mb-5"
            >
              <Mail className="w-4 h-4" />
              incubator@zuj.edu.jo
            </a>

            {socialLinks && socialLinks.length > 0 && (
              <ul
                className="flex flex-wrap items-center gap-2"
                aria-label="روابط التواصل الاجتماعي"
              >
                {socialLinks.map((link) => {
                  const meta = getPlatformMeta(link.platform);
                  const Icon = meta.icon;
                  const accessibleLabel = link.label?.trim() || meta.label;
                  return (
                    <li key={link._id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={accessibleLabel}
                        title={accessibleLabel}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-background/20 bg-background/5 text-background/85 hover:text-primary hover:border-background hover:bg-background transition-colors"
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom strip — gradient divider + copyright row */}
        <div
          className="h-px w-full mb-6"
          style={{
            background:
              "linear-gradient(to left, transparent, color-mix(in srgb, var(--background) 25%, transparent), transparent)",
          }}
          aria-hidden
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-background/60 font-medium">
          <p>© {year} حاضنة الزيتونة — جميع الحقوق محفوظة</p>
          <p className="inline-flex items-center gap-1.5">
            صُنع بـ
            <Heart className="w-3.5 h-3.5 text-secondary fill-secondary" aria-hidden />
            في جامعة الزيتونة الأردنية
          </p>
        </div>
      </div>
    </footer>
  );
}
