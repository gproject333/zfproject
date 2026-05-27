"use client";

import { Sun, Moon, Eye, Sparkles, Contrast } from "lucide-react";
import { FeatureSection, MockupFrame, MockupHeader } from "../index";

/* ─────────────────────── Showcase: Light & Dark mode ─────────────────────── */

export function ThemeShowcase({ ctaHref }: { ctaHref: string }) {
  return (
    <FeatureSection
      headline="وضع نهاري وآخر ليلي"
      highlight="بنقرة واحدة"
      description="واجهة المنصة تتكيّف مع تفضيلك البصري. ابدأ يومك بالوضع الفاتح المريح، وانتقل للوضع الداكن مساءً لتقليل إجهاد العين أثناء مراجعة الطلبات والمحتوى الطويل."
      bullets={[
        { icon: Eye, label: "ألوان متّسقة عبر كل الصفحات — لوحة الطالب والمشرف والإدارة" },
        { icon: Contrast, label: "تباين قابل للقراءة في الإضاءة المنخفضة دون فقدان هوية المنصة" },
        { icon: Sparkles, label: "تذكّر تفضيلك تلقائيًّا في الزيارات القادمة" },
      ]}
      cta="جرّبها الآن"
      ctaHref={ctaHref}
      mockupSide="right"
      mockup={<ThemeMockup />}
    />
  );
}

function ThemeMockup() {
  return (
    <MockupFrame>
      <MockupHeader
        title="مظهر المنصة"
        subtitle="بدّل بين النهاري والليلي حسب راحتك"
      />
      <div className="p-6 grid grid-cols-2 gap-4">
        <ThemeCard variant="light" />
        <ThemeCard variant="dark" />
      </div>
      <div className="px-6 pb-5 flex items-center justify-between border-t border-border/40 pt-4">
        <span className="text-xs font-bold text-muted-foreground">الوضع الحالي</span>
        <ToggleSwitch />
      </div>
    </MockupFrame>
  );
}

function ThemeCard({ variant }: { variant: "light" | "dark" }) {
  const isDark = variant === "dark";
  const Icon = isDark ? Moon : Sun;
  const label = isDark ? "ليلي" : "نهاري";
  return (
    <div
      className={`rounded-xl p-4 ds-border overflow-hidden relative ${
        isDark ? "bg-[#1a1f1a] border-white/10" : "bg-white border-[#e5e5e0]"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ${
            isDark ? "bg-white/10 text-white" : "bg-[#5B7A3A]/10 text-[#5B7A3A]"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span
          className={`text-xs font-extrabold ${
            isDark ? "text-white" : "text-[#1f1f1f]"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="space-y-2">
        <div
          className={`h-2 w-3/4 rounded-full ${
            isDark ? "bg-white/15" : "bg-[#1f1f1f]/15"
          }`}
        />
        <div
          className={`h-2 w-1/2 rounded-full ${
            isDark ? "bg-white/10" : "bg-[#1f1f1f]/10"
          }`}
        />
        <div className="h-1.5" />
        <div
          className={`h-8 w-full rounded-md flex items-center justify-center text-[10px] font-bold ${
            isDark
              ? "bg-[#5B7A3A] text-white"
              : "bg-[#5B7A3A] text-white"
          }`}
        >
          زرّ الإجراء
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full ds-border p-1 bg-muted/40">
      <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-foreground">
        <Sun className="w-3.5 h-3.5" />
      </div>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground">
        <Moon className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
