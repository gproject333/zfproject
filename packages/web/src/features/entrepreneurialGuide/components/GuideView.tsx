"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import {
  Compass,
  Sparkles,
  Search,
  Video,
  GraduationCap,
  Link2,
  ExternalLink,
  PlayCircle,
  ArrowUpLeft,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatArabicDate } from "@smart-zuj/core";

type FilterType = "all" | "video" | "course" | "link";

const TYPE_ICON = {
  video: Video,
  course: GraduationCap,
  link: Link2,
} as const;

const TYPE_LABEL = {
  video: "فيديو",
  course: "دورة",
  link: "رابط",
} as const;

const TYPE_GRADIENT = {
  video:
    "from-rose-500/15 via-red-400/10 to-orange-500/10 dark:from-rose-500/25 dark:via-red-400/15",
  course:
    "from-sky-500/15 via-blue-400/10 to-indigo-500/10 dark:from-sky-500/25 dark:via-blue-400/15",
  link:
    "from-emerald-500/15 via-teal-400/10 to-cyan-500/10 dark:from-emerald-500/25 dark:via-teal-400/15",
} as const;

const TYPE_RING = {
  video: "text-rose-600 dark:text-rose-300",
  course: "text-sky-600 dark:text-sky-300",
  link: "text-emerald-600 dark:text-emerald-300",
} as const;

const TYPE_CHIP = {
  video: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
  course: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
  link: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
} as const;

/**
 * Try to derive a thumbnail URL for video resources hosted on YouTube or
 * Vimeo. Returning `null` falls back to a stylised gradient card. We avoid
 * external fetches — purely string parsing — so the page stays fast and
 * works in offline-ish previews.
 */
function youtubeThumbnail(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host.endsWith("youtube.com")) id = u.searchParams.get("v");
    if (id && /^[a-zA-Z0-9_-]{6,}$/.test(id))
      return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } catch {
    /* not a parseable URL */
  }
  return null;
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function GuideView() {
  const resources = useQuery(api.entrepreneurialGuide.list, {});
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c = { all: 0, video: 0, course: 0, link: 0 } as Record<FilterType, number>;
    (resources ?? []).forEach((r) => {
      c.all += 1;
      c[r.type] += 1;
    });
    return c;
  }, [resources]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (resources ?? []).filter((r) => {
      if (filter !== "all" && r.type !== filter) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [resources, filter, search]);

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "الجميع" },
    { value: "video", label: "فيديوهات" },
    { value: "course", label: "دورات" },
    { value: "link", label: "روابط" },
  ];

  return (
    <div className="animate-fade-in" dir="rtl">
      {/* ───── Hero strip ───── */}
      <section className="relative overflow-hidden rounded-3xl ds-border bg-gradient-to-bl from-primary/12 via-primary/4 to-secondary/12 p-6 sm:p-8 mb-8">
        <div
          aria-hidden
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-secondary/15 blur-3xl pointer-events-none"
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ds-border bg-card flex items-center justify-center shrink-0 shadow-[0_18px_30px_-18px_color-mix(in_srgb,var(--primary)_55%,transparent)]">
            <Compass className="w-9 h-9 sm:w-10 sm:h-10 text-primary" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-[0.18em] uppercase text-primary/85 mb-2">
              <Sparkles className="w-3 h-3" />
              مكتبة الموارد
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
              الدليل الريادي
            </h1>
            <p className="mt-2 text-sm sm:text-base text-foreground/65 max-w-2xl leading-relaxed">
              فيديوهات ودورات وروابط منتقاة من المشرفين الأكاديميين لتُعينك على
              تطوير مشروعك خطوة بخطوة.
            </p>
          </div>
          {resources && counts.all > 0 && (
            <div className="hidden sm:flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-card ds-border text-center min-w-[110px]">
              <span className="text-3xl font-black text-primary leading-none">
                {counts.all}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground mt-1">
                مورد متاح
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ───── Filters + Search ───── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-wrap gap-2 order-2 sm:order-1">
          {filters.map((f) => {
            const isActive = filter === f.value;
            const n = counts[f.value];
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 ${
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-[0_8px_20px_-10px_color-mix(in_srgb,var(--foreground)_55%,transparent)]"
                    : "bg-card text-foreground/75 border-border/30 hover:bg-foreground/5 hover:border-foreground/25 hover:text-foreground"
                }`}
              >
                {f.label}
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-background/15 text-background"
                      : "bg-foreground/8 text-foreground/70"
                  }`}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative order-1 sm:order-2 sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الموارد..."
            className="w-full rounded-full bg-card border border-border/40 pr-10 pl-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all"
          />
        </div>
      </div>

      {/* ───── Grid / Loading / Empty ───── */}
      {resources === undefined ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title={
            search
              ? "لا توجد نتائج تطابق بحثك"
              : counts.all === 0
                ? "لا توجد موارد بعد"
                : "لا توجد موارد في هذا التصنيف"
          }
          description={
            search
              ? "جرّب كلمة بحث أخرى أو اختر تصنيفًا مختلفًا."
              : "سيضيف المشرفون موارد تعليمية قريبًا."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r, index) => (
            <ResourceCard key={r._id} resource={r} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function ResourceCard({
  resource,
  index,
}: {
  resource: {
    _id: string;
    title: string;
    type: "video" | "course" | "link";
    url: string;
    createdAt: number;
  };
  index: number;
}) {
  const Icon = TYPE_ICON[resource.type];
  const thumb = resource.type === "video" ? youtubeThumbnail(resource.url) : null;
  const host = hostLabel(resource.url);

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col rounded-2xl bg-card ds-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_color-mix(in_srgb,var(--foreground)_45%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 animate-slide-up"
      style={{ opacity: 0, animationDelay: `${(index + 1) * 0.06}s`, animationFillMode: "forwards" }}
    >
      {/* Media / cover */}
      <div
        className={`relative h-40 sm:h-44 overflow-hidden bg-gradient-to-bl ${TYPE_GRADIENT[resource.type]}`}
      >
        {thumb ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <PlayCircle className="absolute inset-0 m-auto w-14 h-14 text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300" />
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-foreground/5 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-foreground/8 blur-3xl"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-card/80 backdrop-blur-sm ds-border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Icon className={`w-8 h-8 ${TYPE_RING[resource.type]}`} />
              </div>
            </div>
          </>
        )}
        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border backdrop-blur ${TYPE_CHIP[resource.type]}`}
        >
          <Icon className="w-3 h-3" />
          {TYPE_LABEL[resource.type]}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-extrabold text-base sm:text-lg leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
          {resource.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs font-bold text-muted-foreground">
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate" dir="ltr">{host}</span>
        </div>
        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">
            {formatArabicDate(resource.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-primary opacity-70 group-hover:opacity-100 group-hover:gap-2 transition-all duration-200">
            افتح
            <ArrowUpLeft className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-card ds-border overflow-hidden animate-pulse"
        >
          <div className="h-40 sm:h-44 bg-foreground/5" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 bg-foreground/8 rounded" />
            <div className="h-3 w-1/2 bg-foreground/8 rounded" />
            <div className="h-3 w-1/3 bg-foreground/8 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
