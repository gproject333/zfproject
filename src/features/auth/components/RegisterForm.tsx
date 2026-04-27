"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  User,
  Hash,
  Building2,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import {
  FloatingTextInput,
  FloatingEmailInput,
  FloatingPasswordInput,
  FloatingSelectInput,
} from "./FloatingFields";
import { COLLEGES, DEPARTMENTS } from "@/lib/configs/university";

export default function RegisterForm() {
  const router = useRouter();
  const form = useRegisterForm();
  const { formData, errors, loading, step } = form;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await form.submit((email) => {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    });
  };

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-16 left-16 w-24 h-24 bg-secondary nb-border rounded-xl -rotate-6 animate-float opacity-50 hidden md:block" />
      <div className="absolute bottom-16 right-16 w-16 h-16 bg-accent nb-border rounded-full animate-float opacity-40 hidden md:block" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 right-12 w-10 h-10 bg-primary nb-border rotate-45 animate-float opacity-50 hidden md:block" style={{ animationDelay: "0.7s" }} />
      <div className="absolute inset-0 bg-dots opacity-[0.03]" />

      <div className="w-full max-w-lg animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary nb-border-thick rounded-2xl nb-shadow-lg mb-4 mx-auto">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground font-medium">سجّل بإيميلك الجامعي وابدأ رحلة الريادة</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 nb-border rounded-full text-xs font-bold ${step === 1 ? "bg-primary nb-shadow-sm" : "bg-success/20"}`}>
            {step > 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-foreground text-card flex items-center justify-center text-[10px]">1</span>
            )}
            البيانات
          </div>
          <div className="w-8 h-0.5 bg-foreground/20" />
          <div className={`flex items-center gap-2 px-3 py-1.5 nb-border rounded-full text-xs font-bold ${step === 2 ? "bg-primary nb-shadow-sm" : "bg-muted"}`}>
            <span className="w-4 h-4 rounded-full bg-foreground text-card flex items-center justify-center text-[10px]">2</span>
            الأمان والقسم
          </div>
        </div>

        <div className="nb-card p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-foreground">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive nb-border" />
              <span className="w-3 h-3 rounded-full bg-warning nb-border" />
              <span className="w-3 h-3 rounded-full bg-success nb-border" />
            </div>
            <span className="font-bold text-sm mr-2">{step === 1 ? "البيانات الأساسية" : "الأمان والقسم"}</span>
          </div>

          {errors.form && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg mb-5">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm font-semibold text-destructive">{errors.form}</p>
            </div>
          )}

          <div id="clerk-captcha" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <FloatingTextInput
                  id="register-name"
                  label="الاسم الكامل"
                  value={formData.name}
                  onChange={(val) => form.updateField("name", val)}
                  error={errors.name}
                  icon={<User className="w-5 h-5" />}
                  required
                  autoComplete="name"
                />

                <FloatingEmailInput
                  id="register-email"
                  label="البريد الإلكتروني الجامعي"
                  value={formData.email}
                  onChange={(val) => form.updateField("email", val)}
                  error={errors.email}
                  required
                />

                <FloatingTextInput
                  id="register-studentId"
                  label="الرقم الجامعي"
                  value={formData.studentId}
                  onChange={(val) => form.updateField("studentId", val)}
                  error={errors.studentId}
                  icon={<Hash className="w-5 h-5" />}
                  required
                  maxLength={9}
                  inputMode="numeric"
                  dir="ltr"
                  autoComplete="off"
                />

                <button type="button" onClick={form.goToStep2IfValid} className="nb-btn nb-btn-primary w-full text-base">
                  التالي <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <FloatingSelectInput
                  id="register-college"
                  label="الكلية"
                  value={formData.college}
                  onChange={(val) => form.updateField("college", val)}
                  error={errors.college}
                  icon={<Building2 className="w-5 h-5" />}
                  options={[...COLLEGES]}
                  placeholderOption="اختر الكلية..."
                  required
                />

                <FloatingSelectInput
                  id="register-department"
                  label="التخصص"
                  value={formData.department}
                  onChange={(val) => form.updateField("department", val)}
                  error={errors.department}
                  icon={<Building2 className="w-5 h-5" />}
                  options={formData.college ? (DEPARTMENTS[formData.college] ?? []) : []}
                  placeholderOption={formData.college ? "اختر التخصص..." : "اختر الكلية أولاً"}
                  required
                />

                <FloatingPasswordInput
                  id="register-password"
                  label="كلمة المرور"
                  value={formData.password}
                  onChange={(val) => form.updateField("password", val)}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                />

                <FloatingPasswordInput
                  id="register-confirmPassword"
                  label="تأكيد كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={(val) => form.updateField("confirmPassword", val)}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  showEye={false}
                />

                <div className="flex gap-3">
                  <button type="button" onClick={form.goToStep1} className="nb-btn nb-btn-outline flex-1">
                    <ArrowRight className="w-5 h-5" /> رجوع
                  </button>
                  <button type="submit" disabled={loading} className="nb-btn nb-btn-primary flex-[2] text-base">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        إنشاء الحساب
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-bold text-primary hover:text-accent underline underline-offset-4 transition-colors inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
