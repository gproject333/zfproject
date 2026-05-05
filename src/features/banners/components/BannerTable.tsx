"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Video } from "lucide-react";
import { Switch } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { youTubeThumbnail } from "@/lib/youtube";
import { formatArabicDate } from "@/lib/formatters";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { BannerDoc } from "../hooks/useBannerForm";

const VARIANT_LABELS: Record<"info" | "success" | "warning", string> = {
  info: "معلومة",
  success: "نجاح",
  warning: "تنبيه",
};

const AUDIENCE_LABELS: Record<
  "student" | "supervisor" | "landing" | "all",
  string
> = {
  student: "الطلاب",
  supervisor: "المشرفين",
  landing: "الصفحة الرئيسية",
  all: "الكل",
};

const TYPE_LABELS: Record<string, string> = {
  scrolling: "شريط متحرك",
  hero: "هيرو",
  text: "نص",
};

const MEDIA_LABELS: Record<string, string> = {
  image: "صورة",
  video: "فيديو",
  youtube: "يوتيوب",
};

function formatExpiry(ts: number | undefined, now: number): string {
  if (!ts) return "بدون انتهاء";
  const d = new Date(ts);
  const dateStr = formatArabicDate(d);
  const timeStr = d.toLocaleTimeString("ar-JO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (ts < now) return `انتهى ${dateStr}`;
  return `${dateStr} ${timeStr}`;
}

interface BannerTableProps {
  banners: BannerDoc[];
  onEdit: (banner: BannerDoc) => void;
  onToggle: (id: Id<"banners">, isActive: boolean) => Promise<void> | void;
  onRequestDelete: (id: Id<"banners">) => void;
}

export function BannerTable({
  banners,
  onEdit,
  onToggle,
  onRequestDelete,
}: BannerTableProps) {
  // `now` lives in state with a 60s refresh so the expired indicator can
  // update without calling the impure `Date.now()` during render.
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>العنوان</TableHead>
          <TableHead>العرض</TableHead>
          <TableHead>الوسائط</TableHead>
          <TableHead>الجمهور</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>الانتهاء</TableHead>
          <TableHead>آخر تحديث</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {banners.map((b) => {
          const bannerType = b.bannerType ?? (b.imageUrl ? "hero" : "text");
          const thumbUrl =
            "resolvedMediaUrl" in b && b.resolvedMediaUrl
              ? (b.resolvedMediaUrl as string)
              : b.imageUrl;
          return (
            <TableRow key={b._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {thumbUrl &&
                    bannerType === "hero" &&
                    b.mediaType !== "video" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          b.mediaType === "youtube" && b.imageUrl
                            ? (youTubeThumbnail(b.imageUrl) ?? thumbUrl)
                            : thumbUrl
                        }
                        alt={b.title}
                        className="w-12 h-12 rounded-lg object-cover nb-border shrink-0"
                      />
                    )}
                  {bannerType === "hero" && b.mediaType === "video" && (
                    <div className="w-12 h-12 rounded-lg nb-border shrink-0 bg-muted flex items-center justify-center">
                      <Video className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold">{b.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {b.message}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`nb-badge text-xs ${
                    bannerType === "scrolling"
                      ? "bg-primary/20 text-primary"
                      : bannerType === "hero"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted"
                  }`}
                >
                  {TYPE_LABELS[bannerType] ?? "نص"}
                </span>
              </TableCell>
              <TableCell>
                {b.mediaType ? (
                  <span className="nb-badge bg-muted text-xs">
                    {MEDIA_LABELS[b.mediaType] ?? b.mediaType}
                  </span>
                ) : (
                  <span className="nb-badge bg-muted text-xs">
                    {VARIANT_LABELS[b.variant]}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-xs font-bold">
                  {AUDIENCE_LABELS[b.audience]}
                </span>
              </TableCell>
              <TableCell>
                <Switch
                  isSelected={b.isActive}
                  onChange={(checked) => void onToggle(b._id, checked)}
                  aria-label={b.isActive ? "إيقاف الإعلان" : "تفعيل الإعلان"}
                  size="sm"
                />
              </TableCell>
              <TableCell>
                <span
                  className={`text-xs ${
                    b.expiresAt && b.expiresAt < now
                      ? "text-destructive font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatExpiry(b.expiresAt, now)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {formatArabicDate(b.updatedAt)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted"
                    aria-label="الإجراءات"
                  >
                    …
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(b)}>
                      <Pencil className="w-4 h-4" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      destructive
                      onSelect={() => onRequestDelete(b._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
