"use client";

import "../landing.css";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogIn, Menu, X } from "lucide-react";
import { navItemsForRole, sidebarConfigForRole } from "@/components/layout/navItems";
import AppSidebar from "@/components/layout/AppSidebar";
import TopActionsCluster from "@/components/layout/TopActionsCluster";
import OliveLogo from "@/components/OliveLogo";
import SettingsMenu from "@/components/SettingsMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { Button, buttonVariants } from "@/components/ui";
import { useAuth } from "@clerk/nextjs";
import { api } from "@smart-zuj/convex";
import { getRoleHomepage, getRoleProfileHref } from "@smart-zuj/core";
import AppFooter from "@/components/AppFooter";
import CinematicHero from "./CinematicHero";
import FeaturesSection from "./FeaturesSection";
import HeroCarousel from "@/features/banners/components/HeroCarousel";
import HowItWorks from "./HowItWorks";
import FeatureShowcases from "./FeatureShowcases";
import AboutSection from "./AboutSection";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";
import RevealOnScroll from "./RevealOnScroll";
import AmbientOlives from "./AmbientOlives";

/** Stable no-op subscriber — the hydration flag never changes after mount. */
const subscribeNoop = () => () => {};

/** `true` only after client-side hydration. Defers auth-dependent UI until
 *  the client takes over, avoiding SSR/client markup mismatches — without a
 *  setState-in-effect (which triggers a cascading render). */
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

const CACHED_ROLE_KEY = "smart-zuj:last-role";

/** Read the last-seen role from localStorage on mount so we can pre-decide
 *  the landing layout (navbar vs sidebar) without waiting for the Convex
 *  user query to resolve. Eliminates the navbar→sidebar flash on refresh
 *  for admin/supervisor accounts. */
function readCachedRole(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CACHED_ROLE_KEY);
  } catch {
    return null;
  }
}

function writeCachedRole(role: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    if (role) window.localStorage.setItem(CACHED_ROLE_KEY, role);
    else window.localStorage.removeItem(CACHED_ROLE_KEY);
  } catch {
    /* storage disabled — fall back to no caching */
  }
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

  // `effectiveRole` is computed below from Convex (`user.role`) with a
  // localStorage fallback, so we delay these derivations until afterward.
  // `mounted` blocks any render before hydration; `clerkLoaded` waits
  // for Clerk to finish reading the session — together they prevent
  // a flash of guest UI between mount and auth resolution.
  const authReady   = mounted && clerkLoaded;
  // For signed-in users we also need the Convex `users` row to resolve
  // before we know the actual role. We pre-seed it from localStorage so a
  // returning admin/supervisor lands directly on the sidebar layout
  // without flashing the navbar on every refresh.
  const cachedRole = mounted ? readCachedRole() : null;
  const effectiveRole = user?.role ?? cachedRole ?? undefined;
  const userResolved = !isSignedIn || user !== undefined;
  const layoutReady = authReady && (userResolved || cachedRole !== null);
  const showGuestCtas = authReady && userResolved && !isSignedIn;
  const showAuthNav   = layoutReady && !!isSignedIn;
  // A signed-in supervisor or admin gets their app-shell sidebar in
  // place of the navbar — consistent with their dashboard.
  const sidebarConfig = showAuthNav ? sidebarConfigForRole(effectiveRole) : null;
  const usesSidebar = sidebarConfig !== null;

  // Keep the cached role in sync with what Convex returns so it stays
  // accurate across refreshes; clear it on sign-out.
  useEffect(() => {
    if (!authReady) return;
    if (!isSignedIn) {
      writeCachedRole(null);
      return;
    }
    if (user?.role) writeCachedRole(user.role);
  }, [authReady, isSignedIn, user?.role]);

  const dashboardHref = getRoleHomepage(effectiveRole);
  const navItems = navItemsForRole(effectiveRole);

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

        {/* When the sidebar layout is active (supervisor/admin), surface the
            same bell + settings + theme cluster the dashboard pages use. */}
        {usesSidebar && sidebarConfig && (
          <TopActionsCluster
            profileHref={sidebarConfig.profileHref}
            logoutHref={sidebarConfig.logoutHref}
          />
        )}

        {/* Navbar — guests + signed-in students / sponsors. Held back until
            `layoutReady` so admin/supervisor users don't flash the navbar
            for a frame before the sidebar takes over. */}
        {layoutReady && !usesSidebar && (
          <nav
            className={`fixed ${
              hasAnnouncement ? "top-[40px]" : "top-0"
            } right-0 left-0 w-full z-50 transition-all duration-300 text-foreground ${
              showAuthNav
                ? "bg-card ds-border-thick border-t-0 border-x-0"
                : isScrolled
                  ? "glass border-b border-border/40"
                  : "bg-background/60 backdrop-blur-sm border-b border-transparent"
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
                    <p className="text-[10px] font-bold text-muted-foreground">
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
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ds-border ${
                          isActive
                            ? "bg-primary ds-shadow-sm"
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
                    <SettingsMenu profileHref={getRoleProfileHref(effectiveRole)} logoutHref="/login" />
                    <ThemeToggle />
                  </>
                ) : (
                  <>
                    {showGuestCtas && (
                      <>
                        <Link
                          href="/login"
                          className={`${buttonVariants({ variant: "outline", size: "sm" })} whitespace-nowrap`}
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
                    )}
                    <ThemeToggle />
                  </>
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ds-border ${
                          isActive
                            ? "bg-primary ds-shadow-sm"
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

        {/* Hero with copy on the right + product mockup on the left. Not
            wrapped in RevealOnScroll — it runs its own framer-motion entrance. */}
        <CinematicHero
          dashboardHref={dashboardHref}
          userName={user?.name}
          authReady={authReady && (!isSignedIn || user !== undefined)}
          isSignedIn={!!isSignedIn}
        />

        {/* Hero carousel — supervisor-managed banners (images/video only) */}
        <RevealOnScroll>
          <div className="py-6 w-full">
            <HeroCarousel />
          </div>
        </RevealOnScroll>
        <RevealOnScroll><AboutSection /></RevealOnScroll>
        <RevealOnScroll><FeaturesSection /></RevealOnScroll>
        <FeatureShowcases />
        <RevealOnScroll><HowItWorks /></RevealOnScroll>
        <RevealOnScroll><Testimonials /></RevealOnScroll>
        <RevealOnScroll><FAQ /></RevealOnScroll>
        <RevealOnScroll><FinalCTA /></RevealOnScroll>
        <AppFooter />
      </div>
    </div>
  );
}
