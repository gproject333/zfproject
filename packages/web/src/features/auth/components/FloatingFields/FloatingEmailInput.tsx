"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Mail } from "lucide-react";
import {
  EMAIL_DOMAIN_SUGGESTIONS,
  FloatingLabel,
  type FloatingBaseProps,
} from "./index";

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
          className={`peer ds-input pr-12 ${error ? "!border-destructive" : ""}`}
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
            className="absolute z-20 top-full mt-2 right-0 left-0 p-1 rounded-md ds-border ds-shadow max-h-48 overflow-y-auto"
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
