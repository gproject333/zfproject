"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Hash, Building2, UserPlus, ArrowRight, AlertCircle, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import {
  FloatingTextInput,
  FloatingEmailInput,
  FloatingPasswordInput,
  FloatingSelectInput,
} from "./FloatingFields";
import { Button, InputOTP, Spinner, Card } from "@/components/ui";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import AuthShell from "./AuthShell";

export default function RegisterForm() {
  const router = useRouter();
  const form = useRegisterForm();
  const { formData, errors, loading, step, isStudent } = form;

  const [otpCode, setOtpCode] = useState("");

  // Colleges + departments loaded from the database.
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
    <AuthShell
      title="إنشاء حساب جديد"
      subtitle="سجّل ببريدك الجامعي وابدأ رحلة الريادة"
      maxWidth="lg"
      footer={
        <p className="text-sm text-muted-foreground font-medium">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:text-accent underline underline-offset-4 transition-colors inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> تسجيل الدخول
          </Link>
        </p>
      }
    >
      <ol className="flex items-center justify-center gap-2 mb-6" aria-label="مراحل إنشاء الحساب">
        {stepLabels.map((s, idx) => (
          <li key={s.num} className="flex items-center gap-2">
            <span
              aria-current={step === s.num ? "step" : undefined}
              className={`flex items-center gap-2 px-3 py-1.5 ds-border rounded-full text-xs font-bold transition-colors ${
                step === s.num
                  ? "bg-primary text-primary-foreground"
                  : step > s.num
                  ? "bg-success/20 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                  {s.num}
                </span>
              )}
              {s.label}
            </span>
            {idx < stepLabels.length - 1 && <span className="w-6 h-px bg-foreground/20" aria-hidden />}
          </li>
        ))}
      </ol>

      <Card className="p-6 sm:p-8">
        {errors.form && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 ds-border rounded-lg mb-5" role="alert">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm font-semibold text-destructive">{errors.form}</p>
          </div>
        )}

        <div id="clerk-captcha" />

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
              <label className="block text-sm font-bold text-foreground">كود التحقق *</label>
              <div className="flex justify-center" dir="ltr">
                <InputOTP
                  value={otpCode}
                  onChange={(val) => {
                    setOtpCode(val);
                    // Touching `name` triggers the hook's clear-errors side effect.
                    if (errors.otp) form.updateField("name", formData.name);
                  }}
                  maxLength={6}
                  isInvalid={!!errors.otp}
                  autoFocus
                >
                  <InputOTP.Group>
                    <InputOTP.Slot index={0} />
                    <InputOTP.Slot index={1} />
                    <InputOTP.Slot index={2} />
                    <InputOTP.Slot index={3} />
                    <InputOTP.Slot index={4} />
                    <InputOTP.Slot index={5} />
                  </InputOTP.Group>
                </InputOTP>
              </div>
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
      </Card>
    </AuthShell>
  );
}
