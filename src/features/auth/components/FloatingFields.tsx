"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import { ChevronDown, Eye, EyeOff, Mail } from "lucide-react";

export const EMAIL_DOMAIN_SUGGESTIONS = ["std-zuj.edu.jo", "zuj.edu.jo"];

export function FloatingLabel({
  htmlFor,
  children,
  bg,
  error,
}: {
  htmlFor: string;
  children: ReactNode;
  bg: string;
  error?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      dir="rtl"
      className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 px-1 text-sm font-bold transition-all duration-150 peer-focus:top-0 peer-focus:right-3 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:right-3 peer-[:not(:placeholder-shown)]:translate-y-[-50%] peer-[:not(:placeholder-shown)]:text-xs"
      style={{
        background: bg,
        color: error ? "var(--destructive)" : "var(--muted-foreground)",
      }}
    >
      {children}
    </label>
  );
}

interface FloatingBaseProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  labelBg?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  dir?: "ltr" | "rtl" | "auto";
}

export function FloatingTextInput({
  id,
  label,
  value,
  onChange,
  error,
  labelBg = "var(--card)",
  required,
  autoComplete,
  placeholder,
  maxLength,
  icon,
  inputMode,
  dir,
}: FloatingBaseProps & {
  icon?: ReactNode;
  inputMode?: "text" | "numeric" | "email" | "tel";
}) {
  const resolvedDir = dir ?? "auto";
  return (
    <div className="space-y-1.5">
      <div className="relative">
        {icon && (
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-muted-foreground z-10"
            aria-hidden
          >
            {icon}
          </div>
        )}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? " "}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          inputMode={inputMode}
          dir={resolvedDir}
          className={`peer nb-input ${error ? "!border-destructive" : ""}`}
          style={{
            paddingTop: "1.5rem",
            paddingBottom: "0.5rem",
            paddingRight: "3.75rem",
            ...(resolvedDir === "ltr" ? { textAlign: "left" as const } : {}),
          }}
        />
        <FloatingLabel htmlFor={id} bg={labelBg} error={!!error}>
          {label}
        </FloatingLabel>
      </div>
      {error && (
        <p className="text-xs font-semibold text-destructive px-1">{error}</p>
      )}
    </div>
  );
}

export function FloatingEmailInput({
  id,
  label,
  value,
  onChange,
  error,
  labelBg = "var(--card)",
  required,
  autoComplete = "email",
}: FloatingBaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const atIndex = value.lastIndexOf("@");
  const afterAt = atIndex >= 0 ? value.slice(atIndex + 1) : "";
  const prefix = atIndex >= 0 ? value.slice(0, atIndex) : value;

  const suggestions =
    atIndex >= 0 && prefix.length > 0
      ? EMAIL_DOMAIN_SUGGESTIONS.filter(
          (d) => d.startsWith(afterAt) && d !== afterAt
        )
      : [];
  const showDropdown = dropdownOpen && suggestions.length > 0;

  const pickSuggestion = (domain: string) => {
    onChange(`${prefix}@${domain}`);
    setDropdownOpen(false);
    setActiveIndex(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setActiveIndex(0);
    setDropdownOpen(e.target.value.includes("@"));
  };

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

  return (
    <div className="space-y-1.5">
      <div ref={containerRef} className="relative">
        <Mail
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-muted-foreground z-10"
          aria-hidden
        />
        <input
          id={id}
          type="email"
          value={value}
          onChange={handleChange}
          onFocus={() => value.includes("@") && setDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder=" "
          required={required}
          autoComplete={autoComplete}
          dir="ltr"
          className={`peer nb-input pr-12 ${error ? "!border-destructive" : ""}`}
          style={{
            paddingTop: "1.5rem",
            paddingBottom: "0.5rem",
            textAlign: "left",
          }}
        />
        <FloatingLabel htmlFor={id} bg={labelBg} error={!!error}>
          {label}
        </FloatingLabel>

        {showDropdown && (
          <ul
            className="absolute z-20 top-full mt-2 right-0 left-0 p-1 rounded-md nb-border nb-shadow max-h-48 overflow-y-auto"
            style={{ background: labelBg }}
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
                    i === activeIndex
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
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
      {error && (
        <p className="text-xs font-semibold text-destructive px-1">{error}</p>
      )}
    </div>
  );
}

export function FloatingPasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  labelBg = "var(--card)",
  required,
  autoComplete = "new-password",
  showEye = true,
}: FloatingBaseProps & { showEye?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          required={required}
          autoComplete={autoComplete}
          dir="ltr"
          className={`peer nb-input ${error ? "!border-destructive" : ""}`}
          style={{
            paddingTop: "1.5rem",
            paddingBottom: "0.5rem",
            paddingLeft: showEye ? "3rem" : "1rem",
            paddingRight: "1rem",
            textAlign: "left",
          }}
        />
        <FloatingLabel htmlFor={id} bg={labelBg} error={!!error}>
          {label}
        </FloatingLabel>
        {showEye && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-80 text-muted-foreground z-10"
            tabIndex={-1}
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs font-semibold text-destructive px-1">{error}</p>
      )}
    </div>
  );
}

export function FloatingSelectInput({
  id,
  label,
  value,
  onChange,
  error,
  labelBg = "var(--card)",
  required,
  icon,
  options,
  placeholderOption = "اختر...",
}: FloatingBaseProps & {
  icon?: ReactNode;
  options: readonly string[];
  placeholderOption?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        {icon && (
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-muted-foreground z-10"
            aria-hidden
          >
            {icon}
          </div>
        )}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`peer nb-input pr-12 pl-10 appearance-none cursor-pointer ${error ? "!border-destructive" : ""}`}
          style={
            {
              paddingTop: "1.5rem",
              paddingBottom: "0.5rem",
            } as CSSProperties
          }
        >
          <option value="">{placeholderOption}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          dir="rtl"
          className="pointer-events-none absolute px-1 text-sm font-bold transition-all duration-150"
          style={{
            background: labelBg,
            color: error ? "var(--destructive)" : "var(--muted-foreground)",
            right: value ? "0.75rem" : "2.5rem",
            top: value ? "0" : "50%",
            transform: value ? "translateY(-50%)" : "translateY(-50%)",
            fontSize: value ? "0.75rem" : "0.875rem",
          }}
        >
          {label}
        </label>
        <ChevronDown
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
      </div>
      {error && (
        <p className="text-xs font-semibold text-destructive px-1">{error}</p>
      )}
    </div>
  );
}
