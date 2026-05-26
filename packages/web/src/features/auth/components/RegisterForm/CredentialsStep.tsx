"use client";

import { User, ArrowRight } from "lucide-react";
import {
  FloatingTextInput,
  FloatingEmailInput,
} from "../FloatingFields";
import { Button, Spinner } from "@/components/ui";

interface CredentialsStepProps {
  formData: {
    name: string;
    email: string;
  };
  errors: {
    name?: string;
    email?: string;
  };
  loading: boolean;
  updateField: (name: "name" | "email", value: string) => void;
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
