"use client";

import { useRouter } from "next/navigation";
import {
  Lightbulb,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
  Code2,
  Rocket,
} from "lucide-react";

const INCUBATION_TYPES = [
  {
    id: "entrepreneurial_idea",
    title: "فكرة ريادية",
    subtitle: "احتضان فكرة ريادية مبتكرة",
    description:
      "لديك فكرة مشروع ريادي مبتكر وتريد تحويلها إلى واقع؟ قدّم فكرتك مع أهداف المشروع ونوعه.",
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
    title: "مشروع IT",
    subtitle: "مشروع في تكنولوجيا المعلومات",
    description:
      "مشروع IT يحتاج دعم وإرشاد؟ قدّم مشروعك مع التقنيات المستخدمة والمشرف الأكاديمي.",
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
    title: "مشروع ريادي للجامعة",
    subtitle: "مشروع يخدم الجامعة بشكل مباشر",
    description:
      "فكرة مشروع يفيد الجامعة مباشرة ويحتاج دعماً مؤسسياً؟ قدّم مشروعك مع تحديد الفائدة والمكان المستهدف.",
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.push("/student")}
            aria-label="رجوع"
            className="w-10 h-10 ds-border rounded-lg flex items-center justify-center bg-card ds-shadow-hover"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="w-6 h-6 text-accent" />
              اختر نوع برنامج الاحتضان
            </h2>

          </div>
        </div>
      </div>

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
              ابدأ التقديم
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
