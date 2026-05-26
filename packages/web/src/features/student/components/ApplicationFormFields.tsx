"use client";

import { Plus, X } from "lucide-react";
import FormField from "@/features/applications/components/FormField";
import { Button, Input, TextArea } from "@/components/ui";
import type {
  ApplicationFormData,
  ApplicationType,
  ExtraField,
  TeamMember,
} from "@/features/student/types/application-form";
import EntrepreneurialFields from "./applicationForm/EntrepreneurialFields";
import ItGraduationFields from "./applicationForm/ItGraduationFields";
import UniversityFields from "./applicationForm/UniversityFields";
import {
  HintIcon,
  pickField,
  type FieldSlot,
  type TypeFieldsProps,
} from "./applicationForm/shared";

interface ApplicationFormFieldsProps {
  type: ApplicationType;
  formData: ApplicationFormData;
  errors: Record<string, string>;
  updateField: (name: string, value: string | string[] | TeamMember[]) => void;
  validateField: (name: string, valueOverride?: string | string[] | TeamMember[]) => void;
  extraFields: readonly ExtraField[];
  /** When true, swap the default phone hint with a "verified via
   *  WhatsApp" note so the student knows where the prefill came from. */
  phoneVerified?: boolean;
}

/**
 * Shared scaffold for all three application variants. Renders the
 * core fields that every variant has in common (name, description,
 * problem, audience, team, phone) and delegates the type-specific
 * extras (`projectGoals`, `projectCategory`, `supervisor`,
 * `universityBenefit`, `targetLocation`) to a per-type component
 * via the `slot` prop.
 */
export default function ApplicationFormFields({
  type,
  formData,
  errors,
  updateField,
  validateField,
  extraFields,
  phoneVerified = false,
}: ApplicationFormFieldsProps) {
  const teamMembers = formData.teamMembers;

  const updateMember = (index: number, patch: Partial<TeamMember>) => {
    const next = teamMembers.map((m, i) => (i === index ? { ...m, ...patch } : m));
    updateField("teamMembers", next);
  };

  const addMember = () => {
    updateField("teamMembers", [...teamMembers, { name: "", phone: "" }]);
  };

  const removeMember = (index: number) => {
    updateField(
      "teamMembers",
      teamMembers.filter((_, i) => i !== index),
    );
  };

  const typeFieldsProps: TypeFieldsProps = {
    formData,
    errors,
    updateField,
    validateField,
    extraFields,
  };

  const renderTypeSlot = (slot: FieldSlot) => {
    if (type === "entrepreneurial_idea") {
      return <EntrepreneurialFields slot={slot} {...typeFieldsProps} />;
    }
    if (type === "it_graduation") {
      return <ItGraduationFields slot={slot} {...typeFieldsProps} />;
    }
    return <UniversityFields slot={slot} {...typeFieldsProps} />;
  };

  const phoneField = pickField(extraFields, "phone");

  return (
    <div className="space-y-4">
      {/* 1. Project name */}
      <FormField label="اسم المشروع" required error={errors.projectName}>
        <Input
          fullWidth
          className={errors.projectName ? "!border-destructive" : ""}
          placeholder="مثال: منصة ذكية لإدارة المكتبات الجامعية"
          value={(formData.projectName as string) ?? ""}
          onChange={(e) => updateField("projectName", e.target.value)}
          onBlur={() => validateField("projectName")}
        />
      </FormField>

      {/* 2. Description */}
      <FormField
        label="وصف المشروع"
        required
        error={errors.description}
        hint={
          <span className="inline-flex items-center gap-2">
            <HintIcon text="يُرجى توضيح وظيفة المشروع وجمهوره ومزاياه، بما لا يقل عن 50 حرفًا." />
            <span
              className={`text-xs font-medium ${
                ((formData.description as string)?.length ?? 0) >= 50
                  ? "text-success"
                  : "text-muted-foreground"
              }`}
            >
              {(formData.description as string)?.length ?? 0}/50
            </span>
          </span>
        }
      >
        <TextArea
          rows={4}
          fullWidth
          className={`resize-none ${errors.description ? "!border-destructive" : ""}`}
          placeholder="يُرجى كتابة وصف شامل للمشروع (50 حرفًا على الأقل)..."
          value={(formData.description as string) ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          onBlur={() => validateField("description")}
        />
      </FormField>

      {/* 3. Type-specific: goals (or nothing for university variant) */}
      {renderTypeSlot("afterDescription")}

      {/* 4. Problem statement */}
      <FormField label="المشكلة التي يعالجها المشروع" required error={errors.problemStatement}>
        <TextArea
          rows={3}
          fullWidth
          className={`resize-none ${errors.problemStatement ? "!border-destructive" : ""}`}
          placeholder="يُرجى تحديد المشكلة التي يعالجها المشروع."
          value={(formData.problemStatement as string) ?? ""}
          onChange={(e) => updateField("problemStatement", e.target.value)}
          onBlur={() => validateField("problemStatement")}
        />
      </FormField>

      {/* 5. Target audience */}
      <FormField label="الجمهور المستهدف" required error={errors.targetAudience}>
        <Input
          fullWidth
          className={errors.targetAudience ? "!border-destructive" : ""}
          placeholder="مثال: طلبة الجامعات في الأردن"
          value={(formData.targetAudience as string) ?? ""}
          onChange={(e) => updateField("targetAudience", e.target.value)}
          onBlur={() => validateField("targetAudience")}
        />
      </FormField>

      {/* 6. Type-specific: projectCategory + supervisor / universityBenefit / targetLocation */}
      {renderTypeSlot("beforeTeam")}

      {/* 7. Team members */}
      <FormField label="أعضاء الفريق" error={errors.teamMembers}>
        <div className="space-y-2">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Input
                className="flex-1"
                placeholder="اسم العضو الكامل"
                value={member.name}
                onChange={(e) => updateMember(i, { name: e.target.value })}
              />
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="flex-1"
                placeholder="07XXXXXXXX"
                value={member.phone}
                onChange={(e) =>
                  updateMember(i, { phone: e.target.value.replace(/\D/g, "") })
                }
              />
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="w-10 h-10 ds-border rounded-lg flex items-center justify-center bg-card shrink-0 hover:bg-destructive hover:text-white transition-colors"
                aria-label="حذف العضو"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            onPress={addMember}
            variant="outline"
            fullWidth
          >
            <Plus className="w-4 h-4" />
            إضافة عضو
          </Button>
        </div>
      </FormField>

      {/* 8. Phone — dedicated slot with digits-only filter, shared across all variants */}
      {phoneField && (
        <FormField
          label="رقم الهاتف"
          required
          error={errors.phone}
          hint={
            phoneVerified ? (
              <HintIcon text="📱 مرتبط بواتساب — يمكنك تعديله للمشروع." />
            ) : (
              <HintIcon text="عشرة أرقام تبدأ بـ 07." />
            )
          }
        >
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            fullWidth
            className={errors.phone ? "!border-destructive" : ""}
            placeholder="07XXXXXXXX"
            value={(formData.phone as string) ?? ""}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "");
              updateField("phone", digitsOnly);
            }}
            onBlur={() => validateField("phone")}
          />
        </FormField>
      )}
    </div>
  );
}
