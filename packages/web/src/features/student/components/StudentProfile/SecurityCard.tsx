"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { CheckCircle2, Shield, KeyRound, Eye, EyeOff } from "lucide-react";
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
  /** Parent still owns the form state. `code` is unused now but kept
   *  on the shared shape to avoid touching the parent in this PR. */
  passwordForm: PasswordForm;
  setPasswordForm: Dispatch<SetStateAction<PasswordForm>>;
}

export function SecurityCard({
  profile,
  password,
  passwordForm,
  setPasswordForm,
}: SecurityCardProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const newPassword = passwordForm.newPassword;
  const canSubmit =
    current.length >= 8 && newPassword.length >= 8 && !password.loading;

  const closeAndReset = () => {
    password.reset();
    setOpen(false);
    setCurrent("");
    setPasswordForm({ code: "", newPassword: "" });
  };

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

      {!open && password.step !== "done" && (
        <Button
          onPress={() => {
            password.reset();
            setOpen(true);
          }}
          variant="outline"
          size="sm"
        >
          <KeyRound className="w-4 h-4" />
          تغيير كلمة المرور
        </Button>
      )}

      {open && password.step !== "done" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">
                كلمة المرور الحالية
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  fullWidth
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCurrent ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  fullWidth
                  value={newPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="ثمانية أحرف على الأقل"
                  dir="ltr"
                  autoComplete="new-password"
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNew ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onPress={() => void password.change(current, newPassword)}
              isDisabled={!canSubmit}
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
              onPress={closeAndReset}
              variant="outline"
              size="sm"
            >
              إلغاء
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            تغيير كلمة المرور سيؤدّي إلى تسجيل الخروج من باقي الأجهزة لحماية حسابك.
          </p>
        </div>
      )}

      {password.step === "done" && (
        <div className="rounded-lg bg-success/10 ds-border border-success/30 p-3 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <p className="font-bold text-foreground">تم تغيير كلمة المرور بنجاح</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.
            </p>
          </div>
          <Button onPress={closeAndReset} variant="outline" size="sm">
            حسناً
          </Button>
        </div>
      )}

      {password.error && (
        <p className="text-xs font-semibold text-destructive">{password.error}</p>
      )}
    </Card>
  );
}
