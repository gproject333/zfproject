"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { FloatingBaseProps } from "./index";

/**
 * Select variant of the floating-label family. Native `<select>` doesn't
 * expose `:placeholder-shown`, so the peer-focus CSS trick used by the
 * other floating inputs doesn't work here. Instead we just pin the label
 * to the top edge of the field at all times — the selected value (or the
 * placeholder option) shows in the middle. This keeps the rendering
 * predictable and matches the rest of the auth form visually (border,
 * padding, label background, icon position).
 */
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
  placeholderOption = "يُرجى الاختيار...",
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
          className={`peer ds-input appearance-none cursor-pointer text-sm font-medium ${error ? "!border-destructive" : ""}`}
          style={
            {
              paddingTop: "1.5rem",
              paddingBottom: "0.5rem",
              paddingRight: icon ? "3.75rem" : "1rem",
              paddingLeft: "2.5rem",
            } as CSSProperties
          }
        >
          <option value="" disabled hidden>
            {placeholderOption}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          dir="rtl"
          className="pointer-events-none absolute right-3 top-0 -translate-y-1/2 px-1 text-xs font-bold"
          style={{
            background: labelBg,
            color: error ? "var(--destructive)" : "var(--muted-foreground)",
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
