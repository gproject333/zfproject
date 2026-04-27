"use client";

import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message: string | undefined;
  /** Apply the shake animation (used on first-submit validation failure). */
  shake?: boolean;
  className?: string;
}

/**
 * Inline form-level error alert. Renders nothing when message is empty.
 * Shared between ApplicationCreateForm and ApplicationEditForm so the
 * destructive tone + icon stay identical.
 */
export default function FormError({ message, shake = false, className = "" }: FormErrorProps) {
  if (!message) return null;
  return (
    <div
      className={`flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg ${
        shake ? "animate-shake" : ""
      } ${className}`}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
      <p className="text-sm font-semibold text-destructive">{message}</p>
    </div>
  );
}
