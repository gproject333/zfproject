"use client";

import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button, InputOTP, Spinner } from "@/components/ui";

interface VerificationStepProps {
  formData: {
    email: string;
    name: string;
  };
  errors: {
    otp?: string;
  };
  loading: boolean;
  otpCode: string;
  setOtpCode: (val: string) => void;
  updateField: (name: "name", value: string) => void;
  submitOtp: (code: string) => void;
  goToStep1: () => void;
}

export function VerificationStep({
  formData,
  errors,
  loading,
  otpCode,
  setOtpCode,
  updateField,
  submitOtp,
  goToStep1,
}: VerificationStepProps) {
  return (
    <div className="space-y-5">
      <div className="text-center py-2">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-primary" />
        <p className="font-bold text-base mb-1">إدخال رمز التحقّق</p>
        <p className="text-sm text-muted-foreground">
          أُرسل رمز مكوّن من 6 أرقام إلى{" "}
          <span className="font-bold text-foreground" dir="ltr">{formData.email}</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-foreground">رمز التحقّق *</label>
        <div className="flex justify-center" dir="ltr">
          <InputOTP
            value={otpCode}
            onChange={(val) => {
              setOtpCode(val);
              // Touching `name` triggers the hook's clear-errors side effect.
              if (errors.otp) updateField("name", formData.name);
            }}
            maxLength={6}
            isInvalid={!!errors.otp}
            autoFocus
          >
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
        {errors.otp && (
          <p className="text-xs text-destructive font-semibold">{errors.otp}</p>
        )}
      </div>

      <Button
        type="button"
        isDisabled={loading || otpCode.length < 6}
        onPress={() => submitOtp(otpCode)}
        variant="primary"
        fullWidth
        className="text-base"
      >
        {loading ? (
          <>
            <Spinner size="sm" color="current" />
            يجري التحقّق...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            التحقّق
          </>
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={goToStep1}
          className="text-sm text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline flex items-center gap-1 mx-auto"
        >
          <ArrowRight className="w-4 h-4" />
          تغيير البريد الإلكتروني
        </button>
      </div>
    </div>
  );
}
