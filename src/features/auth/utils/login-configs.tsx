import {
  GraduationCap,
  Crown,
  Building2,
  Star,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui";
import type { LoginVariant, LoginVariantConfig } from "../types/login-variants";

export const EMAIL_DOMAIN_SUGGESTIONS = ["std-zuj.edu.jo", "zuj.edu.jo"];

/**
 * Sponsor's submit button is the only place in the product surface that
 * uses warm gold (DESIGN.md Sponsor-Only Gold Rule). HeroUI's default
 * `variant="primary"` resolves to olive; we hand-roll a gold equivalent
 * here rather than introduce a global `variant="secondary"` that would
 * leak gold into other personas' surfaces.
 */
const SPONSOR_SUBMIT_CLASSES =
  "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-bold " +
  "bg-secondary text-secondary-foreground border border-[var(--secondary-border)] " +
  "ds-shadow-sm transition-colors duration-200 " +
  "hover:bg-secondary/90 disabled:opacity-60 disabled:cursor-not-allowed";

const STUDENT_CONFIG: LoginVariantConfig = {
  redirectTo: "/login-redirect",
  brand: {
    icon: <GraduationCap className="w-9 h-9 text-primary-foreground" />,
    iconBgClass: "bg-primary",
    title: "حاضنة الزيتونة",
    subtitle: "منصة احتضان المشاريع الريادية في الجامعة",
  },
  emailPlaceholder: "ahmed@std-zuj.edu.jo",
  passwordPlaceholder: "كلمة المرور",
  submitText: "تسجيل الدخول",
  submitButtonClass: buttonVariants({ variant: "primary", fullWidth: true }),
  showStudentLinks: true,
};

const SUPERVISOR_CONFIG: LoginVariantConfig = {
  redirectTo: "/login-redirect",
  brand: {
    icon: <ShieldCheck className="w-9 h-9 text-primary-foreground" />,
    iconBgClass: "bg-primary",
    title: "بوابة المشرفين",
    subtitle: "دخول المشرفين الأكاديميين",
  },
  emailPlaceholder: "supervisor@zuj.edu.jo",
  passwordPlaceholder: "كلمة مرور المشرف",
  submitText: "دخول لوحة المشرف",
  submitButtonClass: buttonVariants({ variant: "primary", fullWidth: true }),
  footerNote: "حسابك أنشأه فريق حاضنة الزيتونة — تواصل معهم لأي مساعدة",
};

const ADMIN_CONFIG: LoginVariantConfig = {
  redirectTo: "/login-redirect",
  brand: {
    icon: <Crown className="w-9 h-9 text-accent-foreground" />,
    iconBgClass: "bg-accent",
    title: "لوحة الإدارة",
    subtitle: "دخول مشرفي النظام",
  },
  emailPlaceholder: "admin@zuj.edu.jo",
  passwordPlaceholder: "كلمة مرور Admin",
  submitText: "دخول لوحة الإدارة",
  submitButtonClass: buttonVariants({ variant: "primary", fullWidth: true }),
  footerNote: "هذه الصفحة مخصّصة لمشرفي النظام فقط",
};

const SPONSOR_CONFIG: LoginVariantConfig = {
  redirectTo: "/login-redirect",
  brand: {
    icon: (
      <div className="relative">
        <Building2 className="w-9 h-9 text-secondary-foreground" />
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center bg-primary border border-primary/70">
          <Star className="w-2.5 h-2.5 text-white" fill="currentColor" />
        </div>
      </div>
    ),
    iconBgClass: "bg-secondary",
    title: "بوابة الرعاة",
    subtitle: "مرحباً بشركائنا في نجاح المشاريع",
  },
  emailPlaceholder: "sponsor@company.com",
  passwordPlaceholder: "كلمة مرور الراعي",
  submitText: "الدخول إلى البوابة",
  submitButtonClass: SPONSOR_SUBMIT_CLASSES,
  footerNote: "حسابك أنشأه فريق حاضنة الزيتونة — تواصل معهم لأي مساعدة",
};

export const LOGIN_VARIANTS: Record<LoginVariant, LoginVariantConfig> = {
  student: STUDENT_CONFIG,
  admin: ADMIN_CONFIG,
  sponsor: SPONSOR_CONFIG,
  supervisor: SUPERVISOR_CONFIG,
};
