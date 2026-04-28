"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { Menu, X, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import AppFooter from "@/components/AppFooter";
import SettingsMenu from "@/components/SettingsMenu";
import RoleGuard from "@/components/RoleGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";
import type { CSSProperties } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardLayoutConfig {
  /** Allowed role(s) for RoleGuard */
  roles: ReadonlyArray<"student" | "supervisor" | "admin" | "sponsor">;
  /** Brand displayed in the navbar */
  brand: {
    icon: ReactNode;
    /** Tailwind class OR inline style */
    iconBgClass?: string;
    iconBgStyle?: CSSProperties;
    homeHref: string;
    subtitle: ReactNode;
    /** Optional inline style for the subtitle (color) */
    subtitleStyle?: CSSProperties;
  };
  /** Nav items shown in desktop nav and mobile sidebar */
  navItems: NavItem[];
  /** Active link styling */
  active: {
    /** Tailwind classes applied when active */
    className?: string;
    /** Inline style applied when active (e.g. background color) */
    style?: CSSProperties;
  };
  /** Show notifications bell */
  showNotifications: boolean;
  /** Where to redirect after logout */
  logoutHref: string;
  /** Route of the user's profile page (linked from the settings menu). */
  profileHref: string;
  /** Optional override for the page background class */
  backgroundClass?: string;
}

interface DashboardLayoutProps {
  config: DashboardLayoutConfig;
  children: ReactNode;
}

/**
 * Unified dashboard layout used by all role-based routes.
 * Renders RoleGuard, sticky navbar, mobile sidebar, content area, and footer.
 */
export default function DashboardLayout({ config, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const backgroundClass = config.backgroundClass ?? "bg-pattern";

  return (
    <RoleGuard allowedRoles={[...config.roles]}>
      <div className={`min-h-screen ${backgroundClass} flex flex-col`}>
        {/* Top Navbar */}
        <nav className="sticky top-0 z-50 bg-card nb-border-thick border-t-0 border-x-0">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Right Side: hamburger + brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden w-10 h-10 nb-border rounded-lg flex items-center justify-center bg-card nb-shadow-hover"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link href={config.brand.homeHref} className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 flex items-center justify-center ${
                    config.brand.iconBgClass || config.brand.iconBgStyle
                      ? `nb-border rounded-lg ${config.brand.iconBgClass ?? ""}`
                      : ""
                  }`}
                  style={config.brand.iconBgStyle}
                >
                  {config.brand.icon}
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-extrabold text-base leading-tight">حاضنة الزيتونة</h1>
                  <p
                    className="text-[10px] text-muted-foreground font-bold"
                    style={config.brand.subtitleStyle}
                  >
                    {config.brand.subtitle}
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2.5">
              {config.navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-bold transition-all nb-border ${
                      isActive
                        ? config.active.className ?? ""
                        : "bg-transparent border-transparent hover:bg-muted hover:border-foreground"
                    }`}
                    style={isActive ? config.active.style : undefined}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Left Side: notifications + settings */}
            <div className="flex items-center gap-2">
              {config.showNotifications && <NotificationBell />}
              <SettingsMenu
                profileHref={config.profileHref}
                logoutHref={config.logoutHref}
              />
            </div>
          </div>

          {/* Collapsible mobile menu — push-down at top, overlay when sticky */}
          {sidebarOpen && (
            <div className="md:hidden border-t border-border/50 animate-slide-down">
              <div className="px-3 py-2 space-y-1">
                {config.navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all nb-border ${
                        isActive
                          ? config.active.className ?? ""
                          : "bg-transparent border-transparent hover:bg-muted hover:border-foreground"
                      }`}
                      style={isActive ? config.active.style : undefined}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                      {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        <ScrollingAnnouncementBar audience="student" />

        {/* Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <AppFooter />
      </div>
    </RoleGuard>
  );
}
