"use client";

import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {Mail, KeyRound, CheckCircle2, AlertCircle, GraduationCap, ArrowRight} from "lucide-react";
import { Button, Input, Spinner} from "@/components/ui";

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
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-16 left-16 w-24 h-24 bg-success/30 nb-border rounded-xl rotate-6 animate-float opacity-50 hidden md:block" />
      <div className="absolute bottom-16 right-16 w-16 h-16 bg-secondary nb-border rounded-full animate-float opacity-40 hidden md:block" style={{ animationDelay: "1.5s" }} />
      <div className="absolute inset-0 bg-dots opacity-[0.03]" />

      <div className="w-full max-w-md animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary nb-border-thick rounded-2xl nb-shadow-lg mb-4 mx-auto">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">تأكيد البريد الإلكتروني</h1>
          <p className="text-muted-foreground font-medium">خطوة أخيرة للدخول للمنصة</p>
        </div>

        <div className="nb-card p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-foreground">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive nb-border" />
              <span className="w-3 h-3 rounded-full bg-warning nb-border" />
              <span className="w-3 h-3 rounded-full bg-success nb-border" />
            </div>
            <span className="font-bold text-sm mr-2">رمز التحقق</span>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-success/20 nb-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-extrabold text-lg mb-1">تم إرسال رمز التحقق!</h3>
            <p className="text-sm text-muted-foreground font-medium">
              تفقد بريدك <strong className="text-foreground">{email}</strong> وأدخل الرمز المكون من 6 أرقام.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg mb-5">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm font-semibold text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-center">رمز التحقق (OTP)</label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  fullWidth
                  className="pr-11 text-center font-bold text-xl tracking-[0.5em]"
                  dir="ltr"
                  autoFocus
                />
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
        </div>
      </div>
    </div>
  );
}
