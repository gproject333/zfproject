"use client";

import { Trash2, Edit3, Eye, EyeOff } from "lucide-react";
import { getPlatformMeta } from "@/lib/configs/socialPlatforms";
import type { Id } from "@smart-zuj/convex";

interface SocialLinkRowProps {
  link: {
    _id: Id<"socialLinks">;
    platform: string;
    url: string;
    label?: string;
    order: number;
    isActive: boolean;
  };
  toggleActive: (id: Id<"socialLinks">, nextActive: boolean) => void;
  startEdit: (id: Id<"socialLinks">) => void;
  setPendingDeleteId: (id: Id<"socialLinks">) => void;
}

export function SocialLinkRow({
  link,
  toggleActive,
  startEdit,
  setPendingDeleteId,
}: SocialLinkRowProps) {
  const meta = getPlatformMeta(link.platform);
  const Icon = meta.icon;
  return (
    <div
      key={link._id}
      className={`ds-card p-4 flex items-center gap-4 ${
        link.isActive ? "" : "opacity-60"
      }`}
    >
      <div className="w-10 h-10 bg-muted ds-border rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm">
            {link.label || meta.label}
          </span>
          <span className="text-xs text-muted-foreground">
            #{link.order}
          </span>
        </div>
        <p
          className="text-xs text-muted-foreground truncate"
          dir="ltr"
        >
          {link.url}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => void toggleActive(link._id, !link.isActive)}
          title={link.isActive ? "إخفاء" : "إظهار"}
          aria-label={link.isActive ? "إخفاء الرابط" : "إظهار الرابط"}
          className="w-9 h-9 ds-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          {link.isActive ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <button
          type="button"
          onClick={() => startEdit(link._id)}
          title="تعديل"
          aria-label="تعديل الرابط"
          className="w-9 h-9 ds-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setPendingDeleteId(link._id)}
          title="حذف"
          aria-label="حذف الرابط"
          className="w-9 h-9 ds-border rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:border-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
