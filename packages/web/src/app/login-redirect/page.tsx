"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { getRoleHomepage } from "@smart-zuj/core";

/**
 * Post-login waiting room. Clerk hands us a session immediately, but the
 * Convex webhook that mirrors the user into our DB can lag a few seconds
 * on first sign-in. We poll for the Convex user document and route to the
 * right dashboard once it lands.
 *
 * Three-phase copy keeps the user informed instead of staring at a silent
 * spinner: greeting → "still preparing" → explicit error with a manual
 * retry if the webhook never arrives within 10s.
 */
const PHASE_CHANGES_AT_MS = [3000, 6000];
const HARD_TIMEOUT_MS = 10000;

export default function LoginRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.shared.currentUser);
  const [phase, setPhase] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), PHASE_CHANGES_AT_MS[0]),
      window.setTimeout(() => setPhase(2), PHASE_CHANGES_AT_MS[1]),
      window.setTimeout(() => setTimedOut(true), HARD_TIMEOUT_MS),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    // Wait for the Convex user doc — the hard-timeout branch below renders
    // a manual retry instead of silently bouncing.
    if (user === undefined || user === null) return;
    router.replace(getRoleHomepage(user.role));
  }, [authLoading, isAuthenticated, user, router]);

  const stillWaiting = isAuthenticated && (user === undefined || user === null);

  if (stillWaiting && timedOut) {
    return (
      <FailureScreen
        title="تأخّر تجهيز حسابك"
        body="ما قدرنا نوصل لبياناتك خلال المدة المتوقعة. هذا غالباً بسبب اتصال إنترنت بطيء أو ضغط مؤقت على الخادم."
      />
    );
  }

  const headline =
    phase === 0
      ? "جاري التحويل..."
      : phase === 1
        ? "نجهّز حسابك..."
        : "أوشكنا — لحظة من فضلك";
  const sub =
    phase === 2
      ? "إذا طالت المدة فحاول إعادة تحميل الصفحة."
      : "";

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <svg
          viewBox="0 0 300 300"
          className="w-20 h-20"
          style={{ animation: "olive-spin 2.4s linear infinite" }}
        >
          <style>{`
            @keyframes olive-spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>
          <g transform="translate(150 150)">
            <g fill="#5B7A3A" stroke="#1A1A1A" strokeWidth="3.5" strokeLinejoin="round">
              <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z"/>
              <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(60)"/>
              <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(120)"/>
              <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(180)"/>
              <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(240)"/>
              <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(300)"/>
            </g>
            <ellipse cx="0" cy="0" rx="13" ry="17" fill="#2B1F3A" stroke="#1A1A1A" strokeWidth="3"/>
          </g>
        </svg>
        <p className="text-base font-extrabold text-foreground">{headline}</p>
        {sub && (
          <p className="text-sm text-muted-foreground font-medium">{sub}</p>
        )}
      </div>
    </div>
  );
}

function FailureScreen({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl bg-card ds-border p-8 text-center space-y-5 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-destructive/12 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {body}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm ds-shadow-sm hover:bg-accent transition-colors"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-card text-foreground font-bold text-sm ds-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
