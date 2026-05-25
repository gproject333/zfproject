"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
  Code2,
  Rocket,
  HelpCircle,
  Check,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

const INCUBATION_TYPES = [
  {
    id: "entrepreneurial_idea",
    title: "فكرة ريادية",
    subtitle: "احتضان فكرة ريادية مبتكرة.",
    description:
      "لتقديم فكرة مشروع ريادي وتحويلها إلى مشروع قائم، يُرجى تضمين أهداف المشروع ونوعه.",
    icon: Lightbulb,
    color: "text-primary",
    borderColor: "hover:border-primary",
    features: [
      "أهداف المشروع",
      "نوع المشروع",
      "فريق العمل",
      "معلومات التواصل",
    ],
  },
  {
    id: "it_graduation",
    title: "مشروع تخرج (IT)",
    subtitle: "مشروع في تكنولوجيا المعلومات.",
    description:
      "لتقديم مشروع في تكنولوجيا المعلومات، يُرجى تضمين التقنيات المستخدمة واسم المشرف الأكاديمي.",
    icon: Code2,
    color: "text-secondary",
    borderColor: "hover:border-secondary",
    features: [
      "المشرف الأكاديمي",
      "نوع المشروع (Web / Mobile / Desktop)",
      "أهداف المشروع",
      "فريق العمل",
    ],
  },
  {
    id: "university_entrepreneurial",
    title: "مشروع يخدم الجامعة",
    subtitle: "مشروع يخدم الجامعة بصورة مباشرة.",
    description:
      "لتقديم مشروع يخدم الجامعة بصورة مباشرة ويحتاج إلى دعم مؤسسي، يُرجى تحديد الفائدة المرجوة والمكان المستهدف.",
    icon: Building2,
    color: "text-accent",
    borderColor: "hover:border-accent",
    features: [
      "الفائدة المباشرة للجامعة",
      "المكان المستهدف",
      "نوع المشروع",
      "خطة التنفيذ",
    ],
  },
];

/**
 * Type selector for creating a new application. Shown at /student/new.
 * Displays 3 incubation types as clickable cards and navigates to
 * /student/new/[type] on selection.
 */
export default function TypeSelector() {
  const router = useRouter();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push("/student")}
          aria-label="العودة"
          className="w-10 h-10 ds-border rounded-lg flex items-center justify-center bg-card ds-shadow-hover"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="w-6 h-6 text-accent" />
          اختيار نوع برنامج الاحتضان
        </h2>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="ms-auto inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-2 hover:bg-primary/15 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          أي نوع يناسب مشروعي؟
        </button>
      </div>

      <ChooseGuideDialog open={showGuide} onOpenChange={setShowGuide} />


      {/* Type Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {INCUBATION_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => router.push(`/student/new/${type.id}`)}
            className={`ds-card-interactive p-6 text-right group ${type.borderColor}`}
          >
            {/* Icon */}
            <div className="mb-5">
              <div className="w-16 h-16 bg-muted ds-border rounded-xl flex items-center justify-center">
                <type.icon className={`w-8 h-8 ${type.color}`} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mb-1">{type.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{type.subtitle}</p>

            {/* Description */}
            <p className="text-sm text-foreground/80 leading-relaxed mb-5">{type.description}</p>

            {/* Features */}
            <div className="space-y-2 mb-6">
              {type.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-foreground/70"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-colors group-hover:bg-foreground group-hover:text-card">
              <GraduationCap className="w-5 h-5" />
              بدء التقديم
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Comparison dialog to help a confused student pick the right track. */
function ChooseGuideDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const rows: { label: string; values: [string, string, string] }[] = [
    {
      label: "يناسبك في حال:",
      values: [
        "وجود فكرة تجارية مبتكرة يُراد تحويلها إلى مشروع.",
        "العمل على مشروع تخرج تقني.",
        "الرغبة في معالجة مشكلة تخص الجامعة.",
      ],
    },
    {
      label: "أمثلة",
      values: ["تطبيق توصيل أو منصّة تعليمية.", "موقع أو تطبيق أو نظام.", "نظام لإدارة فعالية أو مرفق جامعي."],
    },
    {
      label: "حقول إضافية",
      values: ["الأهداف وفئة المشروع.", "المشرف الأكاديمي والتقنيات.", "الفائدة للجامعة والمكان."],
    },
  ];

  const tracks = [
    { title: "فكرة ريادية", icon: Lightbulb, color: "text-primary", bg: "bg-primary/12" },
    { title: "مشروع تخرج (IT)", icon: Code2, color: "text-secondary", bg: "bg-secondary/15" },
    { title: "مشروع يخدم الجامعة", icon: Building2, color: "text-accent", bg: "bg-accent/12" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="ما الفرق بين الأنواع الثلاثة؟" className="max-w-3xl">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            يُرجى اختيار النوع الأنسب للمشروع. يمكن تعديل الاختيار قبل التقديم النهائي.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {tracks.map((t) => (
              <div key={t.title} className="text-center space-y-2">
                <div
                  className={`w-12 h-12 mx-auto rounded-xl ${t.bg} ${t.color} flex items-center justify-center`}
                >
                  <t.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-extrabold">{t.title}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-foreground/[0.08] overflow-hidden">
            {rows.map((row, ri) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 ${ri > 0 ? "border-t border-foreground/[0.06]" : ""}`}
              >
                {row.values.map((v, ci) => (
                  <div
                    key={ci}
                    className={`p-3 text-xs font-semibold ${ci > 0 ? "border-s border-foreground/[0.06]" : ""}`}
                  >
                    <p className="text-[10px] text-muted-foreground font-bold mb-1.5 uppercase tracking-wide">
                      {row.label}
                    </p>
                    <p className="text-foreground/85 leading-relaxed flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground font-medium text-center pt-2">
            في حال عدم التيقُّن من النوع، يمكن البدء بالأقرب وحفظ المسودة وتعديل النوع لاحقًا.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
