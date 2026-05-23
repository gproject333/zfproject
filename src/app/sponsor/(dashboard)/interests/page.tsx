"use client";

import { useQuery } from "convex/react";
import { Heart } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Spinner } from "@/components/ui";
import SponsorInterestCard from "@/features/sponsor/components/SponsorInterestCard";

export default function SponsorInterestsPage() {
  const rows = useQuery(api.applications.sponsor.myInterests, {});

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            اهتماماتي
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            المشاريع التي أبديت اهتمامك بها وحالة متابعة الإدارة لها.
          </p>
        </div>
        {rows && rows.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
            <Heart className="w-4 h-4 text-secondary-border" fill="currentColor" />
            <span className="font-extrabold text-sm text-secondary-border">
              {rows.length}
            </span>
          </div>
        )}
      </header>

      {rows === undefined ? (
        <LoadingGrid />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => (
            <SponsorInterestCard key={row.assignmentId} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="xl" color="current" className="text-secondary" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4 rounded-2xl border border-dashed border-secondary/30 bg-secondary/[0.04]">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/40 flex items-center justify-center shadow-[0_0_24px_rgba(201,162,39,0.2)]">
        <Heart className="w-9 h-9 text-secondary-border" fill="currentColor" />
      </div>
      <h2 className="text-xl font-extrabold">لا توجد اهتمامات بعد</h2>
      <p className="text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
        لمّا تتصفح ريلز المشاريع وتضغط على القلب، حتلاقي المشروع هنا، وحتعرف
        إذا الإدارة تواصلت معك بشأنه.
      </p>
    </div>
  );
}
