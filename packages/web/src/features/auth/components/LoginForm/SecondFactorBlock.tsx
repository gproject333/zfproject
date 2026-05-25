"use client";

import { InputOTP } from "@/components/ui";

export function SecondFactorBlock({ otp, onChange }: { otp: string; onChange: (v: string) => void }) {
  return (
    <>
      <div className="text-center py-2">
        <p className="text-sm font-bold text-foreground">
          أُرسل رمز التحقّق إلى البريد الإلكتروني
        </p>
      </div>
      <div className="flex justify-center" dir="ltr">
        <InputOTP value={otp} onChange={onChange} maxLength={6} autoFocus>
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
    </>
  );
}
