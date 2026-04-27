"use client";

import { useQuery } from "convex/react";
import { GraduationCap, Heart } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { getPlatformMeta } from "@/lib/configs/socialPlatforms";

export default function AppFooter() {
  const year = new Date().getFullYear();
  // Admin-managed social links. Undefined while the query is loading
  // (renders the brand row only), empty array when no links are
  // configured yet (renders nothing in that slot).
  const socialLinks = useQuery(api.socialLinks.listActive, {});

  return (
    <footer className="mt-auto border-t-[3px] border-foreground">
      <div className="bg-foreground text-background px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Brand row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary nb-border-thick rounded-xl flex items-center justify-center nb-shadow-sm shrink-0 animate-pulse-border">
                <GraduationCap className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="font-extrabold text-lg leading-tight text-background">حاضنة الزيتونة</p>
                <p className="text-xs text-background/70 font-medium">ZUJ Incubator Platform</p>
              </div>
            </div>

            {/* Social links — admin-managed. Each link opens in a new tab. */}
            {socialLinks && socialLinks.length > 0 && (
              <ul
                className="flex flex-wrap items-center justify-center gap-2.5"
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
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-background/30 bg-background/10 text-background/90 hover:text-primary hover:border-primary hover:bg-primary/10 transition-colors"
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="h-px bg-background/15 mb-6" />

          <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 text-xs text-background/65 font-medium w-full">
            <p className="mr-auto sm:mr-auto">
              حاضنة الزيتونة — جميع الحقوق محفوظ {year} ©
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
