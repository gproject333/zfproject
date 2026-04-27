import {
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Code2,
  Building2,
} from "lucide-react";
import { STATUS_LABELS } from "../../../convex/lib/statuses";

export const STATUS_CONFIG = {
  draft: {
    label: STATUS_LABELS.draft,
    bg: "bg-muted",
    text: "text-foreground",
    icon: FileText,
    cssVar: "--muted",
  },
  under_review: {
    label: STATUS_LABELS.under_review,
    bg: "bg-status-pending",
    text: "text-foreground",
    icon: Eye,
    cssVar: "--status-pending",
  },
  needs_modification: {
    label: STATUS_LABELS.needs_modification,
    bg: "bg-status-modification",
    text: "text-white",
    icon: AlertTriangle,
    cssVar: "--status-modification",
  },
  accepted: {
    label: STATUS_LABELS.accepted,
    bg: "bg-success",
    text: "text-foreground",
    icon: CheckCircle2,
    cssVar: "--success",
  },
  rejected: {
    label: STATUS_LABELS.rejected,
    bg: "bg-destructive",
    text: "text-white",
    icon: XCircle,
    cssVar: "--destructive",
  },
} as const;

export type SupervisorRating = "excellent" | "good" | "average" | "poor";

export const RATING_CONFIG: Record<
  SupervisorRating,
  { label: string; selectLabel: string }
> = {
  excellent: { label: "ممتاز", selectLabel: "ممتاز ⭐⭐⭐" },
  good: { label: "جيد", selectLabel: "جيد ⭐⭐" },
  average: { label: "متوسط", selectLabel: "متوسط ⭐" },
  poor: { label: "ضعيف", selectLabel: "ضعيف" },
};

export const RATING_KEYS: readonly SupervisorRating[] = [
  "excellent",
  "good",
  "average",
  "poor",
];

export const TYPE_CONFIG = {
  entrepreneurial_idea: {
    label: "فكرة ريادية",
    icon: Lightbulb,
    color: "text-primary",
    bgColor: "bg-primary",
    formTitle: "نموذج فكرة ريادية",
    formSubtitle: "أدخل تفاصيل فكرتك الريادية المبتكرة",
  },
  it_graduation: {
    label: "مشروع IT",
    icon: Code2,
    color: "text-secondary",
    bgColor: "bg-secondary",
    formTitle: "نموذج مشروع IT",
    formSubtitle: "أدخل تفاصيل مشروع IT",
  },
  university_entrepreneurial: {
    label: "مشروع ريادي للجامعة",
    icon: Building2,
    color: "text-accent",
    bgColor: "bg-accent",
    formTitle: "نموذج مشروع ريادي للجامعة",
    formSubtitle: "أدخل تفاصيل المشروع الريادي الذي يخدم الجامعة",
  },
} as const;

export const FORM_EXTRA_FIELDS = {
  entrepreneurial_idea: [
    { name: "projectGoals", label: "أهداف المشروع", type: "textarea" as const, options: [] as readonly string[], placeholder: "ما الأهداف التي يسعى المشروع لتحقيقها؟", required: true, hint: "النتائج التي يسعى المشروع لتحقيقها على المدى القصير والبعيد" },
    { name: "phone", label: "رقم الهاتف", type: "text" as const, options: [] as readonly string[], placeholder: "07XXXXXXXX", required: true, hint: "" },
    { name: "projectCategory", label: "نوع المشروع", type: "select" as const, options: ["تجاري", "هندسي", "تقني", "أخرى"] as readonly string[], placeholder: "", required: true, hint: "اختر التصنيف الأقرب لطبيعة المشروع" },
  ],
  it_graduation: [
    { name: "supervisor", label: "اسم المشرف الأكاديمي", type: "text" as const, options: [] as readonly string[], placeholder: "د. أحمد ...", required: true, hint: "اسم عضو هيئة التدريس الذي يشرف على المشروع" },
    { name: "projectGoals", label: "الأهداف", type: "textarea" as const, options: [] as readonly string[], placeholder: "ما الأهداف التي يسعى المشروع لتحقيقها؟", required: true, hint: "النتائج التي يسعى المشروع لتحقيقها تقنياً ووظيفياً" },
    { name: "phone", label: "رقم الهاتف", type: "text" as const, options: [] as readonly string[], placeholder: "07XXXXXXXX", required: true, hint: "" },
    { name: "projectCategory", label: "نوع المشروع", type: "multiselect" as const, options: ["Web", "Mobile", "Desktop"] as readonly string[], placeholder: "", required: true, hint: "اختر واحداً أو أكثر — يمكن أن يكون المشروع ويب + موبايل مثلاً" },
  ],
  university_entrepreneurial: [
    { name: "universityBenefit", label: "الفائدة للجامعة", type: "textarea" as const, options: [] as readonly string[], placeholder: "كيف سيستفيد من المشروع الجامعة وطلابها؟", required: true, hint: "اشرح كيف يخدم المشروع الجامعة، طلابها، أو مجتمعها بشكل مباشر" },
    { name: "targetLocation", label: "المكان المستهدف", type: "text" as const, options: [] as readonly string[], placeholder: "أين سيُنفذ المشروع؟", required: true, hint: "الموقع الفعلي لتنفيذ المشروع (مبنى، كلية، قسم، إلخ)" },
    { name: "projectCategory", label: "نوع المشروع", type: "select" as const, options: ["ترفيهي", "تجاري", "خدمات لوجستية"] as readonly string[], placeholder: "", required: true, hint: "اختر التصنيف الأقرب لطبيعة المشروع" },
    { name: "phone", label: "رقم الهاتف", type: "text" as const, options: [] as readonly string[], placeholder: "07XXXXXXXX", required: true, hint: "" },
  ],
} as const;

