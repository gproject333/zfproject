"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Mail, Heart } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { getPlatformMeta } from "@/lib/configs/socialPlatforms";
import OliveLogo from "./OliveLogo";

/**
 * Global footer. Soft olive-mist background, four-column layout:
 *   1. Brand — large logo + tagline.
 *   2. للطلاب — student routes.
 *   3. المنصة — about / FAQ / auth.
 *   4. تواصل — contact + social.
 *
 * The footer stays inside the Olive Reading Room family rather than
 * switching to a dark "SaaS footer" mode. Background is a subtle
 * primary-tinted gradient over the muted token; decorative orbs in
 * the corners pick up the same blurred olive light used by the hero.
 */
const STUDENT_LINKS: { label: string; href: string }[] = [
  { label: "تقديم طلب جديد", href: "/student/new" },
  { label: "طلباتي", href: "/student/applications" },
  { label: "المقالات", href: "/student/articles" },
  { label: "دليل التقديم", href: "/student/guide" },
];

const PLATFORM_LINKS: { label: string; href: string }[] = [
  { label: "الصفحة الرئيسية", href: "/" },
  { label: "إنشاء حساب", href: "/register" },
  { label: "تسجيل الدخول", href: "/login" },
  { label: "استعادة كلمة المرور", href: "/forgot-password" },
];

export default function AppFooter() {
  const year = new Date().getFullYear();
  const socialLinks = useQuery(api.socialLinks.listActive, {});

  return (
    <footer
      className="app-footer relative mt-auto overflow-hidden border-t border-foreground/8"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--muted) 75%, var(--background)) 0%, var(--muted) 100%)",
      }}
    >
      {/* Soft tinted orbs in the corners — same vocabulary the hero uses. */}
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-[320px] h-[320px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-20 w-[360px] h-[360px] rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ background: "var(--color-secondary)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] mb-12">
          {/* Brand column */}
          <div className="lg:pl-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label="حاضنة الزيتونة — الصفحة الرئيسية"
            >
              <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center shrink-0 transition-transform group-hover:-rotate-3 shadow-[0_8px_24px_-6px_rgba(31,92,46,0.18)] ds-border">
                <OliveLogo className="w-12 h-12" />
              </div>
              <div>
                <p className="font-extrabold text-2xl leading-tight text-foreground">حاضنة الزيتونة</p>
                <p className="text-sm text-foreground/70 font-bold tracking-wide mt-1">
                  ZUJ INCUBATOR
                </p>
              </div>
            </Link>
            <p className="text-base text-foreground/85 font-medium leading-relaxed mt-5 max-w-sm">
              منصّة احتضان المشاريع الريادية والتقنية والأكاديمية لطلبة
              جامعة الزيتونة الأردنية، من مرحلة الفكرة إلى مشروع مكتمل الدعم.
            </p>
          </div>

          {/* Student links column */}
          <nav aria-label="روابط الطلاب">
            <p className="text-xs font-extrabold text-foreground/80 uppercase tracking-[0.15em] mb-4">
              للطلاب
            </p>
            <ul className="space-y-3 text-base font-semibold">
              {STUDENT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-foreground/90 hover:text-primary hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Platform links column */}
          <nav aria-label="روابط المنصة">
            <p className="text-xs font-extrabold text-foreground/80 uppercase tracking-[0.15em] mb-4">
              المنصة
            </p>
            <ul className="space-y-3 text-base font-semibold">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-foreground/90 hover:text-primary hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact column */}
          <div>
            <p className="text-xs font-extrabold text-foreground/80 uppercase tracking-[0.15em] mb-4">
              تواصل
            </p>
            <a
              href="mailto:incubator@zuj.edu.jo"
              className="inline-flex items-center gap-2 text-base font-semibold text-foreground/90 hover:text-primary mb-5"
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
                        className="w-11 h-11 flex items-center justify-center rounded-lg bg-card ds-border text-foreground/85 hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
                      >
                        <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div
          className="h-px w-full mb-6"
          style={{
            background:
              "linear-gradient(to left, transparent, color-mix(in srgb, var(--foreground) 12%, transparent), transparent)",
          }}
          aria-hidden
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-foreground/80 font-semibold">
          <p>© {year} حاضنة الزيتونة — جميع الحقوق محفوظة</p>
          <p className="inline-flex items-center gap-1.5">
            طُوِّرت في
            <Heart className="w-3.5 h-3.5 text-secondary fill-secondary" aria-hidden />
            جامعة الزيتونة الأردنية
          </p>
        </div>
      </div>
    </footer>
  );
}
