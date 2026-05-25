"use client";

import { Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { FloatingLabel } from "./FloatingLabel";

/** Domain hints the autocomplete dropdown offers once the user types `@`. */
const EMAIL_DOMAIN_SUGGESTIONS = ["std-zuj.edu.jo", "zuj.edu.jo"];

export function FloatingEmailInput({
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
