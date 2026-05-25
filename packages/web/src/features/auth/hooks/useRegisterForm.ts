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
const STUDENT_DOMAINS = ["@std-zuj.edu.jo", "@std.zuj.edu.jo"];

export function isStudentEmail(email: string) {
  return STUDENT_DOMAINS.some((d) => email.endsWith(d));
}

export function isStaffEmail(email: string) {
  return email.endsWith("@zuj.edu.jo");
}

interface UseRegisterFormResult {
  formData: RegisterFormData;
  errors: Record<string, string>;
  loading: boolean;
  /** 1 = basic info, 2 = OTP, 3 = password + college/department. */
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
    const e: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      e.name = "يجب ألّا يقلّ الاسم عن 3 أحرف";
    }
    if (!formData.email.trim()) {
      e.email = "حقل البريد الإلكتروني مطلوب";
    } else if (!VALID_EMAIL_DOMAINS.some((d) => formData.email.endsWith(d))) {
      e.email = "يجب استخدام البريد الجامعي (@zuj.edu.jo أو @std-zuj.edu.jo)";
    }
    if (!formData.studentId.trim()) {
      e.studentId = "حقل الرقم الجامعي مطلوب";
    } else if (!/^\d{9}$/.test(formData.studentId)) {
      e.studentId = "يجب أن يتكوّن الرقم الجامعي من 9 أرقام بالضبط";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Step 1: validate the basic-info form and send the OTP email. */
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
        setErrors({ form: "هذا البريد الإلكتروني مُسجَّل مسبقًا" });
      } else {
        setErrors({ form: msg || "حدث خطأ. يُرجى التأكّد من البيانات وإعادة المحاولة." });
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name, formData.email, formData.studentId, signUp]);

  /** Step 2: verify the OTP code submitted by the user. */
  const submitOtp = useCallback(
    async (code: string) => {
      if (!code || code.length < 6) {
        setErrors({ otp: "يُرجى إدخال الرمز المكوّن من 6 أرقام" });
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
          setErrors({ otp: "الرمز غير صحيح. يُرجى التأكّد منه وإعادة المحاولة." });
        } else {
          setErrors({ otp: clerkError?.message ?? "حدث خطأ أثناء التحقّق" });
        }
      } finally {
        setLoading(false);
      }
    },
    [signUp],
  );

  /** Step 3: set the password (and college/department for students) and finalise sign-up. */
  const submitStep3 = useCallback(
    async (onSuccess: () => void) => {
      const e: Record<string, string> = {};
      if (isStudent) {
        if (!formData.college) e.college = "حقل الكلية مطلوب";
        if (!formData.department) e.department = "حقل التخصّص مطلوب";
      }
      if (!formData.password || formData.password.length < 8) {
        e.password = "يجب ألّا تقلّ كلمة المرور عن 8 أحرف";
      }
      if (formData.password !== formData.confirmPassword) {
        e.confirmPassword = "كلمتا المرور غير متطابقتين";
      }
      if (Object.keys(e).length > 0) {
        setErrors(e);
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
          setErrors({ form: "لم يكتمل التسجيل. يُرجى إعادة المحاولة." });
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: { message?: string; longMessage?: string; code?: string }[] };
        const clerkError = clerkErr?.errors?.[0];
        const code = clerkError?.code ?? "";
        const msg = clerkError?.longMessage ?? clerkError?.message ?? "";
        if (code === "form_password_pwned") {
          setErrors({ form: "كلمة المرور هذه واردة في قوائم اختراق معروفة. يُرجى اختيار كلمة مرور أخرى." });
        } else if (code === "form_password_too_short") {
          setErrors({ form: "يجب ألّا تقلّ كلمة المرور عن 8 أحرف" });
        } else {
          setErrors({ form: msg || "حدث خطأ. يُرجى التأكّد من البيانات وإعادة المحاولة." });
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
