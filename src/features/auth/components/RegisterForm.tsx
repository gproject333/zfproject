"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {GraduationCap, User, Hash, Building2, UserPlus, ArrowRight, AlertCircle, CheckCircle2, Sparkles, ShieldCheck} from "lucide-react";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import {
  FloatingTextInput,
  FloatingEmailInput,
  FloatingPasswordInput,
  FloatingSelectInput,
} from "./FloatingFields";
import { Button, Input, Spinner} from "@/components/ui";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function RegisterForm() {
  const router = useRouter();
  const form = useRegisterForm();
  const { formData, errors, loading, step, isStudent } = form;

  const [otpCode, setOtpCode] = useState("");

  // كليات وتخصصات من DB
  const colleges = useQuery(api.colleges.list, {});
  const selectedCollege = colleges?.find((c) => c.name === formData.college);
  const departments = useQuery(
    api.colleges.getDepartmentsByCollege,
    selectedCollege ? { collegeId: selectedCollege._id as Id<"colleges"> } : "skip",
  );

  const collegeNames = colleges?.map((c) => c.name) ?? [];
  const departmentNames = departments?.map((d) => d.name) ?? [];

  const stepLabels = [
    { num: 1, label: "البيانات" },
    { num: 2, label: "التحقق" },
    { num: 3, label: "الأمان" + (isStudent ? " والقسم" : "") },
  ];

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
        <div className="flex items-center justify-center gap-2 mb-6">
          {stepLabels.map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 nb-border rounded-full text-xs font-bold transition-all ${
                  step === s.num
                    ? "bg-primary text-primary-foreground nb-shadow-sm"
                    : step > s.num
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">{s.num}</span>
                )}
                {s.label}
              </div>
              {idx < stepLabels.length - 1 && (
                <div className="w-6 h-0.5 bg-foreground/20" />
              )}
            </div>
          ))}
        </div>

        <div className="nb-card p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-foreground">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive nb-border" />
              <span className="w-3 h-3 rounded-full bg-warning nb-border" />
              <span className="w-3 h-3 rounded-full bg-success nb-border" />
            </div>
            <span className="font-bold text-sm mr-2">
              {step === 1 ? "البيانات الأساسية" : step === 2 ? "التحقق من البريد الإلكتروني" : "الأمان" + (isStudent ? " والقسم الأكاديمي" : "")}
            </span>
          </div>

          {errors.form && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg mb-5">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm font-semibold text-destructive">{errors.form}</p>
            </div>
          )}

          <div id="clerk-captcha" />

          {/* Step 1 — البيانات الأساسية */}
          {step === 1 && (
            <div className="space-y-5">
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
              <Button
                type="button"
                isDisabled={loading}
                onPress={form.submitStep1}
                variant="primary"
                fullWidth
                className="text-base"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="current" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    التالي <ArrowRight className="w-5 h-5 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2 — التحقق من البريد OTP */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-primary" />
                <p className="font-bold text-base mb-1">أدخل كود التحقق</p>
                <p className="text-sm text-muted-foreground">
                  تم إرسال كود مكون من 6 أرقام إلى{" "}
                  <span className="font-bold text-foreground" dir="ltr">{formData.email}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold">كود التحقق *</label>
                <Input
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtpCode(val);
                    if (errors.otp) form.updateField("name", formData.name); // clear errors side effect
                  }}
                  placeholder="000000"
                  fullWidth
                  className={`text-center text-2xl tracking-[0.5em] font-mono ${errors.otp ? "border-destructive" : ""}`}
                  dir="ltr"
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                />
                {errors.otp && (
                  <p className="text-xs text-destructive font-semibold">{errors.otp}</p>
                )}
              </div>

              <Button
                type="button"
                isDisabled={loading || otpCode.length < 6}
                onPress={() => form.submitOtp(otpCode)}
                variant="primary"
                fullWidth
                className="text-base"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="current" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    تحقق
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={form.goToStep1}
                  className="text-sm text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline flex items-center gap-1 mx-auto"
                >
                  <ArrowRight className="w-4 h-4" />
                  تغيير البريد الإلكتروني
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — الأمان والقسم */}
          {step === 3 && (
            <div className="space-y-5">
              {isStudent && (
                <>
                  <FloatingSelectInput
                    id="register-college"
                    label="الكلية"
                    value={formData.college}
                    onChange={(val) => form.updateField("college", val)}
                    error={errors.college}
                    icon={<Building2 className="w-5 h-5" />}
                    options={collegeNames}
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
                    options={departmentNames}
                    placeholderOption={formData.college ? "اختر التخصص..." : "اختر الكلية أولاً"}
                    required
                  />
                </>
              )}

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

              <Button
                type="button"
                isDisabled={loading}
                onPress={() => form.submitStep3(() => router.push("/login-redirect"))}
                variant="primary"
                fullWidth
                className="text-base"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="current" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    إنشاء الحساب
                  </>
                )}
              </Button>
            </div>
          )}
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
