"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui";

/**
 * Replaces the old QuickLinks 4-card identical grid (DESIGN.md "identical
 * card grids" Don't). Surfaces only items that *need* the admin's attention —
 * pending upgrade requests and applications under review. If nothing is
 * pending, shows a single restful confirmation line instead of a grid of
 * navigation shortcuts that already live in the sidebar.
 */
export default function PendingActions({
  pendingUpgrades,
  underReviewApplications,
}: {
  pendingUpgrades: number;
  underReviewApplications: number;
}) {
  const items = [
    pendingUpgrades > 0 && {
      href: "/admin/upgrade-requests",
      icon: TrendingUp,
      label: `${pendingUpgrades} ${pendingUpgrades === 1 ? "طلب ترقية" : "طلبات ترقية"} بانتظار مراجعتك`,
      cta: "مراجعة",
      tone: "primary" as const,
    },
    underReviewApplications > 0 && {
      href: "/admin/students",
      icon: Clock,
      label: `${underReviewApplications} طلب قيد المراجعة من المشرفين`,
      cta: "عرض",
      tone: "neutral" as const,
    },
  ].filter(Boolean) as {
    href: string;
    icon: typeof TrendingUp;
    label: string;
    cta: string;
    tone: "primary" | "neutral";
  }[];

  if (items.length === 0) {
    return (
      <Card className="p-5 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-success shrink-0" />
        <p className="text-sm font-bold text-foreground">
          كل شيء تحت السيطرة — لا توجد طلبات تنتظر إجراءً منك الآن.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-extrabold text-muted-foreground mb-3">الإجراءات المعلّقة</h3>
      <ul className="divide-y divide-border/30">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 transition-colors ${
                item.tone === "primary"
                  ? "hover:text-primary"
                  : "hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    item.tone === "primary" ? "text-primary" : "text-warning"
                  }`}
                />
                <span className="text-sm font-bold truncate">{item.label}</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground group-hover:text-current shrink-0">
                {item.cta}
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
