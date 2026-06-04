"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { LogIn, AlertCircle, Sparkles } from "lucide-react";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { buttonVariants, Spinner } from "@/components/ui";
import AuthShell from "../AuthShell";
import { SecondFactorBlock } from "./SecondFactorBlock";
import { FloatingEmailInput } from "./FloatingEmailInput";
import { FloatingPasswordInput } from "./FloatingPasswordInput";

/**
 * Single login surface for the whole platform. Role distinction is handled
 * downstream by `/login-redirect`, which reads `user.role` from the database
 * and sends the user to their dashboard. The login page itself shows the
 * same calm Olive Reading Room UI to everyone — DESIGN.md "Trust over flash"
 * and "calm, academic, considered" personality.
 *
 * Self-registration is a student-only flow; the supervisor / admin / sponsor
 * accounts are admin-created, but the "إنشاء حساب" link stays visible here
 * because the registration form itself enforces the student-email rule.
 */
export default function LoginForm() {
  const router = useRouter();
  const auth = useAuthForm();
  const { isAuthenticated } = useConvexAuth();

  // Already signed in (e.g. revisited /login with a live session, or bounced
  // here during the post-login handshake) — forward to the redirect router
  // instead of showing the form again. /login-redirect waits for the auth
  // handshake to settle, so this never loops.
  useEffect(() => {
    if (isAuthenticated) router.replace("/login-redirect");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.needsSecondFactor) {
      await auth.verifySecondFactor(async () => router.push("/login-redirect"));
    } else {
      await auth.signInWithPassword(async () => router.push("/login-redirect"));
    }
  };

  return (
    <AuthShell
      title="حاضنة الزيتونة"
      subtitle="منصّة احتضان المشاريع الريادية في الجامعة"
    >
      <div className="ds-card p-6 sm:p-8">
        <div id="clerk-captcha" />
        <form onSubmit={handleSubmit} className="space-y-5">
          {auth.error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg ds-border" role="alert">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm font-semibold text-destructive">{auth.error}</p>
            </div>
          )}

          {auth.needsSecondFactor ? (
            <SecondFactorBlock otp={auth.otp} onChange={auth.setOtp} />
          ) : (
            <>
              <FloatingEmailInput
                id="login-email"
                value={auth.email}
                onChange={auth.setEmail}
                placeholder="البريد الإلكتروني"
              />
              <FloatingPasswordInput
                id="login-password"
                value={auth.password}
                onChange={auth.setPassword}
                placeholder="كلمة المرور"
                showPassword={auth.showPassword}
                onToggleVisibility={auth.togglePasswordVisibility}
              />
              <div className="flex justify-start">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline underline-offset-4"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={auth.loading}
            className={buttonVariants({ variant: "primary", fullWidth: true })}
          >
            {auth.loading ? (
              <>
                <Spinner size="sm" color="current" />
                يجري تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-foreground/10" />
          <span className="text-xs font-bold text-muted-foreground">أو</span>
          <div className="flex-1 h-px bg-foreground/10" />
        </div>
        <Link href="/register" className={buttonVariants({ variant: "outline", fullWidth: true })}>
          <Sparkles className="w-5 h-5" />
          إنشاء حساب جديد
        </Link>
      </div>
    </AuthShell>
  );
}
