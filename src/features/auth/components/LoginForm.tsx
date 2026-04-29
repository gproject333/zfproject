"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Mail,
  LogIn,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import type { LoginVariant, LoginVariantConfig } from "@/features/auth/types/login-variants";
import { EMAIL_DOMAIN_SUGGESTIONS, LOGIN_VARIANTS } from "@/features/auth/utils/login-configs";

interface LoginFormProps {
  variant: LoginVariant;
}

export default function LoginForm({ variant }: LoginFormProps) {
  const config = LOGIN_VARIANTS[variant];
  const router = useRouter();
  const auth = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.signInWithPassword(async () => {
      router.push(config.redirectTo);
    });
  };

  const isLight = config.theme === "light";

  return (
    <div className={config.pageClassName} style={config.pageStyle}>
      {config.decorations}

      <Link
        href="/"
        className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all duration-150 group"
        style={
          isLight
            ? { background: "var(--card)", border: "2px solid var(--foreground)", boxShadow: "3px 3px 0 var(--foreground)", color: "var(--foreground)" }
            : { background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.18)", boxShadow: "3px 3px 0 rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.85)" }
        }
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translate(2px,2px)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = isLight ? "1px 1px 0 var(--foreground)" : "1px 1px 0 rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = isLight ? "3px 3px 0 var(--foreground)" : "3px 3px 0 rgba(0,0,0,0.4)";
        }}
      >
        <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        <span>الرئيسية</span>
      </Link>

      <div className="w-full max-w-md animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 mx-auto ${config.brand.iconBoxClassName ?? ""}`}
            style={config.brand.iconBoxStyle}
          >
            {config.brand.icon}
          </div>
          <h1
            className="text-3xl font-extrabold mb-2"
            style={config.brand.titleColor ? { color: config.brand.titleColor } : undefined}
          >
            {config.brand.title}
          </h1>
          <p
            className={`font-medium ${config.brand.subtitleClassName ?? "text-muted-foreground"}`}
            style={config.brand.subtitleColor ? { color: config.brand.subtitleColor } : undefined}
          >
            {config.brand.subtitle}
          </p>
        </div>

        <div className={config.cardClassName} style={config.cardStyle}>
          <div
            className={`flex items-center gap-2 mb-6 pb-4 ${isLight ? "border-b-2 border-foreground" : ""}`}
            style={config.cardBorderStyle}
          >
            <div className="flex gap-1.5">
              {config.titleBarDots.map((d, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: d.background, border: d.border ?? (isLight ? undefined : "1px solid #444") }}
                />
              ))}
            </div>
            <span
              className="font-bold text-sm mr-2"
              style={config.titleBarLabelColor ? { color: config.titleBarLabelColor } : undefined}
            >
              {config.titleBarLabel}
            </span>
          </div>

          {config.cardSubtitle && (
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground font-medium">{config.cardSubtitle}</p>
            </div>
          )}

          <div id="clerk-captcha" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {auth.error && <ErrorBanner message={auth.error} dark={!isLight} />}

            <FloatingEmailInput
              id={`${variant}-email`}
              label="البريد الإلكتروني"
              value={auth.email}
              onChange={auth.setEmail}
              config={config}
            />

            <FloatingPasswordInput
              id={`${variant}-password`}
              label="كلمة المرور"
              value={auth.password}
              onChange={auth.setPassword}
              showPassword={auth.showPassword}
              onToggleVisibility={auth.togglePasswordVisibility}
              config={config}
            />

            {variant === "student" && (
              <div className="flex justify-start">
                <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline underline-offset-4">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            )}

            <SubmitButton
              loading={auth.loading}
              text={config.submitText}
              className={config.submitButtonClassName}
              style={config.submitButtonStyle}
              hoverShadow={config.submitHoverShadow}
            />
          </form>

          {isLight && config.footerNode}
        </div>

        {!isLight && config.footerNode}
      </div>
    </div>
  );
}

function FloatingLabel({
  htmlFor,
  children,
  config,
}: {
  htmlFor: string;
  children: ReactNode;
  config: LoginVariantConfig;
}) {
  return (
    <label
      htmlFor={htmlFor}
      dir="rtl"
      className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 px-1 text-sm font-bold transition-all duration-150 peer-focus:top-0 peer-focus:right-3 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:right-3 peer-[:not(:placeholder-shown)]:translate-y-[-50%] peer-[:not(:placeholder-shown)]:text-xs"
      style={{ background: config.floatLabelBg, color: config.floatLabelRestColor }}
    >
      {children}
    </label>
  );
}

function FloatingEmailInput({
  id, label, value, onChange, config,
}: {
  id: string; label: string; value: string; onChange: (val: string) => void; config: LoginVariantConfig;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const atIndex = value.lastIndexOf("@");
  const afterAt = atIndex >= 0 ? value.slice(atIndex + 1) : "";
  const prefix = atIndex >= 0 ? value.slice(0, atIndex) : value;
  const suggestions = atIndex >= 0 && prefix.length > 0
    ? EMAIL_DOMAIN_SUGGESTIONS.filter((d) => d.startsWith(afterAt) && d !== afterAt)
    : [];
  const showDropdown = dropdownOpen && suggestions.length > 0;

  const pickSuggestion = (domain: string) => { onChange(`${prefix}@${domain}`); setDropdownOpen(false); setActiveIndex(0); };

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(suggestions.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); pickSuggestion(suggestions[activeIndex]); }
    else if (e.key === "Escape") { e.preventDefault(); setDropdownOpen(false); }
  };

  return (
    <div ref={containerRef} className="relative">
      <Mail
        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10"
        style={{ color: config.inputIconColor ?? "var(--muted-foreground)" }}
      />
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => { onChange(e.target.value); setActiveIndex(0); setDropdownOpen(e.target.value.includes("@")); }}
        onFocus={() => value.includes("@") && setDropdownOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder=" "
        className={`peer ${config.inputClassName ?? ""}`}
        required
        dir="ltr"
        autoComplete="email"
        style={config.inputStyle ? { ...config.inputStyle, paddingTop: "1.5rem", paddingBottom: "0.5rem", textAlign: "left" } : { paddingTop: "1.5rem", paddingBottom: "0.5rem", textAlign: "left" }}
      />
      <FloatingLabel htmlFor={id} config={config}>{label}</FloatingLabel>

      {showDropdown && (
        <ul className="absolute z-20 top-full mt-2 right-0 left-0 p-1 rounded-md nb-border nb-shadow max-h-48 overflow-y-auto" style={{ background: config.floatLabelBg }} role="listbox">
          {suggestions.map((domain, i) => (
            <li key={domain}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSuggestion(domain)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full px-3 py-2 rounded-md text-sm font-bold transition-colors ${i === activeIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
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
  id, label, value, onChange, showPassword, onToggleVisibility, config,
}: {
  id: string; label: string; value: string; onChange: (val: string) => void;
  showPassword: boolean; onToggleVisibility: () => void; config: LoginVariantConfig;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer nb-input"
        required
        dir="ltr"
        autoComplete="current-password"
        style={config.inputStyle
          ? { ...config.inputStyle, padding: "1.5rem 1rem 0.5rem 3rem", textAlign: "left" }
          : { paddingTop: "1.5rem", paddingBottom: "0.5rem", paddingLeft: "3rem", paddingRight: "1rem", textAlign: "left" }}
      />
      <FloatingLabel htmlFor={id} config={config}>{label}</FloatingLabel>
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-80 z-10"
        tabIndex={-1}
        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        style={{ color: config.inputIconColor ?? "var(--muted-foreground)" }}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

function ErrorBanner({ message, dark }: { message: string; dark: boolean }) {
  if (dark) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(220,38,38,0.15)", border: "2px solid #DC2626" }}>
        <AlertCircle className="w-5 h-5 shrink-0" style={{ color: "#FCA5A5" }} />
        <p className="text-sm font-semibold" style={{ color: "#FCA5A5" }}>{message}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg">
      <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
      <p className="text-sm font-semibold text-destructive">{message}</p>
    </div>
  );
}

function SubmitButton({ loading, text, className, style, hoverShadow }: {
  loading: boolean; text: string; className?: string; style?: CSSProperties; hoverShadow?: { from: string; to: string };
}) {
  const handleHover = hoverShadow ? {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = hoverShadow.to; },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = hoverShadow.from; },
  } : {};

  return (
    <button type="submit" disabled={loading} className={className} style={style} {...handleHover}>
      {loading ? (
        <><Loader2 className="w-5 h-5 animate-spin" />جاري الدخول...</>
      ) : (
        <><LogIn className="w-5 h-5" />{text}</>
      )}
    </button>
  );
}
