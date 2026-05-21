"use client";

import { Check } from "lucide-react";
import type { ApplicationStatus } from "../../../../convex/lib/statuses";
import { buildStepperSteps } from "../utils/stepper";
import { Card } from "@/components/ui";

interface StatusStepperProps {
  status: ApplicationStatus;
  /**
   * Render without the Card wrapper, at a compact size, so the stepper
   * can sit inside a page hero as a status band. The parent supplies
   * the surface and padding.
   */
  embedded?: boolean;
}

/**
 * Horizontal progression through the three visual phases of an
 * application: تقديم → مراجعة → قرار. Uses the project's nb-* utility
 * classes and status colors defined in globals.css.
 */
export default function StatusStepper({
  status,
  embedded = false,
}: StatusStepperProps) {
  const steps = buildStepperSteps(status);

  // The connector bridges step `idx` to the next step, which sits to its
  // LEFT in this RTL layout — so the line runs leftward from the circle
  // center. The inset constant must stay ≤ the smallest circle radius so
  // both ends tuck under the circles instead of leaving a gap.
  const sz = embedded
    ? {
        circle: "w-9 h-9 sm:w-10 sm:h-10",
        icon: "w-4 h-4 sm:w-5 sm:h-5",
        line: "top-[18px] sm:top-5 left-[calc(-50%+1.125rem)] right-[calc(50%+1.125rem)]",
        label: "mt-2 text-[11px] sm:text-xs",
      }
    : {
        circle: "w-12 h-12 sm:w-14 sm:h-14",
        icon: "w-5 h-5 sm:w-6 sm:h-6",
        line: "top-6 sm:top-7 left-[calc(-50%+1.5rem)] right-[calc(50%+1.5rem)]",
        label: "mt-3 text-xs sm:text-sm",
      };

  const inner = (
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
                className={`absolute h-[3px] rounded-full ${sz.line} ${
                  isDone ? step.bg : "bg-muted"
                }`}
              />
            )}

            <div
              className={`relative z-10 ${sz.circle} rounded-full nb-border flex items-center justify-center shrink-0 transition-transform ${
                isDone
                  ? `${step.bg} text-white nb-shadow-sm`
                  : isCurrent
                    ? `${step.bg} text-white nb-shadow scale-105`
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? (
                <Check className={sz.icon} strokeWidth={3} />
              ) : (
                <Icon className={sz.icon} />
              )}
            </div>

            <span
              className={`${sz.label} font-medium text-center ${
                isUpcoming ? "text-muted-foreground" : step.labelClass
              } ${isCurrent ? "font-bold" : ""}`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );

  if (embedded) {
    return (
      <div role="group" aria-label="مراحل الطلب">
        {inner}
      </div>
    );
  }

  return (
    <Card className="p-5 sm:p-6" role="group" aria-label="مراحل الطلب">
      {inner}
    </Card>
  );
}
