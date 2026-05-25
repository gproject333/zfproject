"use client";

import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Bell,
} from "lucide-react";
import { FeatureSection, MockupFrame, MockupHeader } from "../index";

/* ─────────────────────── Showcase 2: Track ─────────────────────── */

export function TrackShowcase({ ctaHref }: { ctaHref: string }) {
  return (
    <FeatureSection
      headline="متابعة حالة الطلب"
      highlight="بصورة مباشرة"
      description="يُتاح للطالب الاطلاع على حالة طلبه وملاحظات المشرف الأكاديمي في أي وقت، مع إشعارات رسمية عند كل تحديث في مسار المراجعة."
      bullets={[
        { icon: Bell, label: "إشعارات رسمية فور تغيُّر حالة الطلب" },
        { icon: TrendingUp, label: "ملاحظات أكاديمية مفصَّلة من المشرف" },
        { icon: CheckCircle2, label: "حالات معتمدة: مسودة، قيد المراجعة، يحتاج تعديل، مقبول، مرفوض" },
      ]}
      cta="الانتقال إلى لوحة التحكم"
      ctaHref={ctaHref}
      mockupSide="left"
      mockup={<TrackMockup />}
    />
  );
}

function TrackMockup() {
  return (
    <MockupFrame>
      <MockupHeader title="طلباتي" subtitle="عرض موحَّد لجميع المشاريع وحالاتها" />
      <ul className="divide-y divide-border/40">
        <TrackRow
          name="نظام إدارة المخزون الذكي"
          type="فكرة ريادية"
          status="accepted"
          time="اعتُمد قبل يومين"
          highlight
        />
        <TrackRow
          name="منصة دروس تفاعلية"
          type="مشروع تخرج (IT)"
          status="under_review"
          time="قيد المراجعة"
        />
        <TrackRow
          name="نظام إدارة الفعاليات"
          type="مشروع يخدم الجامعة"
          status="needs_modification"
          time="ملاحظات من المشرف"
        />
      </ul>
      <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
        <div className="text-xs">
          <span className="font-extrabold text-foreground">٣ طلبات</span>
          <span className="text-muted-foreground font-medium"> · ١ مقبول · ١ قيد المراجعة · ١ يحتاج تعديل</span>
        </div>
        <span className="text-xs font-extrabold text-primary">+ طلب جديد</span>
      </div>
    </MockupFrame>
  );
}

function TrackRow({
  name,
  type,
  status,
  time,
  highlight = false,
}: {
  name: string;
  type: string;
  status: "under_review" | "accepted" | "needs_modification";
  time: string;
  highlight?: boolean;
}) {
  const chipMap = {
    under_review: {
      label: "قيد المراجعة",
      cls: "bg-status-pending/15 text-status-pending border-status-pending/30",
      Icon: Clock,
    },
    accepted: {
      label: "مقبول",
      cls: "bg-status-accepted/15 text-status-accepted border-status-accepted/30",
      Icon: CheckCircle2,
    },
    needs_modification: {
      label: "يحتاج تعديل",
      cls: "bg-status-modification/15 text-status-modification border-status-modification/30",
      Icon: TrendingUp,
    },
  } as const;
  const chip = chipMap[status];

  return (
    <li className={`flex items-center justify-between gap-3 p-4 ${highlight ? "bg-status-accepted/5" : ""}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          {type} · {time}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${chip.cls} shrink-0`}
      >
        <chip.Icon className="w-3 h-3" />
        {chip.label}
      </span>
    </li>
  );
}
