"use client";

import type { ReactNode } from "react";

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

export interface FloatingBaseProps {
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

export { FloatingTextInput } from "./FloatingTextInput";
export { FloatingEmailInput } from "./FloatingEmailInput";
export { FloatingPasswordInput } from "./FloatingPasswordInput";
export { FloatingSelectInput } from "./FloatingSelectInput";
