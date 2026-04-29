"use client";

import { useState, useCallback } from "react";
import { useSignIn } from "@clerk/nextjs";

interface UseAuthFormResult {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  showPassword: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  togglePasswordVisibility: () => void;
  signInWithPassword: (onSuccess: () => void | Promise<void>) => Promise<void>;
}

export function useAuthForm(): UseAuthFormResult {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return { email, password, error, loading, showPassword, setEmail, setPassword, togglePasswordVisibility, signInWithPassword };
}
