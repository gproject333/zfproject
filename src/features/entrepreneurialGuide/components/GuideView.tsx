"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Compass,
  Loader2,
  ExternalLink,
  Youtube,
  GraduationCap,
  Link2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

type FilterType = "all" | "video" | "course" | "link";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "video", label: "فيديوهات" },
  { value: "course", label: "دورات" },
  { value: "link", label: "روابط" },
];

const TYPE_ICON = {
  video: Youtube,
  course: GraduationCap,
  link: Link2,
} as const;

const TYPE_COLOR = {
  video: "bg-red-500/15 text-red-600 dark:text-red-400",
  course: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  link: "bg-secondary/15 text-secondary",
} as const;

const TYPE_LABEL = {
  video: "فيديو",
  course: "دورة",
  link: "رابط",
} as const;

export default function GuideView() {
  const resources = useQuery(api.entrepreneurialGuide.list, {});
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered =
    resources?.filter((r) => filter === "all" || r.type === filter) ?? [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <Compass className="w-6 h-6 text-secondary" />
          دليلك الريادي
        </h2>
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold nb-border transition-all ${
                filter === f.value
                  ? "bg-primary text-primary-foreground nb-shadow-sm"
                  : "bg-card hover:bg-muted border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {resources === undefined ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد موارد بعد"
          description="سيضيف المشرفون موارد تعليمية قريباً. تابع هنا!"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const Icon = TYPE_ICON[r.type];
            return (
              <a
                key={r._id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-card-interactive p-5 flex items-start gap-4 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl nb-border flex items-center justify-center shrink-0 ${TYPE_COLOR[r.type]}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="nb-badge-soft !bg-muted text-xs">
                      {TYPE_LABEL[r.type]}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm leading-snug line-clamp-2">
                    {r.title}
                  </h3>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
