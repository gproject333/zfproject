"use client";

import { Star, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";

const STATS = [
  { value: "٣", label: "أنواع احتضان", icon: Star },
  { value: "✓", label: "مراجعة المشرف", icon: ShieldCheck },
  { value: "١٠٠٪", label: "رقمي وسريع", icon: Zap },
  { value: "٢٤/٧", label: "متاح دائماً", icon: CheckCircle2 },
];

/**
 * Black stats strip below the hero showing key platform numbers.
 */
export default function StatsStrip() {
  return (
    <section className="bg-foreground border-y-[3px] border-foreground px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-1 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Icon className="w-5 h-5 text-primary mb-1" />
                <span className="text-3xl font-black text-background">{s.value}</span>
                <span className="text-xs font-bold text-background/60">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
