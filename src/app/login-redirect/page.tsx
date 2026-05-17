"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getRoleHomepage } from "@/lib/roles";

/**
 * After login or email verification, Clerk has a session immediately but
 * the Convex webhook can lag a few seconds. We wait up to 8 seconds for
 * the user document to land before giving up and bouncing back to /login.
 */
export default function LoginRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.shared.currentUser);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    // Not signed in with Clerk — bounce to the login page.
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Signed in, but Convex hasn't seen the user yet — wait for the webhook.
    if (user === undefined || user === null) {
      if (timedOut) router.replace("/login");
      return;
    }

    router.replace(getRoleHomepage(user.role));
  }, [authLoading, isAuthenticated, user, timedOut, router]);

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
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
        <p className="text-sm font-bold text-muted-foreground">جاري التحويل...</p>
      </div>
    </div>
  );
}
