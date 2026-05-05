"use client";

import Link from "next/link";
import { Info, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import type { Doc } from "../../../../convex/_generated/dataModel";

type BannerDoc = Doc<"banners">;

const VARIANT_STYLE: Record<
  BannerDoc["variant"],
  {
    icon: typeof Info;
    iconColor: string;
    accentBg: string;
    borderColor: string;
  }
> = {
  info: {
    icon: Info,
    iconColor: "text-info",
    accentBg: "bg-info/10",
    borderColor: "border-r-info",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-success",
    accentBg: "bg-success/10",
    borderColor: "border-r-success",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-warning",
    accentBg: "bg-warning/10",
    borderColor: "border-r-warning",
  },
};

interface BannerProps {
  banner: BannerDoc;
}

/** Single presentational banner card. Pure UI — all data fetching lives
 * in `BannerList` and `useBannerAdmin`. */
export default function Banner({ banner }: BannerProps) {
  const style = VARIANT_STYLE[banner.variant];
  const Icon = style.icon;

  return (
    <div
      className={`nb-card flex items-start gap-3 p-4 border-r-[6px] ${style.borderColor} ${style.accentBg}`}
      role="status"
    >
      <div
        className={`w-10 h-10 rounded-lg nb-border flex items-center justify-center shrink-0 bg-card ${style.iconColor}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-sm leading-snug mb-1">{banner.title}</h4>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {banner.message}
        </p>
      </div>
      {banner.linkHref && (
        <Link
          href={banner.linkHref}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} shrink-0 whitespace-nowrap`}
        >
          {banner.linkLabel ?? "التفاصيل"}
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
