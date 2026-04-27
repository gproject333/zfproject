"use client";

import { useState, useCallback } from "react";
import { useSignIn } from "@clerk/nextjs";

type Step = "idle" | "verifying" | "done";

export function usePasswordChange() {
  const { signIn, setActive } = useSignIn();
  const [step, setStep] = useState<Step>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await signIn!.create({ strategy: "reset_password_email_code", identifier: email });
      setStep("verifying");
    } catch {
      setError("تعذّر إرسال رمز التحقق. تأكد من البريد الإلكتروني.");
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const verifyAndChange = useCallback(async (_email: string, code: string, newPassword: string) => {
    if (newPassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        setStep("done");
      } else {
        setError("فشل التحقق. حاول مجدداً.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code?: string; message?: string }[] };
      const code_ = clerkErr?.errors?.[0]?.code ?? "";
      if (code_ === "form_code_incorrect") {
        setError("رمز التحقق غير صحيح.");
      } else if (code_ === "form_password_pwned") {
        setError("كلمة المرور موجودة في قوائم اختراق معروفة، اختر كلمة أخرى.");
      } else {
        setError("حدث خطأ. تأكد من الرمز وكلمة المرور وحاول مجدداً.");
      }
    } finally {
      setLoading(false);
    }
  }, [signIn, setActive]);

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
  }, []);

  return { step, loading, error, requestReset, verifyAndChange, reset };
}
