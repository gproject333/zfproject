"use client";

import { useState, useCallback } from "react";
import { useSignUp } from "@clerk/nextjs";

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

const VALID_EMAIL_DOMAINS = ["@zuj.edu.jo", "@std-zuj.edu.jo", "@std.zuj.edu.jo"];

interface UseRegisterFormResult {
  formData: RegisterFormData;
  errors: Record<string, string>;
  loading: boolean;
  step: 1 | 2;
  showPassword: boolean;
  updateField: (name: keyof RegisterFormData, value: string) => void;
  togglePasswordVisibility: () => void;
  goToStep1: () => void;
  goToStep2IfValid: () => void;
  submit: (onSuccess: (email: string) => void) => Promise<void>;
}

export function useRegisterForm(): UseRegisterFormResult {
  const { signUp } = useSignUp();
  const [formData, setFormData] = useState<RegisterFormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      e.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }
    if (!formData.email.trim()) {
      e.email = "البريد الإلكتروني مطلوب";
    } else if (!VALID_EMAIL_DOMAINS.some((d) => formData.email.endsWith(d))) {
      e.email = "يجب استخدام البريد الجامعي (@zuj.edu.jo أو @std-zuj.edu.jo)";
    }
    if (!formData.studentId.trim()) {
      e.studentId = "الرقم الجامعي مطلوب";
    } else if (!/^\d{9}$/.test(formData.studentId)) {
      e.studentId = "الرقم الجامعي يجب أن يكون 9 أرقام بالضبط";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData.name, formData.email, formData.studentId]);

  const validateStep2 = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!formData.college) e.college = "الكلية مطلوبة";
    if (!formData.department) e.department = "التخصص مطلوب";
    if (!formData.password || formData.password.length < 8) {
      e.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    }
    if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = "كلمتا المرور غير متطابقتين";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData.college, formData.department, formData.password, formData.confirmPassword]);

  const goToStep1 = useCallback(() => setStep(1), []);
  const goToStep2IfValid = useCallback(() => {
    if (validateStep1()) setStep(2);
  }, [validateStep1]);

  const submit = useCallback(
    async (onSuccess: (email: string) => void) => {
      if (!validateStep2()) return;
      setLoading(true);
      setErrors({});
      try {
        const nameParts = formData.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || undefined;

        await signUp!.create({
          firstName,
          ...(lastName && { lastName }),
          emailAddress: formData.email,
          password: formData.password,
          unsafeMetadata: {
            studentId: formData.studentId,
            college: formData.college,
            department: formData.department,
          },
        });

        await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
        onSuccess(formData.email);
      } catch (err: unknown) {
        const clerkErr = err as { errors?: { message?: string; longMessage?: string; code?: string }[] };
        const clerkError = clerkErr?.errors?.[0];
        const code = clerkError?.code ?? "";
        const msg = clerkError?.longMessage ?? clerkError?.message ?? "";

        if (code === "form_identifier_exists" || msg.includes("already")) {
          setErrors({ form: "هذا البريد الإلكتروني مسجل مسبقاً" });
        } else if (code === "form_password_pwned") {
          setErrors({ form: "كلمة المرور موجودة في قوائم اختراق معروفة، اختر كلمة مرور أخرى" });
        } else if (code === "form_password_too_short" || (code.includes("password") && msg.includes("8"))) {
          setErrors({ form: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
        } else {
          setErrors({ form: msg || "حدث خطأ. تأكد من البيانات وحاول مجدداً." });
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, signUp, validateStep2]
  );

  return {
    formData,
    errors,
    loading,
    step,
    showPassword,
    updateField,
    togglePasswordVisibility,
    goToStep1,
    goToStep2IfValid,
    submit,
  };
}
