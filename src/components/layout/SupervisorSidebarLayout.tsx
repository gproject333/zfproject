"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PanelRightOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import SettingsMenu from "@/components/SettingsMenu";
import { Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import RoleGuard from "@/components/RoleGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppFooter from "@/components/AppFooter";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";

export interface SupervisorNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface Props {
  navItems: SupervisorNavItem[];
  children: ReactNode;
}

const COLLAPSED_KEY = "supervisor-sidebar-collapsed";

/**
 * Supervisor-specific layout with a right-aligned sidebar (RTL start).
 * Desktop supports a collapsed mode where the sidebar shrinks to an
 * icon rail; labels become tooltips on hover. State is persisted in
 * localStorage so the preference survives navigation and reloads.
 * Mobile uses a hamburger + slide-in drawer regardless of the desktop
 * collapse state. Theme toggle + notifications + logout sit in a slim
 * top bar anchored to the left edge of the main content.
 */
export default function SupervisorSidebarLayout({ navItems, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
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

  const toggleHidden = () => setHidden(p => !p);

  return (
    <RoleGuard allowedRoles={["supervisor"]}>
      <div className="min-h-screen bg-pattern flex flex-col md:flex-row">
        {/* Sidebar — desktop persistent, mobile drawer */}
        <aside
          className={`${
            open
              ? "fixed inset-0 z-50 md:static md:inset-auto"
              : "hidden md:flex"
          } ${hidden ? "md:hidden" : collapsed ? "md:w-20" : "md:w-64"} md:shrink-0 transition-[width] duration-200`}
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

            {/* Desktop bottom buttons */}
            <div className={`hidden md:flex mt-auto flex-col gap-1`}>
              {/* Collapse toggle */}
              <Button
                onPress={toggleCollapsed}
                variant="ghost"
                size="sm"
                fullWidth
                className={collapsed ? "justify-center" : "justify-between"}
                aria-label={collapsed ? "توسيع" : "تصغير"}
              >
                {!collapsed && <span className="text-xs">تصغير</span>}
                {collapsed ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
              </Button>
            </div>

            {/* Brand */}
            <Link
              href="/supervisor"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 mb-8 pt-1 ${
                collapsed ? "md:justify-center" : ""
              }`}
            >
              <div className="w-12 h-12 bg-accent nb-border rounded-xl flex items-center justify-center nb-shadow-sm shrink-0">
                <ShieldCheck className="w-6 h-6 text-accent-foreground" />
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
          </nav>
        </aside>

        {/* Main content column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Slim top bar with action buttons pinned to the left edge */}
          <header className="sticky top-0 z-30 bg-card nb-border-thick border-t-0 border-x-0 px-4 py-2.5 flex items-center gap-3">
            {/* Mobile hamburger — opens sidebar drawer */}
            <Button
              onPress={() => setOpen(true)}
              variant="outline"
              size="sm"
              isIconOnly
              className="md:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Mobile brand — desktop has it inside the sidebar */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-9 h-9 bg-accent nb-border rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-extrabold text-sm">لوحة المشرف</span>
            </div>

            {/* Action cluster pinned to the physical left edge */}
            <div className="mr-auto flex items-center gap-2">
              {/* Show sidebar button — only visible on desktop when sidebar is hidden */}
              {hidden && (
                <Button
                  onPress={toggleHidden}
                  variant="outline"
                  size="sm"
                  isIconOnly
                  className="hidden md:flex"
                  aria-label="إظهار الشريط الجانبي"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </Button>
              )}
              <NotificationBell />
              <SettingsMenu profileHref="/supervisor/profile" />
            </div>
          </header>

          <ScrollingAnnouncementBar audience="supervisor" />

          <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <AppFooter />
        </div>
      </div>
    </RoleGuard>
  );
}
