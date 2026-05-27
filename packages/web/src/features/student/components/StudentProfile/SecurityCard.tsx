"use client";

import { Dispatch, SetStateAction } from "react";
import { CheckCircle2, Shield, KeyRound, Mail } from "lucide-react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { usePasswordChange } from "../../hooks/usePasswordChange";
import { Button, Input, Card } from "@/components/ui";
import OliveSpinner from "@/components/OliveSpinner";

interface PasswordForm {
  code: string;
  newPassword: string;
}

interface SecurityCardProps {
  profile: ReturnType<typeof useStudentProfile>;
  password: ReturnType<typeof usePasswordChange>;
  passwordForm: PasswordForm;
  setPasswordForm: Dispatch<SetStateAction<PasswordForm>>;
}

export function SecurityCard({
  profile,
  password,
  passwordForm,
  setPasswordForm,
}: SecurityCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base">الأمان</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            إدارة كلمة المرور وحماية حسابك.
          </p>
        </div>
      </div>

      {password.step === "idle" && (
        <div className="space-y-2">
          <Button
            onPress={() =>
              profile.user?.email &&
              void password.requestReset(profile.user.email)
            }
            isDisabled={password.loading || !profile.user?.email}
            variant="outline"
            size="sm"
          >
            {password.loading ? (
              <OliveSpinner size="xs" className="text-current" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            تغيير كلمة المرور
          </Button>
          <p className="text-[11px] text-muted-foreground font-medium">
            سنرسل رمز تحقق إلى{" "}
            <span dir="ltr" className="font-mono text-foreground/85">
              {profile.user?.email ?? "بريدك الإلكتروني"}
            </span>{" "}
            لتأكيد التغيير.
          </p>
        </div>
      )}

      {password.step === "verifying" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            تم إرسال رمز التحقق إلى بريدك الإلكتروني. أدخله مع كلمة المرور الجديدة.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">
                رمز التحقق
              </label>
              <Input
                fullWidth
                value={passwordForm.code}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, code: e.target.value }))
                }
                placeholder="123456"
                dir="ltr"
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">
                كلمة المرور الجديدة
              </label>
              <Input
                type="password"
                fullWidth
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="ثمانية أحرف على الأقل"
                dir="ltr"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onPress={() =>
                profile.user?.email &&
                void password.verifyAndChange(
                  profile.user.email,
                  passwordForm.code,
                  passwordForm.newPassword,
                )
              }
              isDisabled={
                password.loading ||
                passwordForm.code.length !== 6 ||
                passwordForm.newPassword.length < 8
              }
              variant="secondary"
              size="sm"
            >
              {password.loading ? (
                <OliveSpinner size="xs" className="text-current" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              تأكيد التغيير
            </Button>
            <Button
              onPress={() => {
                password.reset();
                setPasswordForm({ code: "", newPassword: "" });
              }}
              variant="outline"
              size="sm"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {password.step === "done" && (
        <div className="rounded-lg bg-success/10 ds-border border-success/30 p-3 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-foreground">تم تغيير كلمة المرور بنجاح</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.
            </p>
          </div>
        </div>
      )}

      {password.error && (
        <p className="text-xs font-semibold text-destructive">
          {password.error}
        </p>
      )}
    </Card>
  );
}
