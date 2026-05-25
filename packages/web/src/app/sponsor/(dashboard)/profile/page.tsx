"use client";

import { useQuery } from "convex/react";
import { Heart, CheckCircle2 } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { Card } from "@/components/ui";
import SponsorProfileForm from "@/features/sponsor/components/SponsorProfileForm";

export default function SponsorProfilePage() {
  const interests = useQuery(api.applications.sponsor.myInterests, {});
  const totalInterests = interests?.length ?? 0;
  const contactedCount =
    interests?.filter((i) => i.adminContactedAt !== null).length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">الملف الشخصي</h1>
        <p className="text-sm text-muted-foreground font-medium">
          تعديل البيانات الشخصية ومراجعة النشاط على المنصة.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SponsorProfileForm />
        </div>

        <aside className="space-y-4">
          <StatCard
            icon={<Heart className="w-5 h-5" fill="currentColor" />}
            label="مشاريع مسجَّل عليها اهتمام"
            value={totalInterests}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="مشاريع تواصلت الإدارة بشأنها"
            value={contactedCount}
            variant="success"
          />
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  variant = "gold",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant?: "gold" | "success";
}) {
  const isSuccess = variant === "success";
  return (
    <Card
      className={`p-5 ${
        isSuccess
          ? "border-success/30 bg-success/[0.04]"
          : "border-secondary/30 bg-secondary/[0.05] shadow-[0_0_24px_rgba(201,162,39,0.12)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess
              ? "bg-success/15 text-success"
              : "bg-gradient-to-br from-secondary to-secondary-border text-secondary-foreground shadow-md"
          }`}
        >
          {icon}
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <p className="text-xs font-bold text-muted-foreground leading-snug">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}
