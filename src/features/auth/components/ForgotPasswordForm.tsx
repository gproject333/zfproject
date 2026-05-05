"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import {GraduationCap, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Lock} from "lucide-react";
import { FloatingEmailInput, FloatingPasswordInput, FloatingTextInput } from "./FloatingFields";
import { Button, Spinner, Card} from "@/components/ui";

type Step = "email" | "verify";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { signIn, setActive } = useSignIn();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("البريد الإلكتروني مطلوب"); return; }
    setLoading(true);
    setError("");
    try {
      await signIn!.create({ strategy: "reset_password_email_code", identifier: email });
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code?: string; message?: string }[] };
      const c = clerkErr?.errors?.[0]?.code ?? "";
      if (c === "form_identifier_not_found") {
        setError("لا يوجد حساب مرتبط بهذا البريد الإلكتروني.");
      } else {
        setError("تعذّر إرسال الرمز. تأكد من البريد الإلكتروني وحاول مجدداً.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { setError("رمز التحقق يجب أن يكون 6 أرقام"); return; }
    if (password.length < 8) { setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return; }
    if (password !== confirmPassword) { setError("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true);
    setError("");
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        router.push("/login-redirect");
      } else {
        setError("فشل التحقق. حاول مجدداً.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code?: string }[] };
      const c = clerkErr?.errors?.[0]?.code ?? "";
      if (c === "form_code_incorrect") {
        setError("رمز التحقق غير صحيح أو منتهي الصلاحية.");
      } else if (c === "form_password_pwned") {
        setError("كلمة المرور موجودة في قوائم اختراق معروفة، اختر كلمة أخرى.");
      } else {
        setError("حدث خطأ. تأكد من الرمز وكلمة المرور.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-16 left-16 w-24 h-24 bg-secondary nb-border rounded-xl -rotate-6 animate-float opacity-50 hidden md:block" />
      <div className="absolute bottom-16 right-16 w-16 h-16 bg-accent nb-border rounded-full animate-float opacity-40 hidden md:block" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 right-12 w-10 h-10 bg-primary nb-border rotate-45 animate-float opacity-50 hidden md:block" style={{ animationDelay: "0.7s" }} />
      <div className="absolute inset-0 bg-dots opacity-[0.03]" />

      <div className="w-full max-w-md animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary nb-border-thick rounded-2xl nb-shadow-lg mb-4 mx-auto">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">استعادة كلمة المرور</h1>
          <p className="text-muted-foreground font-medium">
            {step === "email" ? "أدخل بريدك الجامعي لإرسال رمز التحقق" : "أدخل الرمز الذي وصلك وكلمة المرور الجديدة"}
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-foreground">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive nb-border" />
              <span className="w-3 h-3 rounded-full bg-warning nb-border" />
              <span className="w-3 h-3 rounded-full bg-success nb-border" />
            </div>
            <span className="font-bold text-sm mr-2">
              {step === "email" ? "البريد الإلكتروني" : "رمز التحقق وكلمة المرور"}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg mb-5">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm font-semibold text-destructive">{error}</p>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <FloatingEmailInput
                id="forgot-email"
                label="البريد الإلكتروني الجامعي"
                value={email}
                onChange={setEmail}
                required
              />
              <Button type="submit" isDisabled={loading} variant="primary" fullWidth className="text-base">
                {loading ? (
                  <><Spinner size="sm" color="current" />جاري الإرسال...</>
                ) : (
                  <><Mail className="w-5 h-5" />إرسال رمز التحقق</>
                )}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex items-center gap-2 p-3 bg-success/10 nb-border rounded-lg text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                تم إرسال الرمز إلى <strong className="text-foreground">{email}</strong>
              </div>

              <FloatingTextInput
                id="forgot-code"
                label="رمز التحقق (6 أرقام)"
                value={code}
                onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                icon={<KeyRound className="w-5 h-5" />}
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                required
              />

              <FloatingPasswordInput
                id="forgot-password"
                label="كلمة المرور الجديدة"
                value={password}
                onChange={setPassword}
                required
                autoComplete="new-password"
              />

              <FloatingPasswordInput
                id="forgot-confirm"
                label="تأكيد كلمة المرور"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                autoComplete="new-password"
                showEye={false}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  onPress={() => { setStep("email"); setError(""); }}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowRight className="w-5 h-5" /> رجوع
                </Button>
                <Button type="submit" isDisabled={loading} variant="primary" className="flex-[2] text-base">
                  {loading ? (
                    <><Spinner size="sm" color="current" />جاري التغيير...</>
                  ) : (
                    <><Lock className="w-5 h-5" />تغيير كلمة المرور</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-bold text-primary hover:text-accent underline underline-offset-4 transition-colors inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3" /> العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
