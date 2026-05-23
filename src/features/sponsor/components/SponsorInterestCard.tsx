"use client";

import Link from "next/link";
import { Clock4, CheckCircle2, VideoOff, Sparkles } from "lucide-react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../../convex/_generated/api";
import { TYPE_CONFIG } from "@/lib/configs/application";

type InterestRow = FunctionReturnType<
  typeof api.applications.sponsor.myInterests
>[number];

const TIME_UNITS: Array<[string, number]> = [
  ["يوم", 86_400_000],
  ["ساعة", 3_600_000],
  ["دقيقة", 60_000],
];

function relativeAr(ts: number): string {
  const diff = Date.now() - ts;
  for (const [label, ms] of TIME_UNITS) {
    const n = Math.floor(diff / ms);
    if (n >= 1) return `منذ ${n} ${label}`;
  }
  return "الآن";
}

export default function SponsorInterestCard({ row }: { row: InterestRow }) {
  const typeCfg = TYPE_CONFIG[row.type];
  const contacted = row.adminContactedAt !== null;

  return (
    <Link
      href={`/sponsor?focus=${row.applicationId}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-foreground/[0.08]
                 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300
                 hover:-translate-y-0.5 hover:border-secondary/40
                 hover:shadow-[0_8px_28px_rgba(201,162,39,0.25)]"
    >
      {/* Poster — uses the video's first frame as the cover (no separate
          thumbnail upload needed). preload=metadata is what makes browsers
          render that frame without buffering the rest of the file. */}
      <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
        {row.videoUrl ? (
          <video
            src={row.videoUrl}
            preload="metadata"
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-600">
            <VideoOff className="w-10 h-10" />
            <span className="text-xs font-bold">لا يوجد فيديو</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {typeCfg && (
          <span
            className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-extrabold
                       px-2.5 py-1 rounded-full bg-gradient-to-br from-secondary to-secondary-border
                       text-secondary-foreground shadow-md"
          >
            <Sparkles className="w-3 h-3" />
            {typeCfg.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-base leading-snug line-clamp-1 group-hover:text-secondary-border transition-colors">
            {row.projectName}
          </h3>
          <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
            {row.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-foreground/[0.06]">
          <StatusPill contacted={contacted} contactedAt={row.adminContactedAt} />
          <span className="text-[10px] text-muted-foreground font-semibold">
            {relativeAr(row.interestCreatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusPill({
  contacted,
  contactedAt,
}: {
  contacted: boolean;
  contactedAt: number | null;
}) {
  if (contacted) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full bg-success/15 text-success border border-success/30">
        <CheckCircle2 className="w-3 h-3" />
        الإدارة تواصلت
        {contactedAt && <span className="font-bold">· {relativeAr(contactedAt)}</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full bg-secondary/15 text-secondary-border border border-secondary/40">
      <Clock4 className="w-3 h-3" />
      بانتظار الإدارة
    </span>
  );
}
