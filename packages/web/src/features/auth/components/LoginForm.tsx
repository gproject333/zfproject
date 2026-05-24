"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, LogIn, AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { buttonVariants, InputOTP, Spinner } from "@/components/ui";
import AuthShell from "./AuthShell";

/** Domain hints the autocomplete dropdown offers once the user types `@`. */
const EMAIL_DOMAIN_SUGGESTIONS = ["std-zuj.edu.jo", "zuj.edu.jo"];

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
      subtitle="منصة احتضان المشاريع الريادية في الجامعة"
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
                جاري الدخول...
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

function SecondFactorBlock({ otp, onChange }: { otp: string; onChange: (v: string) => void }) {
  return (
    <>
      <div className="text-center py-2">
        <p className="text-sm font-bold text-foreground">
          تم إرسال رمز التحقق إلى بريدك الإلكتروني
        </p>
      </div>
      <div className="flex justify-center" dir="ltr">
        <InputOTP value={otp} onChange={onChange} maxLength={6} autoFocus>
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
            <InputOTP.Slot index={2} />
            <InputOTP.Slot index={3} />
            <InputOTP.Slot index={4} />
            <InputOTP.Slot index={5} />
          </InputOTP.Group>
        </InputOTP>
      </div>
    </>
  );
}

function FloatingLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      dir="rtl"
      className={
        "pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 px-1 text-sm font-bold " +
        "text-muted-foreground bg-card transition-all duration-150 " +
        "peer-focus:top-0 peer-focus:right-3 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-focus:text-primary " +
        "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:right-3 " +
        "peer-[:not(:placeholder-shown)]:translate-y-[-50%] peer-[:not(:placeholder-shown)]:text-xs"
      }
    >
      {children}
    </label>
  );
}

function FloatingEmailInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const atIndex = value.lastIndexOf("@");
  const afterAt = atIndex >= 0 ? value.slice(atIndex + 1) : "";
  const prefix = atIndex >= 0 ? value.slice(0, atIndex) : value;
  const suggestions =
    atIndex >= 0 && prefix.length > 0
      ? EMAIL_DOMAIN_SUGGESTIONS.filter((d) => d.startsWith(afterAt) && d !== afterAt)
      : [];
  const showDropdown = dropdownOpen && suggestions.length > 0;

  const pickSuggestion = (domain: string) => {
    onChange(`${prefix}@${domain}`);
    setDropdownOpen(false);
    setActiveIndex(0);
  };

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pickSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActiveIndex(0);
          setDropdownOpen(e.target.value.includes("@"));
        }}
        onFocus={() => value.includes("@") && setDropdownOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder=" "
        aria-label={placeholder}
        className="peer ds-input pr-12 !py-3"
        required
        dir="ltr"
        autoComplete="email"
        style={{ paddingTop: "1.5rem", paddingBottom: "0.5rem", textAlign: "left" }}
      />
      <FloatingLabel htmlFor={id}>{placeholder}</FloatingLabel>

      {showDropdown && (
        <ul
          className="absolute z-20 top-full mt-2 right-0 left-0 p-1 rounded-md ds-border ds-shadow bg-card max-h-48 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((domain, i) => (
            <li key={domain}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSuggestion(domain)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                  i === activeIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
                dir="ltr"
                style={{ textAlign: "left" }}
              >
                @{domain}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FloatingPasswordInput({
  id,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleVisibility,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        aria-label={placeholder}
        className="peer ds-input"
        required
        dir="ltr"
        autoComplete="current-password"
        style={{ padding: "1.5rem 1rem 0.5rem 3rem", textAlign: "left" }}
      />
      <FloatingLabel htmlFor={id}>{placeholder}</FloatingLabel>
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
        tabIndex={-1}
        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
