"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap, Sparkles, LogIn, LogOut,
  Home, LayoutDashboard, Plus, FileText, BookOpen, HelpCircle,
} from "lucide-react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import AppFooter from "@/components/AppFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import Hero from "./Hero";
import FeaturesSection from "./FeaturesSection";
import HeroCarousel from "@/features/banners/components/HeroCarousel";
import HowItWorks from "./HowItWorks";
import AboutSection from "./AboutSection";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import Partners from "./Partners";
import FinalCTA from "./FinalCTA";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";

/** Map a user role to the landing page of their role-specific
 *  dashboard. Student is the default for users without a role yet. */
function dashboardHrefFor(user: Doc<"users"> | null | undefined): string {
  if (!user) return "/student";
  switch (user.role) {
    case "admin":
      return "/admin";
    case "sponsor":
      return "/sponsor";
    case "supervisor":
      return "/supervisor";
    default:
      return "/student";
  }
}

/**
 * Landing page orchestrator. Visible to both guests and signed-in
 * users so the marketing sections, hero carousel, and announcement
 * banners remain reachable after login — the navbar CTA switches from
 * "login / register" to "go to my dashboard" based on auth state.
 */
export default function LandingPage() {
  const { isAuthenticated } = useConvexAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const user = useQuery(api.users.shared.currentUser);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Scroll-triggered navbar background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardHref = dashboardHrefFor(user);
  // mounted: يمنع أي render قبل hydration
  // clerkLoaded: يضمن أن Clerk قرأ الجلسة كاملاً
  const authReady   = mounted && clerkLoaded;
  const showGuestCtas = authReady && !isSignedIn;
  const showAuthNav   = authReady && !!isSignedIn;

  return (
    <div className="min-h-screen bg-pattern flex flex-col overflow-x-hidden" dir="rtl">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 px-4 py-3 transition-colors duration-300 ${
          isScrolled
            ? "bg-card/95 backdrop-blur-md nb-border-thick border-t-0 border-x-0 text-card-foreground"
            : "bg-transparent border-transparent text-foreground"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="الصفحة الرئيسية">
            <div className="w-10 h-10 bg-primary nb-border rounded-xl flex items-center justify-center nb-shadow-sm">
              {showAuthNav ? (
                <svg viewBox="0 0 300 300" className="w-6 h-6">
                  <g transform="translate(150 150)">
                    <g fill="#ffffff" stroke="#1A1A1A" strokeWidth="10" strokeLinejoin="round">
                      <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z"/>
                      <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(60)"/>
                      <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(120)"/>
                      <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(180)"/>
                      <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(240)"/>
                      <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(300)"/>
                    </g>
                    <ellipse cx="0" cy="0" rx="13" ry="17" fill="#2B1F3A" stroke="#1A1A1A" strokeWidth="6"/>
                  </g>
                </svg>
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="font-extrabold text-base leading-tight">حاضنة الزيتونة</p>
              <p className="text-[10px] text-muted-foreground font-bold">ZUJ Incubator</p>
            </div>
          </Link>

          {/* Nav links — only when authenticated */}
          {showAuthNav && (
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center flex-wrap">
              {[
                { label: "الصفحة الرئيسية", href: "/",              icon: Home },
                { label: "لوحة التحكم",     href: dashboardHref,    icon: LayoutDashboard },
                { label: "طلب جديد",        href: "/student/new",   icon: Plus },
                { label: "طلباتي",          href: "/student/applications", icon: FileText },
                { label: "المقالات",         href: "/student/articles", icon: BookOpen },
                { label: "دليل التقديم",    href: "/student/guide", icon: HelpCircle },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 nb-border rounded-lg text-sm font-bold transition-all hover:bg-primary hover:text-primary-foreground hover:nb-shadow-sm whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            {!authReady ? (
              /* Skeleton أثناء تحميل الجلسة */
              <div className="flex items-center gap-2">
                <div className="w-24 h-8 rounded-lg bg-foreground/10 animate-pulse" />
                <div className="w-20 h-8 rounded-lg bg-foreground/10 animate-pulse" />
              </div>
            ) : showAuthNav ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="nb-btn nb-btn-outline text-sm py-2 px-3 sm:px-4 whitespace-nowrap shadow-[2px_2px_0px_0px_var(--shadow-color)]"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </button>
            ) : (
              showGuestCtas && (
                <>
                  <Link href="/login">
                    <button className="nb-btn nb-btn-outline text-sm py-2 px-3 sm:px-4 whitespace-nowrap shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">تسجيل الدخول</span>
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="nb-btn nb-btn-secondary text-sm py-2 px-3 sm:px-4 whitespace-nowrap">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">ابدأ الآن</span>
                    </button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      <ScrollingAnnouncementBar audience="landing" variant="fixed" />
      <Hero
        dashboardHref={dashboardHref}
        userName={user?.name}
        authReady={authReady && (!isSignedIn || user !== undefined)}
        isSignedIn={!!isSignedIn}
      />

      {/* Hero carousel — supervisor-managed banners (images/video only) */}
      <div className="py-6 w-full">
        <HeroCarousel />
      </div>
      <FeaturesSection />
      <HowItWorks />
      <AboutSection />
      <Testimonials />
      <Partners />
      <FAQ />
      <FinalCTA />
      <AppFooter />

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={(open) => {
          if (!isLoggingOut) setShowLogoutConfirm(open);
        }}
        title="تسجيل الخروج"
        description="هل أنت متأكد من رغبتك في تسجيل الخروج من الحساب؟"
        icon={<LogOut className="w-6 h-6 text-destructive" />}
        destructive
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        isSubmitting={isLoggingOut}
        onConfirm={() => void handleLogout()}
      />
    </div>
  );
}
