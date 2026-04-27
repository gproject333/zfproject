import Link from "next/link";
import {
  GraduationCap,
  ShieldAlert,
  Building2,
  Star,
  Sparkles,
} from "lucide-react";
import type { LoginVariant, LoginVariantConfig } from "../types/login-variants";

export const EMAIL_DOMAIN_SUGGESTIONS = ["std-zuj.edu.jo", "zuj.edu.jo"];

const STUDENT_CONFIG: LoginVariantConfig = {
  theme: "light",
  redirectTo: "/login-redirect",
  brand: {
    icon: <GraduationCap className="w-10 h-10 text-primary-foreground" />,
    iconBoxClassName: "bg-primary nb-border-thick rounded-2xl nb-shadow-lg",
    title: "حاضنة الزيتونة",
    subtitle: "منصة احتضان المشاريع الريادية",
  },
  pageClassName: "min-h-screen bg-pattern flex items-center justify-center p-4 relative overflow-hidden",
  decorations: (
    <>
      <div className="absolute top-10 right-10 w-20 h-20 bg-primary nb-border rounded-lg rotate-12 animate-float opacity-60 hidden md:block" />
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-secondary nb-border rounded-full animate-float opacity-50 hidden md:block" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 left-20 w-12 h-12 bg-accent nb-border rotate-45 animate-float opacity-40 hidden md:block" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-10 right-1/4 w-14 h-14 bg-warning nb-border rounded-lg -rotate-12 animate-float opacity-50 hidden md:block" style={{ animationDelay: "0.5s" }} />
      <div className="absolute inset-0 bg-dots opacity-[0.03]" />
    </>
  ),
  cardClassName: "nb-card p-8",
  titleBarLabel: "تسجيل الدخول",
  titleBarDots: [
    { background: "var(--destructive)" },
    { background: "var(--warning)" },
    { background: "var(--success)" },
  ],
  cardSubtitle: "أدخل بريدك الجامعي وكلمة المرور",
  inputClassName: "nb-input pr-12 !py-3",
  labelClassName: "block text-sm font-bold text-foreground",
  emailPlaceholder: "ahmed@std-zuj.edu.jo",
  passwordPlaceholder: "كلمة المرور",
  floatLabelBg: "var(--card)",
  floatLabelRestColor: "var(--muted-foreground)",
  floatLabelActiveColor: "var(--primary)",
  submitButtonClassName: "nb-btn nb-btn-primary w-full text-base",
  submitText: "تسجيل الدخول",
  footerNode: (
    <>
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-0.5 bg-foreground/10" />
        <span className="text-xs font-bold text-muted-foreground">أو</span>
        <div className="flex-1 h-0.5 bg-foreground/10" />
      </div>
      <Link href="/register" className="nb-btn nb-btn-outline w-full text-base">
        <Sparkles className="w-5 h-5" />
        إنشاء حساب جديد
      </Link>
    </>
  ),
};

const ADMIN_CONFIG: LoginVariantConfig = {
  theme: "dark",
  redirectTo: "/admin",
  brand: {
    icon: <ShieldAlert className="w-10 h-10 text-white" />,
    iconBoxStyle: { background: "#DC2626", border: "3px solid #991B1B", boxShadow: "6px 6px 0 #7F1D1D" },
    title: "لوحة الإدارة",
    subtitle: "دخول المشرفين العامين فقط",
    subtitleColor: "#FCA5A5",
    titleColor: "white",
  },
  pageStyle: { background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)" },
  pageClassName: "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
  decorations: (
    <>
      <div className="absolute inset-0 bg-dots opacity-[0.04]" />
      <div className="absolute top-10 left-10 w-24 h-24 rounded-lg rotate-12 animate-float opacity-20" style={{ background: "#DC2626", border: "2px solid #DC2626" }} />
      <div className="absolute bottom-16 right-16 w-16 h-16 rounded-full animate-float opacity-15" style={{ background: "#991B1B", border: "2px solid #7F1D1D", animationDelay: "1.2s" }} />
      <div className="absolute top-1/2 right-12 w-10 h-10 rotate-45 animate-float opacity-10" style={{ background: "#B91C1C", border: "2px solid #991B1B", animationDelay: "0.6s" }} />
    </>
  ),
  cardStyle: { background: "#1C1C1C", border: "3px solid #DC2626", boxShadow: "6px 6px 0 #7F1D1D" },
  cardClassName: "p-8 rounded-lg",
  cardBorderStyle: { borderBottom: "2px solid #333" },
  titleBarLabel: "تسجيل دخول — Admin",
  titleBarLabelColor: "white",
  titleBarDots: [
    { background: "#DC2626", border: "1px solid #991B1B" },
    { background: "#B45309", border: "1px solid #92400E" },
    { background: "#15803D", border: "1px solid #14532D" },
  ],
  inputStyle: { background: "#111", border: "2px solid #333", color: "white", borderRadius: "5px", padding: "0.75rem 3rem 0.75rem 1rem", width: "100%", fontFamily: "Tajawal, sans-serif" },
  inputIconColor: "#9CA3AF",
  labelClassName: "block text-sm font-bold text-white",
  emailPlaceholder: "admin@zuj.edu.jo",
  passwordPlaceholder: "كلمة مرور Admin",
  floatLabelBg: "#1C1C1C",
  floatLabelRestColor: "#9CA3AF",
  floatLabelActiveColor: "#FCA5A5",
  submitButtonStyle: { background: "#DC2626", color: "white", border: "2px solid #991B1B", boxShadow: "4px 4px 0 #7F1D1D", fontFamily: "Tajawal, sans-serif" },
  submitButtonClassName: "w-full flex items-center justify-center gap-2 font-bold text-base py-3 rounded-lg transition-all",
  submitText: "دخول لوحة الإدارة",
  submitHoverShadow: { from: "4px 4px 0 #7F1D1D", to: "2px 2px 0 #7F1D1D" },
  footerNode: <p className="text-center mt-4 text-xs" style={{ color: "#6B7280" }}>هذه الصفحة مخصصة لمشرفي النظام فقط</p>,
};

const SPONSOR_CONFIG: LoginVariantConfig = {
  theme: "dark",
  redirectTo: "/sponsor",
  brand: {
    icon: (
      <div className="relative">
        <Building2 className="w-10 h-10 text-white" />
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#1F5C2E", border: "2px solid #164520" }}>
          <Star className="w-3 h-3 text-white" fill="currentColor" />
        </div>
      </div>
    ),
    iconBoxStyle: { background: "#C9A227", border: "3px solid #B7891A", boxShadow: "6px 6px 0 #966E14" },
    title: "بوابة الرعاة",
    subtitle: "مرحباً بشركائنا في نجاح المشاريع",
    subtitleColor: "#FDE68A",
    titleColor: "white",
  },
  pageStyle: { background: "linear-gradient(135deg, #0a0d0a 0%, #0d1a0a 50%, #0a0d0a 100%)" },
  pageClassName: "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
  decorations: (
    <>
      <div className="absolute inset-0 bg-dots opacity-[0.04]" />
      <div className="absolute top-12 right-12 w-20 h-20 rounded-lg rotate-12 animate-float opacity-25" style={{ background: "#C9A227", border: "2px solid #B7891A" }} />
      <div className="absolute bottom-20 left-12 w-14 h-14 rounded-full animate-float opacity-20" style={{ background: "#1F5C2E", border: "2px solid #164520", animationDelay: "1s" }} />
      <div className="absolute top-2/3 right-20 w-8 h-8 rotate-45 animate-float opacity-15" style={{ background: "#C9A227", animationDelay: "0.7s" }} />
    </>
  ),
  cardStyle: { background: "#141a14", border: "3px solid #C9A227", boxShadow: "6px 6px 0 #966E14" },
  cardClassName: "p-8 rounded-lg",
  cardBorderStyle: { borderBottom: "2px solid #2a2a2a" },
  titleBarLabel: "تسجيل دخول — Sponsor",
  titleBarLabelColor: "white",
  titleBarDots: [
    { background: "#DC2626" },
    { background: "#C9A227" },
    { background: "#1F5C2E" },
  ],
  inputStyle: { background: "#0d0d0d", border: "2px solid #333", color: "white", borderRadius: "5px", padding: "0.75rem 3rem 0.75rem 1rem", width: "100%", fontFamily: "Tajawal, sans-serif" },
  inputIconColor: "#9CA3AF",
  labelClassName: "block text-sm font-bold text-white",
  emailPlaceholder: "sponsor@company.com",
  passwordPlaceholder: "كلمة مرور الراعي",
  floatLabelBg: "#141a14",
  floatLabelRestColor: "#9CA3AF",
  floatLabelActiveColor: "#FDE68A",
  submitButtonStyle: { background: "#C9A227", color: "#111", border: "2px solid #B7891A", boxShadow: "4px 4px 0 #966E14", fontFamily: "Tajawal, sans-serif" },
  submitButtonClassName: "w-full flex items-center justify-center gap-2 font-bold text-base py-3 rounded-lg transition-all",
  submitText: "الدخول إلى البوابة",
  submitHoverShadow: { from: "4px 4px 0 #966E14", to: "2px 2px 0 #966E14" },
  footerNode: <p className="text-center mt-4 text-xs" style={{ color: "#6B7280" }}>حسابك أنشأه فريق حاضنة الزيتونة — تواصل معهم لأي مساعدة</p>,
};

export const LOGIN_VARIANTS: Record<LoginVariant, LoginVariantConfig> = {
  student: STUDENT_CONFIG,
  admin: ADMIN_CONFIG,
  sponsor: SPONSOR_CONFIG,
};
