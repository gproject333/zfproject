"use client";

import { useState, useCallback } from "react";
import { FORM_EXTRA_FIELDS } from "@/lib/configs/application";
import { validatePhone } from "@/lib/validation";
import type {
  ApplicationFormData,
  ApplicationType,
  ExtraField,
  FieldValue,
  TeamMember,
} from "@/features/student/types/application-form";

export type { ApplicationType, TeamMember, ApplicationFormData };

const EMPTY_FORM_DATA: ApplicationFormData = {
  projectName: "",
  description: "",
  problemStatement: "",
  targetAudience: "",
  teamMembers: [],
};

interface UseApplicationFormArgs {
  type: ApplicationType;
  initialData?: ApplicationFormData;
}

/**
 * Validate a single form field value. Returns the Arabic error message
 * or `null` when the value is valid. Shared between the field-level
 * `validateField` and the whole-form `validate` so that the rules live
 * in exactly one place.
 */
function validateFieldValue(
  name: string,
  value: FieldValue | undefined,
  extraFields: readonly ExtraField[],
): string | null {
  if (name === "projectName") {
    if (typeof value !== "string" || !value.trim()) return "اسم المشروع مطلوب";
    return null;
  }
  if (name === "description") {
    if (typeof value !== "string" || !value.trim()) return "وصف المشروع مطلوب";
    if (value.trim().length < 50) return "الوصف يجب أن يكون 50 حرفاً على الأقل";
    return null;
  }
  if (name === "problemStatement") {
    if (typeof value !== "string" || !value.trim()) return "المشكلة مطلوبة";
    return null;
  }
  if (name === "targetAudience") {
    if (typeof value !== "string" || !value.trim())
      return "الجمهور المستهدف مطلوب";
    return null;
  }
  if (name === "phone") {
    return validatePhone(typeof value === "string" ? value : "", { required: true });
  }

  const cfg = extraFields.find((f) => f.name === name);
  if (!cfg?.required) return null;
  if (cfg.type === "multiselect") {
    if (!Array.isArray(value) || value.length === 0) return `${cfg.label} مطلوب`;
    return null;
  }
  if (typeof value !== "string" || !value.trim()) return `${cfg.label} مطلوب`;
  return null;
}

export function useApplicationForm({ type, initialData }: UseApplicationFormArgs) {
  const [formData, setFormData] = useState<ApplicationFormData>(initialData ?? EMPTY_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const extraFields = FORM_EXTRA_FIELDS[type];

  const updateField = useCallback((name: string, value: FieldValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateField = useCallback(
    (name: string, valueOverride?: FieldValue) => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        const value = valueOverride !== undefined ? valueOverride : formData[name];
        const err = validateFieldValue(name, value, extraFields);
        if (err) next[name] = err;
        return next;
      });
    },
    [formData, extraFields]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Core fields — always required regardless of application type.
    const coreFields = ["projectName", "description", "problemStatement", "targetAudience"];
    for (const name of coreFields) {
      const err = validateFieldValue(name, formData[name], extraFields);
      if (err) newErrors[name] = err;
    }

    // Team members — collect all errors so the user sees every invalid
    // member at once instead of fixing them one by one.
    const memberErrors: string[] = [];
    formData.teamMembers.forEach((member, i) => {
      const label = `عضو ${i + 1}`;
      if (!member.name.trim() || !member.phone.trim()) {
        memberErrors.push(`${label}: يجب تعبئة الاسم والرقم أو حذف العضو`);
        return;
      }
      const phoneErr = validatePhone(member.phone, { required: true });
      if (phoneErr) {
        memberErrors.push(`${label}: ${phoneErr}`);
      }
    });
    if (memberErrors.length > 0) {
      newErrors.teamMembers = memberErrors.join(" · ");
    }

    // Type-specific extra fields.
    for (const field of extraFields) {
      const err = validateFieldValue(field.name, formData[field.name], extraFields);
      if (err) newErrors[field.name] = err;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, extraFields]);

  const setFormError = useCallback((message: string) => {
    setErrors((prev) => ({ ...prev, form: message }));
  }, []);

  const resetForm = useCallback((data: ApplicationFormData = EMPTY_FORM_DATA) => {
    setFormData(data);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    extraFields,
    updateField,
    validateField,
    validate,
    setFormError,
    resetForm,
  };
}
