"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getPlatformMeta } from "@/lib/configs/socialPlatforms";
import OliveLogo from "./OliveLogo";

/**
 * Global footer. Single olive logo (matches the navbar), one tagline,
 * a small "quick links" group, admin-managed social icons, and a single
 * copyright line. No neobrutalism leftovers (thick borders, animated
 * border pulses) — DESIGN.md "Soft-Only Rule" applies here too.
 */
const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "الرئيسية", href: "/" },
  { label: "تسجيل الدخول", href: "/login" },
  { label: "إنشاء حساب", href: "/register" },
];

export default function AppFooter() {
  const year = new Date().getFullYear();
  // Admin-managed social links. Undefined while loading, [] when none configured.
  const socialLinks = useQuery(api.socialLinks.listActive, {});

  return (
    <footer className="mt-auto border-t border-foreground/15">
      <div className="bg-foreground text-background px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-10 sm:grid-cols-[1fr_auto] items-start mb-10">
            {/* Brand + tagline */}
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group" aria-label="حاضنة الزيتونة — الصفحة الرئيسية">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 transition-transform group-hover:-rotate-3">
                  <OliveLogo className="w-9 h-9" />
                </div>
                <div>
                  <p className="font-extrabold text-lg leading-tight text-background">حاضنة الزيتونة</p>
                  <p className="text-xs text-background/65 font-medium mt-0.5">
                    منصّة احتضان مشاريع جامعة الزيتونة الأردنية
                  </p>
                </div>
              </Link>
            </div>

            {/* Quick links */}
            <nav aria-label="روابط سريعة">
              <p className="text-[11px] font-extrabold text-background/55 uppercase tracking-wide mb-3">
                روابط سريعة
              </p>
              <ul className="flex flex-col gap-2 text-sm font-medium">
                {QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-background/80 hover:text-background hover:underline underline-offset-4 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social links — admin-managed. Each link opens in a new tab. */}
          {socialLinks && socialLinks.length > 0 && (
            <ul
              className="flex flex-wrap items-center gap-2 mb-8"
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
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-background/20 bg-background/5 text-background/85 hover:text-primary hover:border-primary hover:bg-background transition-colors"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="h-px bg-background/15 mb-6" />

          <p className="text-xs text-background/65 font-medium">
            © {year} حاضنة الزيتونة — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
