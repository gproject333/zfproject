"use client";

import { Eye } from "lucide-react";
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/configs/application";
import { formatArabicDate } from "@/lib/formatters";
import type { Doc } from "../../../../convex/_generated/dataModel";

interface ApplicationCardProps {
  application: Doc<"applications">;
  onClick: () => void;
  /** Accepted for call-site compatibility; no longer used for animation. */
  index?: number;
  /** Render as a square tile (for grid layouts) instead of a wide row. */
  square?: boolean;
}

/**
 * Interactive list card for an application.
 * Used by student, supervisor, and sponsor list pages.
 * Pass `square` to render a square tile for grid layouts.
 */
export default function ApplicationCard({
  application,
  onClick,
  square = false,
}: ApplicationCardProps) {
  const statusCfg = STATUS_CONFIG[application.status];
  const typeCfg = TYPE_CONFIG[application.type];
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeCfg.icon;

  if (square) {
    return (
      <button
        onClick={onClick}
        className="ds-card-interactive p-4 text-right aspect-square flex flex-col gap-2"
      >
        <div className="flex items-start justify-between gap-2">
          <div className={`ds-badge ${statusCfg.bg} ${statusCfg.text}`}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </div>
          <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>

        <h4 className="font-bold text-base line-clamp-3 flex-1">
          {application.projectName}
        </h4>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <TypeIcon className={`w-4 h-4 ${typeCfg.color} shrink-0`} />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {typeCfg.label}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatArabicDate(application.createdAt)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="ds-card-interactive p-5 w-full text-right"
    >
      <div className="flex items-center gap-4">
        <div className={`ds-badge ${statusCfg.bg} ${statusCfg.text}`}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base truncate">{application.projectName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
            <span className="text-xs text-muted-foreground font-medium">{typeCfg.label}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {formatArabicDate(application.createdAt)}
            </span>
          </div>
        </div>

        <Eye className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}
