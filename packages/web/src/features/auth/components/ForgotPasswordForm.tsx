"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Lock } from "lucide-react";
import { FloatingEmailInput, FloatingPasswordInput, FloatingTextInput } from "./FloatingFields";
import { Button, Spinner, Card } from "@/components/ui";
import AuthShell from "./AuthShell";

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
    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }
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
        setError("تعذّر إرسال الرمز. يُرجى التأكّد من البريد الإلكتروني وإعادة المحاولة.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError("يجب أن يتكوّن رمز التحقّق من 6 أرقام");
      return;
    }
    if (password.length < 8) {
      setError("يجب ألّا تقلّ كلمة المرور عن 8 أحرف");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
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
        setError("تعذّر إتمام التحقّق. يُرجى إعادة المحاولة.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code?: string }[] };
      const c = clerkErr?.errors?.[0]?.code ?? "";
      if (c === "form_code_incorrect") {
        setError("رمز التحقّق غير صحيح أو منتهي الصلاحية.");
      } else if (c === "form_password_pwned") {
        setError("كلمة المرور هذه واردة في قوائم اختراق معروفة. يُرجى اختيار كلمة مرور أخرى.");
      } else {
        setError("حدث خطأ. يُرجى التأكّد من الرمز وكلمة المرور.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="استعادة كلمة المرور"
      subtitle={
        step === "email"
          ? "يُرجى إدخال البريد الإلكتروني الجامعي لإرسال رمز التحقّق"
          : "يُرجى إدخال الرمز المُرسَل وكلمة المرور الجديدة"
      }
      footer={
        <Link
          href="/login"
          className="text-sm font-bold text-primary hover:text-accent underline underline-offset-4 transition-colors inline-flex items-center gap-1"
        >
          <ArrowRight className="w-3 h-3" /> العودة إلى تسجيل الدخول
        </Link>
      }
    >
      <Card className="p-6 sm:p-8">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 ds-border rounded-lg mb-5" role="alert">
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
                <><Spinner size="sm" color="current" />يجري الإرسال...</>
              ) : (
                <><Mail className="w-5 h-5" />إرسال رمز التحقّق</>
              )}
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex items-center gap-2 p-3 bg-success/10 ds-border rounded-lg text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              أُرسل الرمز إلى <strong className="text-foreground">{email}</strong>
            </div>

            <FloatingTextInput
              id="forgot-code"
              label="رمز التحقّق (6 أرقام)"
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
                onPress={() => {
                  setStep("email");
                  setError("");
                }}
                variant="outline"
                className="flex-1"
              >
                <ArrowRight className="w-5 h-5" /> الرجوع
              </Button>
              <Button type="submit" isDisabled={loading} variant="primary" className="flex-[2] text-base">
                {loading ? (
                  <><Spinner size="sm" color="current" />يجري التغيير...</>
                ) : (
                  <><Lock className="w-5 h-5" />تغيير كلمة المرور</>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
