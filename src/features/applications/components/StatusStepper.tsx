"use client";

import { Check } from "lucide-react";
import type { ApplicationStatus } from "../../../../convex/lib/statuses";
import { buildStepperSteps } from "../utils/stepper";

interface StatusStepperProps {
  status: ApplicationStatus;
}

/**
 * Horizontal progression through the three visual phases of an
 * application: تقديم → مراجعة → قرار. Uses the project's nb-* utility
 * classes and status colors defined in globals.css.
 */
export default function StatusStepper({ status }: StatusStepperProps) {
  const steps = buildStepperSteps(status);

  return (
    <div className="nb-card p-5 sm:p-6" role="group" aria-label="مراحل الطلب">
      <ol className="flex items-start justify-between gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const isDone = step.state === "done";
          const isCurrent = step.state === "current";
          const isUpcoming = step.state === "upcoming";
          const Icon = step.icon;

          return (
            <li key={step.key} className="flex-1 flex flex-col items-center relative">
              {idx < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute top-6 sm:top-7 right-[calc(-50%+1.5rem)] left-[calc(50%+1.5rem)] h-[3px] ${
                    isDone ? step.bg : "bg-muted"
                  }`}
                />
              )}

              <div
                className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full nb-border flex items-center justify-center shrink-0 ${
                  isDone
                    ? `${step.bg} text-white nb-shadow-sm`
                    : isCurrent
                      ? `${step.bg} text-white nb-shadow animate-pulse-border`
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                ) : (
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>

              <span
                className={`mt-3 text-xs sm:text-sm font-bold text-center ${
                  isUpcoming ? "text-muted-foreground" : step.labelClass
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
