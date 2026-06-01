"use client";

import type { ReactNode } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Doc } from "@smart-zuj/convex";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { formatArabicDate } from "@smart-zuj/core";
import StatusBadge from "@/features/applications/components/StatusBadge";

import StatusStepper from "@/features/applications/components/StatusStepper";

interface StudentApplicationHeroProps {
  app: Doc<"applications">;

  onBack: () => void;
  /** Audience-specific actions (edit / delete / cancel) shown top-end. */
  actions?: ReactNode;
  /** Hide the status band, e.g. while the edit form is open. */
  showStepper?: boolean;
}

/**
 * Page anchor for the student application detail view. One surface with
 * two zones: an identity block (back link, project name, status, meta)
 * and a recessed status band carrying the embedded progress stepper.
 */
export default function StudentApplicationHero({
  app,

  onBack,
  actions,
  showStepper = true,
}: StudentApplicationHeroProps) {
  const typeCfg = TYPE_CONFIG[app.type];
  const TypeIcon = typeCfg.icon;
  const isSubmitted = !!app.submittedAt;

  return (
    <div className="ds-card overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* Back link + audience actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            العودة إلى الطلبات
          </button>
          {actions}
        </div>

        {/* Project name + status */}
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
          <h1 className="text-2xl sm:text-[1.7rem] font-bold leading-tight break-words min-w-0">
            {app.projectName}
          </h1>
          <span className="shrink-0 pt-1">
            <StatusBadge status={app.status} />
          </span>
        </div>

        {/* Meta */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
            {typeCfg.label}
          </span>
          <span aria-hidden className="hidden sm:inline text-foreground/20">
            •
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <CalendarDays className="w-4 h-4" />
            {isSubmitted ? "قُدّم في" : "أُنشئ في"}{" "}
            {formatArabicDate(app.submittedAt ?? app.createdAt)}
          </span>
        </div>


      </div>

      {showStepper && (
        <div className="border-t border-foreground/[0.07] bg-background px-5 sm:px-6 py-5">
          <StatusStepper status={app.status} embedded />
        </div>
      )}
    </div>
  );
}
