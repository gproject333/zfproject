"use client";

import { Eye } from "lucide-react";
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/configs/application";
import { formatArabicDate } from "@smart-zuj/core";
import type { Doc } from "@smart-zuj/convex";

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
    // Gradient hero band keyed off the project type so the tile isn't
    // a wall of text. Maps the existing token classes (text-primary,
    // text-secondary, text-accent) to matching gradient backgrounds.
    const gradient =
      application.type === "entrepreneurial_idea"
        ? "from-primary/25 via-primary/12 to-primary/5"
        : application.type === "it_graduation"
          ? "from-secondary/25 via-secondary/12 to-secondary/5"
          : "from-accent/25 via-accent/12 to-accent/5";
    return (
      <button
        onClick={onClick}
        className="ds-card-interactive text-right aspect-square flex flex-col overflow-hidden"
      >
        {/* Visual hero */}
        <div
          className={`relative h-24 sm:h-28 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
        >
          <TypeIcon className={`w-12 h-12 ${typeCfg.color} drop-shadow-sm`} />
          <div className={`absolute top-2 right-2 ds-badge ${statusCfg.bg} ${statusCfg.text}`}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </div>
          <Eye className="absolute top-2 left-2 w-4 h-4 text-foreground/40" />
        </div>

        {/* Body */}
        <div className="flex-1 p-4 flex flex-col gap-1.5">
          <h4 className="font-bold text-sm line-clamp-2 flex-1">
            {application.projectName}
          </h4>
          <span className="text-[11px] text-muted-foreground font-medium truncate">
            {typeCfg.label}
          </span>
          <span className="text-[11px] text-muted-foreground">
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
