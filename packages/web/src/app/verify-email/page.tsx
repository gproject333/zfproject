"use client";

import { Suspense } from "react";
import OtpVerifyForm from "@/features/auth/components/OtpVerifyForm";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <OtpVerifyForm />
    </Suspense>
  );
}
