"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type Step = "idle" | "done";

/**
 * Change password for an already-signed-in user. We use Clerk's
 * `user.updatePassword` (which verifies the current password and
 * rotates it in one call) instead of the public reset-via-email flow,
 * because that flow only works when nobody is signed in and was
 * always failing with a generic "تعذّر إرسال رمز التحقق" for
 * authenticated users.
 *
 * The caller passes both the current and the new password; we surface
 * any Clerk error message verbatim so the user sees the real reason
 * (wrong current password, weak new password, pwned new password, etc.)
 * instead of a swallowed generic one.
 */
export function usePasswordChange() {
  const { user } = useUser();
  const [step, setStep] = useState<Step>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (newPassword.length < 8) {
        setError("يجب ألّا تقل كلمة المرور الجديدة عن ثمانية أحرف.");
        return;
      }
      if (!user) {
        setError("لم نتمكّن من قراءة بيانات الحساب. يُرجى تحديث الصفحة.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await user.updatePassword({
          currentPassword,
          newPassword,
          signOutOfOtherSessions: true,
        });
        setStep("done");
      } catch (err: unknown) {
        const clerkErr = err as {
          errors?: { code?: string; longMessage?: string; message?: string }[];
        };
        const c = clerkErr?.errors?.[0];
        const code = c?.code ?? "";
        const msg = c?.longMessage ?? c?.message ?? "";
        if (code === "form_password_incorrect" || msg.includes("incorrect")) {
          setError("كلمة المرور الحالية غير صحيحة.");
        } else if (code === "form_password_pwned") {
          setError("كلمة المرور الجديدة وردت في تسريبات معروفة. اختر كلمة أخرى.");
        } else if (code === "form_password_too_short") {
          setError("كلمة المرور الجديدة قصيرة جدًا.");
        } else {
          setError(msg || "تعذّر تغيير كلمة المرور. حاول مجددًا بعد قليل.");
        }
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
  }, []);

  return { step, loading, error, change, reset };
}
