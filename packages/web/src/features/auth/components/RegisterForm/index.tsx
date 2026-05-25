"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles } from "lucide-react";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import { Card } from "@/components/ui";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import AuthShell from "../AuthShell";
import { StepIndicator } from "./StepIndicator";
import { CredentialsStep } from "./CredentialsStep";
import { VerificationStep } from "./VerificationStep";
import { SecurityStep } from "./SecurityStep";

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
      subtitle="التسجيل في المنصّة باستخدام البريد الإلكتروني الجامعي"
      maxWidth="lg"
      footer={
        <p className="text-sm text-muted-foreground font-medium">
          هل يوجد حساب مسبقًا؟{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:text-accent underline underline-offset-4 transition-colors inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> تسجيل الدخول
          </Link>
        </p>
      }
    >
      <StepIndicator step={step} stepLabels={stepLabels} />

      <Card className="p-6 sm:p-8">
        {errors.form && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 ds-border rounded-lg mb-5" role="alert">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm font-semibold text-destructive">{errors.form}</p>
          </div>
        )}

        <div id="clerk-captcha" />

        {step === 1 && (
          <CredentialsStep
            formData={formData}
            errors={errors}
            loading={loading}
            updateField={form.updateField}
            submitStep1={form.submitStep1}
          />
        )}

        {step === 2 && (
          <VerificationStep
            formData={formData}
            errors={errors}
            loading={loading}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            updateField={form.updateField}
            submitOtp={form.submitOtp}
            goToStep1={form.goToStep1}
          />
        )}

        {step === 3 && (
          <SecurityStep
            formData={formData}
            errors={errors}
            loading={loading}
            isStudent={isStudent}
            collegeNames={collegeNames}
            departmentNames={departmentNames}
            updateField={form.updateField}
            submitStep3={form.submitStep3}
            onSuccess={() => router.push("/login-redirect")}
          />
        )}
      </Card>
    </AuthShell>
  );
}
