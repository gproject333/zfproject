"use client";

import {
  Send,
  Lightbulb,
  FileText,
  GraduationCap,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { FeatureSection, MockupFrame, MockupHeader } from "../index";

/* ─────────────────────── Showcase 1: Submit ─────────────────────── */

export function SubmitShowcase({ ctaHref }: { ctaHref: string }) {
  return (
    <FeatureSection
      headline="تقديم المشروع"
      highlight="إلكترونيًّا"
      description="يُتيح النظام تعبئة نموذج رقمي وفق نوع المشروع وإحالته مباشرة إلى المشرف الأكاديمي المختص، دون الحاجة إلى أي إجراءات ورقية."
      bullets={[
        { icon: Lightbulb, label: "ثلاثة مسارات: فكرة ريادية، مشروع تخرج (IT)، أو مشروع يخدم الجامعة" },
        { icon: FileText, label: "نموذج تقديم متغيِّر الحقول وفق نوع المشروع" },
        { icon: Send, label: "إمكانية إرفاق المستندات والوسائط الداعمة للطلب" },
      ]}
      cta="تقديم الطلب"
      ctaHref={ctaHref}
      mockupSide="right"
      mockup={<SubmitMockup />}
    />
  );
}

function SubmitMockup() {
  return (
    <MockupFrame>
      <MockupHeader title="طلب احتضان جديد" subtitle="تعبئة بيانات الطلب وإحالته للمراجعة" />
      <div className="p-6 space-y-5">
        <div>
          <div className="text-xs font-bold text-foreground/65 mb-2">نوع المشروع</div>
          <div className="grid grid-cols-3 gap-2">
            <TypeChip icon={Lightbulb} label="فكرة ريادية" desc="مشروع تجاري" active />
            <TypeChip icon={FileText} label="مشروع تخرج (IT)" desc="مشروع تقني" />
            <TypeChip icon={GraduationCap} label="يخدم الجامعة" desc="مشروع تطبيقي" />
          </div>
        </div>
        <MockField label="اسم المشروع" value="نظام إدارة المخزون الذكي" />
        <MockTextarea
          label="وصف المشروع"
          value="نظام رقمي لإدارة المخزون يعتمد على تقنيات التتبع الذكي لتحسين كفاءة سلاسل التوريد في المنشآت الصغيرة والمتوسطة..."
        />
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-xs font-bold text-muted-foreground">المرحلة ١ من ٣</span>
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-bold text-sm">
            متابعة
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ─────────────────────── Mockup primitives ─────────────────────── */

function TypeChip({
  icon: Icon,
  label,
  desc,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/40 text-foreground/70 ds-border"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-bold">{label}</span>
      <span className={`text-[9px] font-medium ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {desc}
      </span>
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-foreground/65 mb-1.5">{label}</div>
      <div className="ds-input !py-2.5 text-sm text-foreground bg-card font-medium truncate">{value}</div>
    </div>
  );
}

function MockTextarea({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-foreground/65 mb-1.5">{label}</div>
      <div className="ds-input !py-3 text-sm text-foreground bg-card font-medium leading-relaxed line-clamp-3">
        {value}
      </div>
    </div>
  );
}
