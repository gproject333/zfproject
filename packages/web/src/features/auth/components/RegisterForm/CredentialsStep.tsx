"use client";

import { User, Hash, ArrowRight } from "lucide-react";
import {
  FloatingTextInput,
  FloatingEmailInput,
} from "../FloatingFields";
import { Button, Spinner } from "@/components/ui";

interface CredentialsStepProps {
  formData: {
    name: string;
    email: string;
    studentId: string;
  };
  errors: {
    name?: string;
    email?: string;
    studentId?: string;
  };
  loading: boolean;
  updateField: (name: "name" | "email" | "studentId", value: string) => void;
  submitStep1: () => void;
}

export function CredentialsStep({
  formData,
  errors,
  loading,
  updateField,
  submitStep1,
}: CredentialsStepProps) {
  return (
    <div className="space-y-5">
      <FloatingTextInput
        id="register-name"
        label="الاسم الكامل"
        value={formData.name}
        onChange={(val) => updateField("name", val)}
        error={errors.name}
        icon={<User className="w-5 h-5" />}
        required
        autoComplete="name"
      />
      <FloatingEmailInput
        id="register-email"
        label="البريد الإلكتروني الجامعي"
        value={formData.email}
        onChange={(val) => updateField("email", val)}
        error={errors.email}
        required
      />
      <FloatingTextInput
        id="register-studentId"
        label="الرقم الجامعي"
        value={formData.studentId}
        onChange={(val) => updateField("studentId", val)}
        error={errors.studentId}
        icon={<Hash className="w-5 h-5" />}
        required
        maxLength={9}
        inputMode="numeric"
        dir="ltr"
        autoComplete="off"
      />
      <Button
        type="button"
        isDisabled={loading}
        onPress={submitStep1}
        variant="primary"
        fullWidth
        className="text-base"
      >
        {loading ? (
          <>
            <Spinner size="sm" color="current" />
            يجري الإرسال...
          </>
        ) : (
          <>
            المتابعة <ArrowRight className="w-5 h-5 rotate-180" />
          </>
        )}
      </Button>
    </div>
  );
}
