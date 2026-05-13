import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui";
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
  submitButtonClassName: buttonVariants({ variant: "primary", fullWidth: true }),
  submitText: "تسجيل الدخول",
  footerNode: (
    <>
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-0.5 bg-foreground/10" />
        <span className="text-xs font-bold text-muted-foreground">أو</span>
        <div className="flex-1 h-0.5 bg-foreground/10" />
      </div>
      <Link href="/register" className={buttonVariants({ variant: "outline", fullWidth: true })}>
        <Sparkles className="w-5 h-5" />
        إنشاء حساب جديد
      </Link>
    </>
  ),
};

export const LOGIN_VARIANTS: Record<LoginVariant, LoginVariantConfig> = {
  student: STUDENT_CONFIG,
};
