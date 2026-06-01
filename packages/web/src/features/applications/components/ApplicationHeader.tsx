"use client";

import type { ReactNode } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import type { Doc } from "@smart-zuj/convex";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { formatArabicDate } from "@smart-zuj/core";
import StatusBadge from "./StatusBadge";


interface ApplicationHeaderProps {
  app: Doc<"applications">;

  onBack: () => void;
  /** Buttons/actions rendered to the right of the title block. */
  rightSlot?: ReactNode;
  /** Title size — `xl` for student view, `2xl` for supervisor review. */
  titleSize?: "xl" | "2xl";
}

/**
 * Shared hero header for the application detail / review pages.
 * Renders: back button + project name + status badge + type/date + presence.
 * Optionally accepts a right-side slot for audience-specific actions.
 */
export default function ApplicationHeader({
  app,

  onBack,
  rightSlot,
  titleSize = "xl",
}: ApplicationHeaderProps) {
  const typeCfg = TYPE_CONFIG[app.type];
  const TypeIcon = typeCfg.icon;
  const titleClass = titleSize === "2xl" ? "text-2xl" : "text-xl";

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          onClick={onBack}
          className="w-10 h-10 ds-border rounded-lg flex items-center justify-center bg-card ds-shadow-hover shrink-0 mt-1"
          aria-label="عودة"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className={`${titleClass} font-bold break-words`}>
              {app.projectName}
            </h2>
            <StatusBadge status={app.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
              {typeCfg.label}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              {formatArabicDate(app.submittedAt ?? app.createdAt)}
            </span>
          </div>

        </div>
      </div>

      {rightSlot}
    </div>
  );
}
