"use client";

import { Eye } from "lucide-react";
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/configs/application";
import { formatArabicDate } from "@/lib/formatters";
import type { Doc } from "../../../../convex/_generated/dataModel";

interface ApplicationCardProps {
  application: Doc<"applications">;
  onClick: () => void;
  /** Index used for staggered animation delay */
  index?: number;
}

/**
 * Interactive list card for an application.
 * Used by student, supervisor, and sponsor list pages.
 */
export default function ApplicationCard({
  application,
  onClick,
  index = 0,
}: ApplicationCardProps) {
  const statusCfg = STATUS_CONFIG[application.status];
  const typeCfg = TYPE_CONFIG[application.type];
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeCfg.icon;

  return (
    <button
      onClick={onClick}
      className="nb-card-interactive p-5 w-full text-right animate-slide-up"
      style={{ opacity: 0, animationDelay: `${(index + 1) * 0.1}s` }}
    >
      <div className="flex items-center gap-4">
        <div className={`nb-badge ${statusCfg.bg} ${statusCfg.text}`}>
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
