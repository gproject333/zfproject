"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { FloatingBaseProps } from "./index";

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
          className={`peer ds-input pr-12 pl-10 appearance-none cursor-pointer ${error ? "!border-destructive" : ""}`}
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
