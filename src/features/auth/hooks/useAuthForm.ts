"use client";

import { useState, useCallback } from "react";
import { useSignIn } from "@clerk/nextjs";

interface UseAuthFormResult {
  email: string;
  password: string;
  otp: string;
  error: string;
  loading: boolean;
  showPassword: boolean;
  needsSecondFactor: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setOtp: (v: string) => void;
  togglePasswordVisibility: () => void;
  signInWithPassword: (onSuccess: () => void | Promise<void>) => Promise<void>;
  verifySecondFactor: (onSuccess: () => void | Promise<void>) => Promise<void>;
}

export function useAuthForm(): UseAuthFormResult {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const signInWithPassword = useCallback(
    async (onSuccess: () => void | Promise<void>) => {
      setError("");
      if (!email.trim()) { setError("البريد الإلكتروني مطلوب"); return; }
      if (!password) { setError("كلمة المرور مطلوبة"); return; }
      setLoading(true);
      try {
        const result = await signIn!.create({ identifier: email, password });
        if (result.status === "complete") {
          await setActive!({ session: result.createdSessionId });
          await onSuccess();
        } else if (result.status === "needs_second_factor") {
          await result.prepareSecondFactor({ strategy: "email_code" });
          setNeedsSecondFactor(true);
        } else {
          setError("حدث خطأ غير متوقع. حاول مجدداً.");
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: { code?: string }[] };
        const code = clerkErr?.errors?.[0]?.code ?? "";
        if (code === "form_password_incorrect" || code === "form_identifier_not_found") {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        } else if (code === "too_many_requests") {
          setError("محاولات كثيرة جداً. انتظر قليلاً وحاول مجدداً.");
        } else {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, signIn, setActive]
  );

  const verifySecondFactor = useCallback(
    async (onSuccess: () => void | Promise<void>) => {
      setError("");
      if (!otp.trim()) { setError("رمز التحقق مطلوب"); return; }
      setLoading(true);
      try {
        const result = await signIn!.attemptSecondFactor({ strategy: "email_code", code: otp });
        if (result.status === "complete") {
          await setActive!({ session: result.createdSessionId });
          await onSuccess();
        } else {
          setError("حدث خطأ غير متوقع. حاول مجدداً.");
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: { code?: string }[] };
        const code = clerkErr?.errors?.[0]?.code ?? "";
        if (code === "form_code_incorrect") {
          setError("رمز التحقق غير صحيح.");
        } else if (code === "too_many_requests") {
          setError("محاولات كثيرة جداً. انتظر قليلاً وحاول مجدداً.");
        } else {
          setError("رمز التحقق غير صحيح. حاول مجدداً.");
        }
      } finally {
        setLoading(false);
      }
    },
    [otp, signIn, setActive]
  );

  return { email, password, otp, error, loading, showPassword, needsSecondFactor, setEmail, setPassword, setOtp, togglePasswordVisibility, signInWithPassword, verifySecondFactor };
}
