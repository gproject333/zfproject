"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { Menu, X, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";
import NotificationBell from "@/components/NotificationBell";
import AppFooter from "@/components/AppFooter";
import SettingsMenu from "@/components/SettingsMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
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
 * Top-navbar dashboard layout used by the student and sponsor routes.
 * Renders RoleGuard, sticky navbar, mobile sidebar, content area, and
 * footer. Supervisor and admin use the navbar-less {@link AppSidebarLayout}.
 */
export default function DashboardLayout({ config, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Same scroll-triggered navbar behavior as the landing page so the
  // student/sponsor dashboards share one unified header treatment.
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const backgroundClass = config.backgroundClass ?? "bg-pattern";

  return (
    <RoleGuard allowedRoles={[...config.roles]}>
      <div className={`min-h-screen ${backgroundClass} flex flex-col`}>
        {/* Top Navbar — matches the landing page: transparent at rest,
            soft blurred background once the user scrolls. */}
        <nav
          className={`sticky top-0 z-50 transition-all duration-300 text-foreground ${
            isScrolled
              ? "bg-background/85 backdrop-blur-md border-b border-border/20"
              : "bg-transparent border-b border-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            {/* Right Side: hamburger + brand */}
            <div className="flex items-center gap-3">
              <Button
                onPress={() => setSidebarOpen(!sidebarOpen)}
                variant="outline"
                size="sm"
                isIconOnly
                className="md:hidden"
                aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Link href={config.brand.homeHref} className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 flex items-center justify-center ${
                    config.brand.iconBgClass || config.brand.iconBgStyle
                      ? `ds-border rounded-lg ${config.brand.iconBgClass ?? ""}`
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

            {/* Desktop Nav — unified pill style with the landing navbar */}
            <div className="hidden md:flex items-center gap-1">
              {config.navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                      isActive
                        ? "bg-white text-gray-900 border-white shadow-md"
                        : "bg-transparent border-transparent opacity-80 hover:opacity-100 hover:bg-foreground/8 hover:border-foreground/20"
                    }`}
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
              <ThemeToggle />
            </div>
          </div>

          {/* Collapsible mobile menu */}
          <div
            className="md:hidden overflow-hidden"
            style={{
              maxHeight: sidebarOpen ? '480px' : '0px',
              opacity: sidebarOpen ? 1 : 0,
              transition: 'max-height 0.35s ease-in-out, opacity 0.25s ease-in-out',
            }}
          >
            <div className="border-t border-border/30 bg-background/95 backdrop-blur-md px-3 py-2 space-y-1">
              {config.navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full font-bold whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-white text-gray-900 border-white shadow-md"
                        : "bg-transparent border-transparent opacity-80 hover:opacity-100 hover:bg-foreground/8 hover:border-foreground/20"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
                  </Link>
                );
              })}
            </div>
          </div>
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
