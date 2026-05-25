"use client";

import { Dispatch, SetStateAction } from "react";
import { CheckCircle2, Shield, KeyRound, Mail } from "lucide-react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { usePasswordChange } from "../../hooks/usePasswordChange";
import { Button, Input, Spinner, Card } from "@/components/ui";

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
      <h3 className="font-semibold text-base flex items-center gap-2">
        <Shield className="w-5 h-5 text-accent" />
        الأمان
      </h3>

      {password.step === "idle" && (
        <Button
          onPress={() =>
            profile.user?.email &&
            void password.requestReset(profile.user.email)
          }
          isDisabled={password.loading}
          variant="outline"
          size="sm"
        >
          {password.loading ? (
            <Spinner size="sm" color="current" />
          ) : (
            <KeyRound className="w-4 h-4" />
          )}
          تغيير كلمة المرور
        </Button>
      )}

      {password.step === "verifying" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            تم إرسال رمز التحقق إلى بريدك الإلكتروني.
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
                placeholder="••••••••"
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
              isDisabled={password.loading}
              variant="secondary"
              size="sm"
            >
              {password.loading ? (
                <Spinner size="sm" color="current" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              تأكيد
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
        <p className="text-sm font-semibold text-success flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          تم تغيير كلمة المرور بنجاح.
        </p>
      )}

      {password.error && (
        <p className="text-xs font-semibold text-destructive">
          {password.error}
        </p>
      )}
    </Card>
  );
}
