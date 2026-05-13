"use client";

import { useState, useCallback } from "react";
import { useSignUp } from "@clerk/nextjs";
import {
  isStaffEmail,
  isStudentEmail,
  registerStep1Schema,
  registerStep3Schema,
  safeParseToFieldErrors,
} from "@/lib/schemas";

export { isStudentEmail, isStaffEmail };

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId: string;
  college: string;
  department: string;
}

const EMPTY: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  studentId: "",
  college: "",
  department: "",
};

interface UseRegisterFormResult {
  formData: RegisterFormData;
  errors: Record<string, string>;
  loading: boolean;
  /** 1=بيانات، 2=OTP، 3=أمان والقسم */
  step: 1 | 2 | 3;
  showPassword: boolean;
  isStudent: boolean;
  updateField: (name: keyof RegisterFormData, value: string) => void;
  togglePasswordVisibility: () => void;
  goToStep1: () => void;
  submitStep1: () => Promise<void>;
  submitOtp: (code: string) => Promise<void>;
  submitStep3: (onSuccess: () => void) => Promise<void>;
}

export function useRegisterForm(): UseRegisterFormResult {
  const { signUp, setActive } = useSignUp();
  const [formData, setFormData] = useState<RegisterFormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);

  const isStudent = isStudentEmail(formData.email);

  const updateField = useCallback((name: keyof RegisterFormData, value: string) => {
    const sanitized = name === "studentId" ? value.replace(/\D/g, "") : value;
    setFormData((prev) => {
      const next = { ...prev, [name]: sanitized };
      if (name === "college") next.department = "";
      return next;
    });
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const togglePasswordVisibility = useCallback(() => setShowPassword((v) => !v), []);
  const goToStep1 = useCallback(() => setStep(1), []);

  const validateStep1 = (): boolean => {
    const result = safeParseToFieldErrors(registerStep1Schema, {
      name: formData.name,
      email: formData.email,
      studentId: formData.studentId,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return false;
    }
    setErrors({});
    return true;
  };

  /** الخطوة 1: التحقق من البيانات وإرسال OTP */
  const submitStep1 = useCallback(async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setErrors({});
    try {
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      await signUp!.create({
        emailAddress: formData.email,
        firstName,
        ...(lastName && { lastName }),
        unsafeMetadata: { studentId: formData.studentId },
      });
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep(2);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message?: string; longMessage?: string; code?: string }[] };
      const clerkError = clerkErr?.errors?.[0];
      const code = clerkError?.code ?? "";
      const msg = clerkError?.longMessage ?? clerkError?.message ?? "";
      if (code === "form_identifier_exists" || msg.includes("already")) {
        setErrors({ form: "هذا البريد الإلكتروني مسجل مسبقاً" });
      } else {
        setErrors({ form: msg || "حدث خطأ. تأكد من البيانات وحاول مجدداً." });
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name, formData.email, formData.studentId, signUp]);

  /** الخطوة 2: التحقق من كود OTP */
  const submitOtp = useCallback(
    async (code: string) => {
      if (!code || code.length < 6) {
        setErrors({ otp: "أدخل الكود المكون من 6 أرقام" });
        return;
      }
      setLoading(true);
      setErrors({});
      try {
        await signUp!.attemptEmailAddressVerification({ code });
        setStep(3);
      } catch (err: unknown) {
        const clerkErr = err as { errors?: { message?: string; code?: string }[] };
        const clerkError = clerkErr?.errors?.[0];
        const code2 = clerkError?.code ?? "";
        if (code2 === "form_code_incorrect" || code2.includes("code")) {
          setErrors({ otp: "الكود غير صحيح، تحقق وأعد المحاولة" });
        } else {
          setErrors({ otp: clerkError?.message ?? "حدث خطأ أثناء التحقق" });
        }
      } finally {
        setLoading(false);
      }
    },
    [signUp],
  );

  /** الخطوة 3: تعيين كلمة المرور (والكلية/التخصص للطلاب) وإتمام التسجيل */
  const submitStep3 = useCallback(
    async (onSuccess: () => void) => {
      const result = safeParseToFieldErrors(registerStep3Schema, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        college: formData.college,
        department: formData.department,
        isStudent,
      });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      setLoading(true);
      setErrors({});
      try {
        const result = await signUp!.update({
          password: formData.password,
          unsafeMetadata: {
            studentId: formData.studentId,
            ...(isStudent && {
              college: formData.college,
              department: formData.department,
            }),
          },
        });
        if (result.status === "complete" && result.createdSessionId) {
          await setActive!({ session: result.createdSessionId });
          onSuccess();
        } else {
          setErrors({ form: "لم يكتمل التسجيل، حاول مجدداً" });
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: { message?: string; longMessage?: string; code?: string }[] };
        const clerkError = clerkErr?.errors?.[0];
        const code = clerkError?.code ?? "";
        const msg = clerkError?.longMessage ?? clerkError?.message ?? "";
        if (code === "form_password_pwned") {
          setErrors({ form: "كلمة المرور موجودة في قوائم اختراق معروفة، اختر كلمة مرور أخرى" });
        } else if (code === "form_password_too_short") {
          setErrors({ form: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
        } else {
          setErrors({ form: msg || "حدث خطأ. تأكد من البيانات وحاول مجدداً." });
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, isStudent, signUp, setActive],
  );

  return {
    formData,
    errors,
    loading,
    step,
    showPassword,
    isStudent,
    updateField,
    togglePasswordVisibility,
    goToStep1,
    submitStep1,
    submitOtp,
    submitStep3,
  };
}
