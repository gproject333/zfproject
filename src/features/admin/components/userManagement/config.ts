import { Users, Building2, ShieldCheck, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ColorScheme {
  primary: string;
  border: string;
  textOnPrimary: string;
}

export interface UserManagementConfig {
  role: "supervisor" | "sponsor";
  pageTitle: string;
  pageIcon: LucideIcon;
  formIcon: LucideIcon;
  countLabel: (n: number) => string;
  emptyTitle: string;
  emptyDescription: string;
  addButtonLabel: string;
  formTitle: string;
  color: ColorScheme;
  nameField: { label: string; placeholder: string };
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  showDepartment: boolean;
  formHint: { text: string; bg: string; border: string; color: string };
  successMessage: string;
  fallbackInitial: string;
  /** Hide the create form (e.g. when supervisors are added via upgrade requests only). */
  hideAddForm?: boolean;
  /** Show the password field in the create form. */
  showPasswordField?: boolean;
}

export const SUPERVISOR_CONFIG: UserManagementConfig = {
  role: "supervisor",
  pageTitle: "إدارة المشرفين الأكاديميين",
  pageIcon: Users,
  formIcon: ShieldCheck,
  countLabel: (n) => `${n} مشرف مسجل`,
  emptyTitle: "لا يوجد مشرفون",
  emptyDescription: "ابدأ بإضافة أول مشرف للمنصة",
  addButtonLabel: "إضافة مشرف جديد",
  formTitle: "بيانات المشرف الجديد",
  color: { primary: "#2D7A3E", border: "#1F5C2E", textOnPrimary: "white" },
  nameField: { label: "الاسم الكامل *", placeholder: "د. أحمد محمد" },
  emailPlaceholder: "supervisor@zuj.edu.jo",
  phoneLabel: "رقم الهاتف",
  phonePlaceholder: "07X-XXX-XXXX",
  showDepartment: true,
  showPasswordField: true,
  formHint: {
    text: "💡 سيستخدم المشرف هذا البريد وكلمة المرور لتسجيل الدخول عبر صفحة /login",
    bg: "bg-info/10",
    border: "border-info/30",
    color: "text-info",
  },
  successMessage: "تم إنشاء حساب المشرف بنجاح!",
  fallbackInitial: "م",
};

export const SPONSOR_CONFIG: UserManagementConfig = {
  role: "sponsor",
  pageTitle: "إدارة الداعمين",
  pageIcon: Building2,
  formIcon: Star,
  countLabel: (n) => `${n} داعم مسجل`,
  emptyTitle: "لا يوجد داعمون",
  emptyDescription: "ابدأ بإضافة أول داعم للمنصة",
  addButtonLabel: "إضافة داعم جديد",
  formTitle: "بيانات الداعم الجديد",
  color: { primary: "#C9A227", border: "#B7891A", textOnPrimary: "#111" },
  nameField: { label: "الاسم *", placeholder: "شركة التقنية الأردنية" },
  emailPlaceholder: "sponsor@company.com",
  phoneLabel: "رقم الهاتف *",
  phonePlaceholder: "07XXXXXXXX",
  showDepartment: false,
  showPasswordField: true,
  formHint: {
    text: "💡 سيستخدم الداعم هذا البريد وكلمة المرور لتسجيل الدخول عبر صفحة /login",
    bg: "bg-warning/10",
    border: "border-warning/30",
    color: "text-warning",
  },
  successMessage: "تم إنشاء حساب الداعم بنجاح!",
  fallbackInitial: "د",
};
