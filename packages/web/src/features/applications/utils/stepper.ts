import {
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { ApplicationStatus } from "../../../../convex/lib/statuses";

export type StepState = "done" | "current" | "upcoming";

export interface StepperStep {
  key: string;
  label: string;
  icon: LucideIcon;
  state: StepState;
  bg: string;
  labelClass: string;
}

const DEFAULT_BG = "bg-accent";
const DEFAULT_LABEL = "text-accent";

/**
 * Maps an application status to its three-phase visual progression:
 * تقديم → مراجعة → قرار. Returned steps reference Tailwind utility
 * classes defined in globals.css; the component is a pure renderer.
 */
export function buildStepperSteps(status: ApplicationStatus): StepperStep[] {
  const submitted: StepperStep = {
    key: "submitted",
    label: "تم التقديم",
    icon: Send,
    state: "done",
    bg: DEFAULT_BG,
    labelClass: DEFAULT_LABEL,
  };

  if (status === "draft") {
    return [
      { ...submitted, state: "current", label: "مسودة", bg: "bg-muted", labelClass: "text-foreground" },
      { key: "review", label: "قيد المراجعة", icon: Eye, state: "upcoming", bg: DEFAULT_BG, labelClass: DEFAULT_LABEL },
      { key: "decision", label: "القرار", icon: CheckCircle2, state: "upcoming", bg: DEFAULT_BG, labelClass: DEFAULT_LABEL },
    ];
  }

  if (status === "under_review") {
    return [
      submitted,
      { key: "review", label: "قيد المراجعة", icon: Eye, state: "current", bg: "bg-status-review", labelClass: "text-status-review" },
      { key: "decision", label: "بانتظار القرار", icon: CheckCircle2, state: "upcoming", bg: DEFAULT_BG, labelClass: DEFAULT_LABEL },
    ];
  }

  if (status === "needs_modification") {
    return [
      submitted,
      { key: "review", label: "تمت المراجعة", icon: Eye, state: "done", bg: DEFAULT_BG, labelClass: DEFAULT_LABEL },
      { key: "decision", label: "يحتاج تعديل", icon: AlertTriangle, state: "current", bg: "bg-status-modification", labelClass: "text-status-modification" },
    ];
  }

  if (status === "accepted") {
    return [
      submitted,
      { key: "review", label: "تمت المراجعة", icon: Eye, state: "done", bg: DEFAULT_BG, labelClass: DEFAULT_LABEL },
      { key: "decision", label: "مقبول", icon: CheckCircle2, state: "current", bg: "bg-status-accepted", labelClass: "text-status-accepted" },
    ];
  }

  return [
    submitted,
    { key: "review", label: "تمت المراجعة", icon: Eye, state: "done", bg: DEFAULT_BG, labelClass: DEFAULT_LABEL },
    { key: "decision", label: "مرفوض", icon: XCircle, state: "current", bg: "bg-status-rejected", labelClass: "text-status-rejected" },
  ];
}
