"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {Compass, ExternalLink, Video, GraduationCap, Link2, Calendar} from "lucide-react";
import { Spinner, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatArabicDate } from "@/lib/formatters";

type FilterType = "all" | "video" | "course" | "link";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "video", label: "فيديوهات" },
  { value: "course", label: "دورات" },
  { value: "link", label: "روابط" },
];

const TYPE_ICON = {
  video: Video,
  course: GraduationCap,
  link: Link2,
} as const;

const TYPE_BG = {
  video: "bg-red-500/15",
  course: "bg-blue-500/15",
  link: "bg-secondary/15",
} as const;

const TYPE_COLOR = {
  video: "text-red-600 dark:text-red-400",
  course: "text-blue-600 dark:text-blue-400",
  link: "text-secondary",
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
        <Tabs
          selectedKey={filter}
          onSelectionChange={(k) => setFilter(k as FilterType)}
        >
          <Tabs.List>
            {FILTERS.map((f) => (
              <Tabs.Tab key={f.value} id={f.value}>
                {f.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </div>

      {resources === undefined ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" color="current" className="text-secondary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد موارد بعد"
          description="سيضيف المشرفون موارد تعليمية قريباً. تابع هنا!"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, index) => {
            const Icon = TYPE_ICON[r.type];
            return (
              <a
                key={r._id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-card-interactive overflow-hidden flex flex-col animate-slide-up"
                style={{ opacity: 0, animationDelay: `${(index + 1) * 0.08}s` }}
              >
                <div
                  className={`h-36 flex items-center justify-center border-b-2 border-foreground ${TYPE_BG[r.type]}`}
                >
                  <Icon className={`w-10 h-10 ${TYPE_COLOR[r.type]}`} />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="nb-badge-soft !bg-muted text-xs mb-2 self-start">
                    {TYPE_LABEL[r.type]}
                  </span>
                  <h3 className="font-extrabold text-base leading-snug line-clamp-2 flex-1">
                    {r.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/10 text-xs text-muted-foreground font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatArabicDate(r.createdAt)}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
