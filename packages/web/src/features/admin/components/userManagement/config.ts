import { Users, Building2, ShieldCheck, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ColorScheme {
  primary: string;
  border: string;
  textOnPrimary: string;
}

export interface UserManagementConfig {
  role: "supervisor" | "sponsor" | "admin";
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
  countLabel: (n) => `${n} مشرف مسجَّل`,
  emptyTitle: "لا يوجد مشرفون",
  emptyDescription: "يُرجى إضافة أول مشرف إلى المنصة.",
  addButtonLabel: "إضافة مشرف جديد",
  formTitle: "بيانات المشرف الجديد",
  // CSS variables resolve through the theme system, so theme switching
  // (light/dark) works without rewriting these values.
  color: {
    primary: "var(--accent)",
    border: "var(--primary)",
    textOnPrimary: "var(--accent-foreground)",
  },
  nameField: { label: "الاسم الكامل *", placeholder: "مثال: د. أحمد محمد" },
  emailPlaceholder: "supervisor@zuj.edu.jo",
  phoneLabel: "رقم الهاتف",
  phonePlaceholder: "07X-XXX-XXXX",
  showDepartment: true,
  showPasswordField: true,
  formHint: {
    text: "يستخدم المشرف هذا البريد الإلكتروني وكلمة المرور لتسجيل الدخول عبر صفحة /login.",
    bg: "bg-info/10",
    border: "border-info/30",
    color: "text-info",
  },
  successMessage: "تم إنشاء حساب المشرف بنجاح.",
  fallbackInitial: "م",
};

export const SPONSOR_CONFIG: UserManagementConfig = {
  role: "sponsor",
  pageTitle: "إدارة الداعمين",
  pageIcon: Building2,
  formIcon: Star,
  countLabel: (n) => `${n} داعم مسجَّل`,
  emptyTitle: "لا يوجد داعمون",
  emptyDescription: "يُرجى إضافة أول داعم إلى المنصة.",
  addButtonLabel: "إضافة داعم جديد",
  formTitle: "بيانات الداعم الجديد",
  // Sponsor gold token + darker gold token (--secondary-border) for the
  // legible edge on filled buttons. See DESIGN.md "Sponsor-Only Gold Rule".
  color: {
    primary: "var(--secondary)",
    border: "var(--secondary-border)",
    textOnPrimary: "var(--secondary-foreground)",
  },
  nameField: { label: "الاسم *", placeholder: "مثال: شركة التقنية الأردنية" },
  emailPlaceholder: "sponsor@company.com",
  phoneLabel: "رقم الهاتف *",
  phonePlaceholder: "07XXXXXXXX",
  showDepartment: false,
  showPasswordField: true,
  formHint: {
    text: "يستخدم الداعم هذا البريد الإلكتروني وكلمة المرور لتسجيل الدخول عبر صفحة /login.",
    bg: "bg-warning/10",
    border: "border-warning/30",
    color: "text-warning",
  },
  successMessage: "تم إنشاء حساب الداعم بنجاح.",
  fallbackInitial: "د",
};

export const ADMIN_CONFIG: UserManagementConfig = {
  role: "admin",
  pageTitle: "إدارة المدراء",
  pageIcon: ShieldCheck,
  formIcon: ShieldCheck,
  countLabel: (n) => `${n} مدير مسجَّل`,
  emptyTitle: "لا يوجد مدراء",
  emptyDescription: "لا توجد حسابات مدراء لعرضها.",
  addButtonLabel: "إضافة مدير",
  formTitle: "بيانات المدير",
  color: {
    primary: "var(--primary)",
    border: "var(--primary)",
    textOnPrimary: "var(--primary-foreground)",
  },
  nameField: { label: "الاسم الكامل *", placeholder: "اسم المدير" },
  emailPlaceholder: "admin@zuj.edu.jo",
  phoneLabel: "رقم الهاتف",
  phonePlaceholder: "07XXXXXXXX",
  showDepartment: false,
  // Admin accounts are provisioned out-of-band, not created from this page.
  hideAddForm: true,
  formHint: {
    text: "",
    bg: "bg-info/10",
    border: "border-info/30",
    color: "text-info",
  },
  successMessage: "",
  fallbackInitial: "أ",
};
