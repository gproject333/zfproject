"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import SettingsMenu from "@/components/SettingsMenu";
import { Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";

export interface SupervisorNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface Props {
  navItems: SupervisorNavItem[];
}

const COLLAPSED_KEY = "supervisor-sidebar-collapsed";

/**
 * The supervisor app-shell sidebar — a right-aligned panel (RTL start)
 * holding the brand, nav items, and a foot with notifications, settings,
 * and the collapse toggle. Desktop supports a collapsed icon-rail mode
 * (persisted in localStorage); mobile shows it as a slide-in drawer
 * opened by a floating button.
 *
 * Renders as a flex child meant to sit next to a `flex-1` content area,
 * so it can wrap both the supervisor dashboard and the landing page.
 */
export default function SupervisorSidebar({ navItems }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Read the persisted preference only after mount — a lazy useState
    // initializer would touch localStorage during SSR and mismatch on
    // hydration.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time sync from a browser-only API
      if (window.localStorage.getItem(COLLAPSED_KEY) === "0") setCollapsed(false);
    } catch { /* ignore */ }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch { /* ignore */ }
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
        className="md:hidden fixed top-4 right-4 z-40 nb-shadow-lg"
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
          } p-5 h-screen md:h-auto md:min-h-screen md:sticky md:top-0 bg-card nb-border-thick border-y-0 border-r-0 md:border-l-[3px] border-l-0 transition-all duration-200 ${
            open ? "ml-auto" : ""
          }`}
        >
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
            href="/supervisor"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 mb-8 pt-1 ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <div className="w-12 h-12 bg-white nb-border rounded-xl flex items-center justify-center nb-shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
            <div className={collapsed ? "md:hidden" : ""}>
              <p className="font-extrabold text-base leading-tight">حاضنة الزيتونة</p>
              <p className="text-[11px] text-muted-foreground font-bold">
                لوحة المشرف الأكاديمي
              </p>
            </div>
          </Link>

          {/* Nav items */}
          <div className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const linkClass = `flex items-center gap-3 rounded-lg text-sm font-bold transition-all nb-border ${
                collapsed ? "md:justify-center md:px-2 md:py-3 px-4 py-3" : "px-4 py-3"
              } ${
                isActive
                  ? "bg-accent text-accent-foreground nb-shadow-sm border-foreground"
                  : "bg-transparent border-transparent hover:bg-muted hover:border-foreground"
              }`;
              const content = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={linkClass}
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

          {/* Foot — notifications, settings, collapse toggle */}
          <div className="mt-3 pt-3 border-t border-border/60 flex flex-col gap-1.5">
            <div
              className={`flex items-center gap-1 ${
                collapsed ? "md:flex-col" : ""
              }`}
            >
              <NotificationBell />
              <SettingsMenu profileHref="/supervisor/profile" />
            </div>

            <Button
              onPress={toggleCollapsed}
              variant="ghost"
              size="sm"
              fullWidth
              className={`hidden md:flex ${collapsed ? "justify-center" : "justify-between"}`}
              aria-label={collapsed ? "توسيع" : "تصغير"}
            >
              {!collapsed && <span className="text-xs">تصغير</span>}
              {collapsed ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}
