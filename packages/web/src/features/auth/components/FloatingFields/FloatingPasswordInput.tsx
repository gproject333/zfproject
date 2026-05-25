"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FloatingLabel, type FloatingBaseProps } from "./index";

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
          className={`peer ds-input ${error ? "!border-destructive" : ""}`}
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
