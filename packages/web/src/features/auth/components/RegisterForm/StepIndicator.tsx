"use client";

import { CheckCircle2 } from "lucide-react";

interface StepLabel {
  num: number;
  label: string;
}

interface StepIndicatorProps {
  step: number;
  stepLabels: StepLabel[];
}

export function StepIndicator({ step, stepLabels }: StepIndicatorProps) {
  return (
    <ol className="flex items-center justify-center gap-2 mb-6" aria-label="مراحل إنشاء الحساب">
      {stepLabels.map((s, idx) => (
        <li key={s.num} className="flex items-center gap-2">
          <span
            aria-current={step === s.num ? "step" : undefined}
            className={`flex items-center gap-2 px-3 py-1.5 ds-border rounded-full text-xs font-bold transition-colors ${
              step === s.num
                ? "bg-primary text-primary-foreground"
                : step > s.num
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step > s.num ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                {s.num}
              </span>
            )}
            {s.label}
          </span>
          {idx < stepLabels.length - 1 && <span className="w-6 h-px bg-foreground/20" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
