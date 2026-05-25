"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Everything a role needs to render its app-shell sidebar — brand badge,
 * nav items, active-link styling, and the settings/profile targets. Both
 * the supervisor and admin pass one of these (see `navItems.ts`).
 */
export interface AppSidebarConfig {
  /** Nav links shown in the sidebar. */
  navItems: SidebarNavItem[];
  /** Brand link target. */
  homeHref: string;
  /** Lucide icon shown in the 48px brand badge. */
  brandIcon: LucideIcon;
  /** Extra classes for the brand badge wrapper (background). */
  brandBadgeClassName?: string;
  /** Inline style for the brand badge wrapper (background color). */
  brandBadgeStyle?: CSSProperties;
  /** Classes for the brand icon glyph (color). */
  brandIconClassName: string;
  /** Caption shown under "حاضنة الزيتونة". */
  subtitle: string;
  /** Profile + logout targets handed to the settings menu. */
  profileHref: string;
  logoutHref?: string;
  /** Classes applied to the active nav link. */
  activeClassName: string;
  /** Inline style applied to the active nav link (e.g. background). */
  activeStyle?: CSSProperties;
  /** localStorage key persisting the collapsed preference per role. */
  storageKey: string;
}

interface Props {
  config: AppSidebarConfig;
}

/**
 * The shared app-shell sidebar — a right-aligned panel (RTL start)
 * holding the brand, nav items, and a foot with notifications, settings,
 * and the collapse toggle. No top navbar: every chrome control lives in
 * the sidebar. Desktop supports a collapsed icon-rail mode (persisted in
 * localStorage); mobile shows it as a slide-in drawer opened by a
 * floating button.
 *
 * Renders as a flex child meant to sit next to a `flex-1` content area,
 * so it can wrap both a role's dashboard and the landing page. The
 * {@link AppSidebarConfig} makes it role-agnostic — supervisor and admin
 * both feed it their own brand, nav items, and accent.
 */
export default function AppSidebar({ config }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const BrandIcon = config.brandIcon;

  useEffect(() => {
    // Read the persisted preference only after mount — a lazy useState
    // initializer would touch localStorage during SSR and mismatch on
    // hydration.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time sync from a browser-only API
      if (window.localStorage.getItem(config.storageKey) === "0") setCollapsed(false);
    } catch { /* ignore */ }
  }, [config.storageKey]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(config.storageKey, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <>
      {/* Mobile: floating trigger to open the sidebar drawer (no top bar) */}
      <Button
        onPress={() => setOpen(true)}
        variant="outline"
        size="sm"
        isIconOnly
        className="md:hidden fixed top-4 right-4 z-40 ds-shadow-lg"
        aria-label="فتح القائمة"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Sidebar — desktop persistent, mobile drawer */}
      <aside
        className={`${
          open
            ? "fixed inset-0 z-50 md:static md:inset-auto"
            : "hidden md:flex"
        } ${collapsed ? "md:w-20" : "md:w-64"} md:shrink-0 transition-[width] duration-200`}
      >
        {/* Mobile overlay */}
        {open && (
          <div
            className="absolute inset-0 bg-foreground/30 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <nav
          className={`relative flex flex-col w-72 ${
            collapsed ? "md:w-20 md:p-3" : "md:w-64 md:p-5"
          } p-5 h-screen md:h-auto md:min-h-screen md:sticky md:top-0 bg-card ds-border-thick border-y-0 border-r-0 md:border-l-[3px] border-l-0 transition-all duration-200 ${
            open ? "ml-auto" : ""
          }`}
        >
          {/* Modern edge-chevron collapse toggle — a small circular button
              that straddles the sidebar/content boundary near the top.
              Standard on Linear / Notion / Vercel; replaces the older
              footer button so collapsing is always one click away from the
              page top, not at the end of a long list. */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden md:flex absolute top-16 left-0 -translate-x-1/2 z-20
                       w-7 h-7 rounded-full bg-card border border-foreground/20
                       shadow-[0_2px_8px_rgba(0,0,0,0.08)] items-center justify-center
                       text-foreground/70 hover:text-foreground hover:bg-muted
                       hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:scale-105
                       transition-all duration-200"
            aria-label={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
            title={collapsed ? "التوسيع" : "التصغير"}
          >
            {collapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close */}
          {open && (
            <Button
              onPress={() => setOpen(false)}
              variant="outline"
              size="sm"
              isIconOnly
              className="md:hidden absolute top-4 left-4"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Brand */}
          <Link
            href={config.homeHref}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 mb-8 pt-1 ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <div
              className={`w-12 h-12 ds-border rounded-xl flex items-center justify-center ds-shadow-sm shrink-0 ${config.brandBadgeClassName ?? ""}`}
              style={config.brandBadgeStyle}
            >
              <BrandIcon className={`w-6 h-6 ${config.brandIconClassName}`} />
            </div>
            <div className={collapsed ? "md:hidden" : ""}>
              <p className="font-extrabold text-base leading-tight">حاضنة الزيتونة</p>
              <p className="text-[11px] text-muted-foreground font-bold">
                {config.subtitle}
              </p>
            </div>
          </Link>

          {/* Nav items */}
          <div className="space-y-1.5 flex-1">
            {config.navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const linkClass = `flex items-center gap-3 rounded-lg text-sm font-bold transition-all ds-border ${
                collapsed ? "md:justify-center md:px-2 md:py-3 px-4 py-3" : "px-4 py-3"
              } ${
                isActive
                  ? config.activeClassName
                  : "bg-transparent border-transparent hover:bg-muted hover:border-foreground"
              }`;
              const content = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                  style={isActive ? config.activeStyle : undefined}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={collapsed ? "md:hidden" : "truncate"}>{item.label}</span>
                </Link>
              );
              return collapsed ? (
                <Tooltip key={item.href} content={item.label} side="left">
                  {content}
                </Tooltip>
              ) : (
                content
              );
            })}
          </div>

        </nav>
      </aside>
    </>
  );
}
