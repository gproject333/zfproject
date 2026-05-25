"use client";

import { Eye, EyeOff } from "lucide-react";
import { FloatingLabel } from "./FloatingLabel";

export function FloatingPasswordInput({
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
