"use client";

import { Building2, UserPlus } from "lucide-react";
import {
  FloatingPasswordInput,
  FloatingSelectInput,
} from "../FloatingFields";
import { Button, Spinner } from "@/components/ui";

interface SecurityStepProps {
  formData: {
    college: string;
    department: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    college?: string;
    department?: string;
    password?: string;
    confirmPassword?: string;
  };
  loading: boolean;
  isStudent: boolean;
  collegeNames: string[];
  departmentNames: string[];
  updateField: (
    name: "college" | "department" | "password" | "confirmPassword",
    value: string,
  ) => void;
  submitStep3: (onSuccess: () => void) => void;
  onSuccess: () => void;
}

export function SecurityStep({
  formData,
  errors,
  loading,
  isStudent,
  collegeNames,
  departmentNames,
  updateField,
  submitStep3,
  onSuccess,
}: SecurityStepProps) {
  return (
    <div className="space-y-5">
      {isStudent && (
        <>
          <FloatingSelectInput
            id="register-college"
            label="الكلية"
            value={formData.college}
            onChange={(val) => updateField("college", val)}
            error={errors.college}
            icon={<Building2 className="w-5 h-5" />}
            options={collegeNames}
            placeholderOption="يُرجى اختيار الكلية..."
            required
          />
          <FloatingSelectInput
            id="register-department"
            label="التخصّص"
            value={formData.department}
            onChange={(val) => updateField("department", val)}
            error={errors.department}
            icon={<Building2 className="w-5 h-5" />}
            options={departmentNames}
            placeholderOption={formData.college ? "يُرجى اختيار التخصّص..." : "يُرجى اختيار الكلية أولًا"}
            required
          />
        </>
      )}

      <FloatingPasswordInput
        id="register-password"
        label="كلمة المرور"
        value={formData.password}
        onChange={(val) => updateField("password", val)}
        error={errors.password}
        required
        autoComplete="new-password"
      />
      <FloatingPasswordInput
        id="register-confirmPassword"
        label="تأكيد كلمة المرور"
        value={formData.confirmPassword}
        onChange={(val) => updateField("confirmPassword", val)}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
        showEye={false}
      />

      <Button
        type="button"
        isDisabled={loading}
        onPress={() => submitStep3(onSuccess)}
        variant="primary"
        fullWidth
        className="text-base"
      >
        {loading ? (
          <>
            <Spinner size="sm" color="current" />
            يجري إنشاء الحساب...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            إنشاء الحساب
          </>
        )}
      </Button>
    </div>
  );
}
