"use client";

import type { ReactNode } from "react";
import { FloatingLabel, type FloatingBaseProps } from "./index";

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
          className={`peer ds-input ${error ? "!border-destructive" : ""}`}
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
