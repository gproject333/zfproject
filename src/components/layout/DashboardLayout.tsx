"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { Menu, X, ChevronLeft, ChevronRight, LogOut, PanelRightClose, PanelRightOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import AppFooter from "@/components/AppFooter";
import SettingsMenu from "@/components/SettingsMenu";
import RoleGuard from "@/components/RoleGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
  /** Use sidebar layout instead of top navbar (for admin) */
  sidebarLayout?: boolean;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { signOut } = useClerk();
  const router = useRouter();

  const backgroundClass = config.backgroundClass ?? "bg-pattern";

  const handleLogout = async () => {
    await signOut();
    router.push(config.logoutHref);
  };

  if (config.sidebarLayout) {
    return (
      <RoleGuard allowedRoles={[...config.roles]}>
        <div className={`min-h-screen ${backgroundClass} flex`} dir="rtl">

          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed top-0 right-0 h-full z-40 bg-card nb-border border-t-0 border-r-0 flex flex-col transition-all duration-300
              ${sidebarOpen ? "translate-x-0 w-64" : `translate-x-full md:translate-x-0 ${sidebarCollapsed ? "md:w-20" : "md:w-64"}`}`}
          >
            {/* Brand */}
            <div className={`p-3 border-b border-border/60 ${sidebarCollapsed ? "md:flex md:justify-center" : ""}`}>
              <Link
                href={config.brand.homeHref}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center nb-border rounded-lg shrink-0 ${config.brand.iconBgClass ?? ""}`}
                  style={config.brand.iconBgStyle}
                >
                  {config.brand.icon}
                </div>
                <div className={sidebarCollapsed ? "md:hidden" : ""}>
                  <p className="font-extrabold text-sm leading-tight">حاضنة الزيتونة</p>
                  <p className="text-[10px] font-bold" style={config.brand.subtitleStyle}>
                    {config.brand.subtitle}
                  </p>
                </div>
              </Link>
            </div>

            {/* Nav Items */}
            <nav className={`flex-1 overflow-y-auto space-y-1 ${sidebarCollapsed ? "md:p-2 p-3" : "p-3"}`}>
              {config.navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg text-sm font-bold transition-all nb-border
                      ${sidebarCollapsed ? "md:justify-center md:px-2 md:py-3 px-3 py-2.5" : "px-3 py-2.5"}
                      ${isActive
                        ? config.active.className ?? ""
                        : "bg-transparent border-transparent hover:bg-muted hover:border-foreground/30"
                      }`}
                    style={isActive ? config.active.style : undefined}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className={sidebarCollapsed ? "md:hidden" : ""}>{item.label}</span>
                    {isActive && !sidebarCollapsed && <ChevronLeft className="w-3.5 h-3.5 mr-auto opacity-70" />}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom buttons */}
            <div className={`border-t border-border/60 space-y-1 ${sidebarCollapsed ? "md:p-2 p-3" : "p-3"}`}>
              {/* Collapse toggle */}
              <button
                onClick={() => setSidebarCollapsed(p => !p)}
                title={sidebarCollapsed ? "توسيع" : "تصغير"}
                className={`hidden md:flex items-center gap-3 rounded-lg text-sm font-bold w-full nb-border bg-muted hover:bg-muted/70 text-muted-foreground transition-all
                  ${sidebarCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5 justify-between"}`}
              >
                {!sidebarCollapsed && <span className="text-xs">تصغير</span>}
                {sidebarCollapsed ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
              </button>
              {/* Logout */}
              <button
                onClick={() => void handleLogout()}
                title="تسجيل الخروج"
                className={`flex items-center gap-3 rounded-lg text-sm font-bold w-full nb-border bg-transparent border-transparent hover:bg-destructive/10 hover:border-destructive/30 text-destructive transition-all
                  ${sidebarCollapsed ? "md:justify-center md:px-2 md:py-3 px-3 py-2.5" : "px-3 py-2.5"}`}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className={sidebarCollapsed ? "md:hidden" : ""}>تسجيل الخروج</span>
              </button>
            </div>
          </aside>

          {/* Main content — offset by sidebar width on desktop */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? "md:mr-20" : "md:mr-64"}`}>
            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-card nb-border border-t-0 border-x-0 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden w-10 h-10 nb-border rounded-lg flex items-center justify-center bg-card"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {config.showNotifications && <NotificationBell />}
                <SettingsMenu profileHref={config.profileHref} logoutHref={config.logoutHref} />
              </div>
            </header>

            <ScrollingAnnouncementBar audience="student" />

            <main className="flex-1 p-4 md:p-6">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>

            <AppFooter />
          </div>
        </div>
      </RoleGuard>
    );
  }

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

          {/* Collapsible mobile menu */}
          <div
            className="md:hidden overflow-hidden"
            style={{
              maxHeight: sidebarOpen ? '400px' : '0px',
              opacity: sidebarOpen ? 1 : 0,
              transition: 'max-height 0.35s ease-in-out, opacity 0.25s ease-in-out',
            }}
          >
            <div className="border-t border-border/50 px-3 py-2 space-y-1">
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
