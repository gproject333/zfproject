"use client";

import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button, InputOTP, Spinner, Card } from "@/components/ui";
import AuthShell from "./AuthShell";

export default function OtpVerifyForm() {
  const { signUp, setActive } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) router.replace("/login");
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError("رمز التحقق يجب أن يكون 6 أرقام");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code: otpCode });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        router.push("/login-redirect");
      } else {
        setError("التحقق لم يكتمل. حاول مجدداً.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message?: string }[] };
      const msg = clerkErr?.errors?.[0]?.message;
      setError(msg ?? "رمز التحقق غير صحيح أو منتهي الصلاحية.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <AuthShell title="تأكيد البريد الإلكتروني" subtitle="خطوة أخيرة قبل الدخول إلى المنصة">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 p-3 bg-success/10 ds-border rounded-lg mb-6 text-sm font-medium">
          <Mail className="w-5 h-5 text-success shrink-0" />
          <span>
            تم إرسال رمز التحقق إلى{" "}
            <strong className="text-foreground" dir="ltr">{email}</strong>
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 ds-border rounded-lg mb-5" role="alert">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm font-semibold text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-center text-foreground">
              رمز التحقق (OTP)
            </label>
            <div className="flex justify-center" dir="ltr">
              <InputOTP value={otpCode} onChange={setOtpCode} maxLength={6} autoFocus>
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
          </div>

          <Button
            type="submit"
            isDisabled={loading || otpCode.length < 6}
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
                تأكيد والدخول
              </>
            )}
          </Button>

          <Button
            type="button"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
            className="text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
