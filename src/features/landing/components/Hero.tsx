"use client";

import Link from "next/link";
import Image from "next/image";
import { Rocket, LogIn, LayoutDashboard } from "lucide-react";

interface HeroProps {
  dashboardHref?: string;
  userName?: string;
  authReady?: boolean;
  isSignedIn?: boolean;
}

/**
 * Landing page hero section: headline, CTA buttons, and illustration.
 */
export default function Hero({ dashboardHref = "/student", userName, authReady = false, isSignedIn = false }: HeroProps) {
  return (
    <section className="relative flex-1 min-h-[85vh] flex items-center px-4 pt-32 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* ── Text Side ── */}
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
              حوّل{" "}
              <span className="relative inline-block">
                <span className="relative z-10">فكرتك</span>
                <span className="absolute bottom-1 left-0 right-0 h-4 bg-primary -z-10 -rotate-1" />
              </span>
              {" "}إلى{" "}
              <br className="hidden sm:block" />
              <span className="text-primary">مشروع حقيقي.</span>
            </h1>

            <p className="text-base sm:text-lg text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed mb-8 max-w-lg">
              منصة احتضان رقمية تربط طلاب الجامعة الزيتونة بمشرفين أكاديميين،
              مع تتبع فوري لحالة كل طلب ومراجعة من قِبَل المشرف.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 min-h-[52px]">
              {!authReady ? (
                /* skeleton أثناء تحميل الجلسة */
                <>
                  <div className="w-44 h-12 rounded-lg bg-foreground/10 animate-pulse" />
                  <div className="w-36 h-12 rounded-lg bg-foreground/10 animate-pulse" />
                </>
              ) : isSignedIn ? (
                <Link href={dashboardHref} className="w-full sm:w-auto">
                  <button className="nb-btn nb-btn-secondary w-full text-base px-8 py-3">
                    <LayoutDashboard className="w-5 h-5" />
                    {userName ? `لوحة ${userName}` : "اذهب إلى لوحتي"}
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <button className="nb-btn nb-btn-secondary w-full text-base px-8 py-3">
                      <Rocket className="w-5 h-5" />
                      ابدأ تقديم مشروعك
                    </button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <button className="nb-btn nb-btn-outline w-full text-base px-8 py-3">
                      <LogIn className="w-5 h-5" />
                      تسجيل الدخول
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ── Illustration Side ── */}
          <div className="relative flex justify-center animate-slide-up">
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-primary nb-border-thick rounded-3xl rotate-3 nb-shadow-xl" />
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-secondary/20 nb-border rounded-3xl -rotate-2" />

            <div className="relative z-10">
              <Image
                src="/team.png"
                alt="طالب ريادي"
                width={400}
                height={400}
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
