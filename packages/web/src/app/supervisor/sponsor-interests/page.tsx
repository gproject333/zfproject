"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Heart,
  Mail,
  Phone,
  Link2,
  CheckCircle2,
  Clock4,
  Building2,
  ExternalLink,
} from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import { Button, Card, Spinner } from "@/components/ui";
import { TYPE_CONFIG } from "@/lib/configs/application";
import OliveSpinner from "@/components/OliveSpinner";

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

export default function AdminSponsorInterestsPage() {
  const rows = useQuery(api.applications.sponsor.allSponsorInterests, {});
  const markContacted = useMutation(api.applications.sponsor.markSponsorContacted);
  const [busy, setBusy] = useState<Id<"sponsorAssignments"> | null>(null);

  const handleMark = async (id: Id<"sponsorAssignments">) => {
    setBusy(id);
    try {
      await markContacted({ assignmentId: id });
    } finally {
      setBusy(null);
    }
  };

  const pendingCount = rows?.filter((r) => r.adminContactedAt === null).length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            اهتمامات الداعمين
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            راجع كل اهتمام أبداه أحد الداعمين بمشروع، تواصل معه بالقناة المناسبة، ثم
            علّم الاهتمام كـ«تم التواصل».
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive">
            <Clock4 className="w-4 h-4" />
            <span className="font-extrabold text-sm">
              {pendingCount} بانتظار التواصل
            </span>
          </span>
        )}
      </header>

      {rows === undefined ? (
        <div className="flex justify-center py-20">
          <OliveSpinner size="xl" className="text-accent" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <InterestRow
              key={row.assignmentId}
              row={row}
              isBusy={busy === row.assignmentId}
              onMark={() => void handleMark(row.assignmentId)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4 rounded-2xl border border-dashed border-foreground/15 bg-muted/30">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Heart className="w-7 h-7 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-extrabold">لا توجد اهتمامات بعد</h2>
      <p className="text-sm text-muted-foreground font-medium max-w-sm">
        عندما يُبدي أحد الداعمين اهتمامه بمشروع مقبول، يظهر هنا للمراجعة والمتابعة.
      </p>
    </div>
  );
}

type Row = NonNullable<
  ReturnType<typeof useQuery<typeof api.applications.sponsor.allSponsorInterests>>
>[number];

function InterestRow({
  row,
  isBusy,
  onMark,
}: {
  row: Row;
  isBusy: boolean;
  onMark: () => void;
}) {
  const typeCfg = TYPE_CONFIG[row.project.type];
  const contacted = row.adminContactedAt !== null;
  const sponsorName = row.sponsor.name?.trim() || "داعم دون اسم";
  const initial = sponsorName.charAt(0);

  return (
    <li>
      <Card
        className={`p-5 ${
          contacted
            ? "border-success/30 bg-success/[0.03]"
            : "border-secondary/30 bg-secondary/[0.04]"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Sponsor identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary-border text-secondary-foreground flex items-center justify-center font-black shadow-md shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-base truncate">{sponsorName}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-semibold mt-0.5">
                <a
                  href={`mailto:${row.sponsor.email}`}
                  className="inline-flex items-center gap-1 hover:text-accent hover:underline"
                  dir="ltr"
                >
                  <Mail className="w-3 h-3" />
                  {row.sponsor.email}
                </a>
                {row.sponsor.phone && (
                  <a
                    href={`tel:${row.sponsor.phone}`}
                    className="inline-flex items-center gap-1 hover:text-accent hover:underline"
                    dir="ltr"
                  >
                    <Phone className="w-3 h-3" />
                    {row.sponsor.phone}
                  </a>
                )}
                {row.sponsor.linkedinUrl && (
                  <a
                    href={row.sponsor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-accent hover:underline"
                    dir="ltr"
                  >
                    <Link2 className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Project */}
          <div className="flex items-center gap-2 md:max-w-xs min-w-0 md:border-r md:border-foreground/10 md:pr-4">
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <Link
              href={`/supervisor/applications/${row.project._id}`}
              className="min-w-0 flex-1 hover:text-accent"
            >
              <p className="text-sm font-bold truncate">{row.project.name}</p>
              {typeCfg && (
                <p className="text-[10px] text-muted-foreground font-bold">
                  {typeCfg.label}
                </p>
              )}
            </Link>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </div>

          {/* Status / action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-end space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-bold block">
                {relativeAr(row.interestCreatedAt)}
              </span>
              {contacted ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full bg-success/15 text-success border border-success/30">
                  <CheckCircle2 className="w-3 h-3" />
                  تم التواصل
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full bg-secondary/15 text-secondary-border border border-secondary/40">
                  <Clock4 className="w-3 h-3" />
                  بانتظار التواصل
                </span>
              )}
            </div>
            {!contacted && (
              <Button
                onPress={onMark}
                isDisabled={isBusy}
                variant="secondary"
                size="sm"
              >
                {isBusy ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                تم التواصل
              </Button>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}
