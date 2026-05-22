"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogIn, Menu, X } from "lucide-react";
import { navItemsForRole, sidebarConfigForRole } from "@/components/layout/navItems";
import AppSidebar from "@/components/layout/AppSidebar";
import OliveLogo from "@/components/OliveLogo";
import SettingsMenu from "@/components/SettingsMenu";
import NotificationBell from "@/components/NotificationBell";
import { Button, buttonVariants } from "@/components/ui";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import AppFooter from "@/components/AppFooter";
import CinematicHero from "./CinematicHero";
import FeaturesSection from "./FeaturesSection";
import HeroCarousel from "@/features/banners/components/HeroCarousel";
import HowItWorks from "./HowItWorks";
import AboutSection from "./AboutSection";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import Partners from "./Partners";
import FinalCTA from "./FinalCTA";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";
import RevealOnScroll from "./RevealOnScroll";
import AmbientOlives from "./AmbientOlives";
import MarqueeStrip from "./MarqueeStrip";
import SectionDivider from "./SectionDivider";

/** Map a user role to the landing page of their role-specific
 *  dashboard. Student is the default for users without a role yet. */
function dashboardHrefFor(user: Doc<"users"> | null | undefined): string {
  if (!user) return "/student";
  switch (user.role) {
    case "admin":     return "/admin";
    case "sponsor":   return "/sponsor";
    case "supervisor":return "/supervisor";
    default:          return "/student";
  }
}

function profileHrefFor(user: Doc<"users"> | null | undefined): string {
  if (!user || user.role === "student" || !user.role) return "/student/profile";
  return dashboardHrefFor(user);
}

/** Stable no-op subscriber — the hydration flag never changes after mount. */
const subscribeNoop = () => () => {};

/** `true` only after client-side hydration. Defers auth-dependent UI until
 *  the client takes over, avoiding SSR/client markup mismatches — without a
 *  setState-in-effect (which triggers a cascading render). */
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/**
 * Landing page orchestrator. Visible to both guests and signed-in
 * users so the marketing sections, hero carousel, and announcement
 * banners remain reachable after login. Guests and signed-in students
 * / sponsors get the top navbar; signed-in supervisors and admins get
 * their app-shell sidebar instead, matching the rest of their app.
 */
export default function LandingPage() {
  useConvexAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const user = useQuery(api.users.shared.currentUser);
  const mounted = useHydrated();
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // True while a scrolling announcement is pinned above the navbar — the
  // navbar and page content shift down by the bar's height (40px).
  const [hasAnnouncement, setHasAnnouncement] = useState(false);
  const pathname = usePathname();

  // Scroll-triggered navbar background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardHref = dashboardHrefFor(user);
  const navItems = navItemsForRole(user?.role);
  // mounted: يمنع أي render قبل hydration
  // clerkLoaded: يضمن أن Clerk قرأ الجلسة كاملاً
  const authReady   = mounted && clerkLoaded;
  const showGuestCtas = authReady && !isSignedIn;
  const showAuthNav   = authReady && !!isSignedIn;
  // A signed-in supervisor or admin gets their app-shell sidebar in
  // place of the navbar — consistent with their dashboard.
  const sidebarConfig = showAuthNav ? sidebarConfigForRole(user?.role) : null;
  const usesSidebar = sidebarConfig !== null;

  return (
    <div
      className="min-h-screen bg-pattern flex flex-col md:flex-row overflow-x-hidden"
      dir="rtl"
    >
      {sidebarConfig && <AppSidebar config={sidebarConfig} />}

      <div
        className={`flex-1 min-w-0 flex flex-col ${
          usesSidebar ? "" : hasAnnouncement ? "pt-[108px]" : "pt-[68px]"
        }`}
      >
        {/* Scrolling announcement ticker — fixed above the navbar for the
            navbar layout, in-flow at the top of the column for sidebars. */}
        <ScrollingAnnouncementBar
          audience="landing"
          variant={usesSidebar ? undefined : "above-navbar"}
          onVisibilityChange={usesSidebar ? undefined : setHasAnnouncement}
        />

        {/* Navbar — guests + signed-in students / sponsors */}
        {!usesSidebar && (
          <nav
            className={`fixed ${
              hasAnnouncement ? "top-[40px]" : "top-0"
            } right-0 left-0 w-full z-50 transition-all duration-300 ${
              showAuthNav
                ? "bg-card nb-border-thick border-t-0 border-x-0 text-foreground"
                : isScrolled
                  ? "glass border-b border-white/20 dark:border-white/5 text-foreground"
                  : "bg-transparent border-transparent text-white"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
              {/* Brand */}
              <div className="flex items-center gap-3">
                {showAuthNav && (
                  <Button
                    onPress={() => setSidebarOpen(!sidebarOpen)}
                    variant="outline"
                    size="sm"
                    isIconOnly
                    className="md:hidden"
                    aria-label="القائمة"
                  >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                )}
                <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="الصفحة الرئيسية">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <OliveLogo />
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-extrabold text-base leading-tight">حاضنة الزيتونة</p>
                    <p
                      className={`text-[10px] font-bold ${
                        showAuthNav || isScrolled ? "text-muted-foreground" : "text-white/70"
                      }`}
                    >
                      ZUJ Incubator
                    </p>
                  </div>
                </Link>
              </div>

              {/* Nav links — only when authenticated */}
              {showAuthNav && (
                <div className="hidden md:flex items-center gap-2.5">
                  {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-bold transition-all nb-border ${
                          isActive
                            ? "bg-primary nb-shadow-sm"
                            : "bg-transparent border-transparent hover:bg-muted hover:border-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Right actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!authReady ? (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-8 rounded-lg bg-foreground/10 animate-pulse" />
                    <div className="w-20 h-8 rounded-lg bg-foreground/10 animate-pulse" />
                  </div>
                ) : showAuthNav ? (
                  <>
                    <NotificationBell />
                    <SettingsMenu profileHref={profileHrefFor(user)} logoutHref="/login" />
                  </>
                ) : (
                  showGuestCtas && (
                    <>
                      <Link
                        href="/login"
                        className={
                          isScrolled
                            ? `${buttonVariants({ variant: "outline", size: "sm" })} whitespace-nowrap`
                            : "inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-sm font-bold whitespace-nowrap text-white ring-1 ring-white/40 hover:bg-white/15 transition-colors"
                        }
                      >
                        <LogIn className="w-4 h-4" />
                        <span className="hidden sm:inline">تسجيل الدخول</span>
                      </Link>
                      <Link
                        href="/register"
                        className={`${buttonVariants({ variant: "secondary", size: "sm" })} whitespace-nowrap`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">ابدأ الآن</span>
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Collapsible mobile menu */}
            {showAuthNav && (
              <div
                className="md:hidden overflow-hidden bg-card"
                style={{
                  maxHeight: sidebarOpen ? '400px' : '0px',
                  opacity: sidebarOpen ? 1 : 0,
                  transition: 'max-height 0.35s ease-in-out, opacity 0.25s ease-in-out',
                }}
              >
                <div className="border-t border-border/50 px-3 py-2 space-y-1">
                  {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all nb-border ${
                          isActive
                            ? "bg-primary nb-shadow-sm"
                            : "bg-transparent border-transparent hover:bg-muted hover:border-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        )}

        <AmbientOlives />

        {/* Cinematic full-bleed photo hero. Not wrapped in RevealOnScroll;
            it runs its own GSAP + Lenis choreography. */}
        <CinematicHero
          dashboardHref={dashboardHref}
          userName={user?.name}
          authReady={authReady && (!isSignedIn || user !== undefined)}
          isSignedIn={!!isSignedIn}
        />

        <MarqueeStrip />
        <SectionDivider />

        {/* Hero carousel — supervisor-managed banners (images/video only) */}
        <RevealOnScroll>
          <div className="py-6 w-full">
            <HeroCarousel />
          </div>
        </RevealOnScroll>
        <RevealOnScroll><FeaturesSection /></RevealOnScroll>
        <RevealOnScroll><HowItWorks /></RevealOnScroll>
        <RevealOnScroll><AboutSection /></RevealOnScroll>
        <RevealOnScroll><Testimonials /></RevealOnScroll>
        <RevealOnScroll><Partners /></RevealOnScroll>
        <RevealOnScroll><FAQ /></RevealOnScroll>
        <RevealOnScroll><FinalCTA /></RevealOnScroll>
        <AppFooter />
      </div>
    </div>
  );
}
