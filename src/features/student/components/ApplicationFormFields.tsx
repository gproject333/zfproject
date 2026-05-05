"use client";

import { Plus, X, Info, Check } from "lucide-react";
import FormField from "@/features/applications/components/FormField";
import { Tooltip } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import type { FORM_EXTRA_FIELDS } from "@/lib/configs/application";
import type {
  ApplicationFormData,
  TeamMember,
} from "@/features/student/hooks/useApplicationForm";

type ExtraField = (typeof FORM_EXTRA_FIELDS)[keyof typeof FORM_EXTRA_FIELDS][number];

interface ApplicationFormFieldsProps {
  formData: ApplicationFormData;
  errors: Record<string, string>;
  updateField: (name: string, value: string | string[] | TeamMember[]) => void;
  validateField: (name: string, valueOverride?: string | string[] | TeamMember[]) => void;
  extraFields: readonly ExtraField[];
}

function HintIcon({ text }: { text: string }) {
  return (
    <Tooltip content={text}>
      <button
        type="button"
        className="inline-flex items-center justify-center cursor-help text-muted-foreground hover:text-foreground"
        aria-label={text}
        onClick={(e) => e.preventDefault()}
      >
        <Info className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}

export default function ApplicationFormFields({
  formData,
  errors,
  updateField,
  validateField,
  extraFields,
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
      teamMembers.filter((_, i) => i !== index)
    );
  };

  const getField = (name: string) => extraFields.find((f) => f.name === name);
  const goalsField = getField("projectGoals");
  const categoryField = getField("projectCategory");
  const phoneField = getField("phone");
  const otherExtras = extraFields.filter(
    (f) => f.name !== "projectGoals" && f.name !== "projectCategory" && f.name !== "phone"
  );

  const renderExtra = (field: ExtraField) => (
    <FormField
      key={field.name}
      label={field.label}
      required={field.required}
      error={errors[field.name]}
      hint={field.hint ? <HintIcon text={field.hint} /> : undefined}
    >
      {field.type === "multiselect" ? (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const current = (formData[field.name] as string[] | undefined) ?? [];
            const selected = Array.isArray(current) && current.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const next = selected
                    ? current.filter((v) => v !== opt)
                    : [...current, opt];
                  updateField(field.name, next);
                  validateField(field.name, next);
                }}
                aria-pressed={selected}
                className={`nb-badge px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/70"
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5" />}
                {opt}
              </button>
            );
          })}
        </div>
      ) : field.type === "select" ? (
        <Select
          value={(formData[field.name] as string) ?? ""}
          onValueChange={(val) => {
            updateField(field.name, val);
            validateField(field.name, val);
          }}
        >
          <SelectTrigger hasError={!!errors[field.name]}>
            <SelectValue placeholder="اختر..." />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <textarea
          rows={3}
          className={`nb-input resize-none ${errors[field.name] ? "!border-destructive" : ""}`}
          placeholder={field.placeholder}
          value={(formData[field.name] as string) ?? ""}
          onChange={(e) => updateField(field.name, e.target.value)}
          onBlur={() => validateField(field.name)}
        />
      ) : (
        <input
          className={`nb-input ${errors[field.name] ? "!border-destructive" : ""}`}
          placeholder={field.placeholder}
          value={(formData[field.name] as string) ?? ""}
          onChange={(e) => updateField(field.name, e.target.value)}
          onBlur={() => validateField(field.name)}
        />
      )}
    </FormField>
  );

  return (
    <div className="space-y-4">
      {/* 1. Project name */}
      <FormField label="اسم المشروع" required error={errors.projectName}>
        <input
          className={`nb-input ${errors.projectName ? "!border-destructive" : ""}`}
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
            <HintIcon text="اشرح المشروع بوضوح — ما يفعله، لمن، وما يميزه. 50 حرف على الأقل." />
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
        <textarea
          rows={4}
          className={`nb-input resize-none ${errors.description ? "!border-destructive" : ""}`}
          placeholder="اكتب وصفاً شاملاً لمشروعك (50 حرف على الأقل)..."
          value={(formData.description as string) ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          onBlur={() => validateField("description")}
        />
      </FormField>

      {/* 3. Goals (type-specific, optional slot) */}
      {goalsField && renderExtra(goalsField)}

      {/* 4. Problem statement */}
      <FormField label="المشكلة التي يحلها المشروع" required error={errors.problemStatement}>
        <textarea
          rows={3}
          className={`nb-input resize-none ${errors.problemStatement ? "!border-destructive" : ""}`}
          placeholder="ما المشكلة التي يعالجها مشروعك؟"
          value={(formData.problemStatement as string) ?? ""}
          onChange={(e) => updateField("problemStatement", e.target.value)}
          onBlur={() => validateField("problemStatement")}
        />
      </FormField>

      {/* 5. Target audience */}
      <FormField label="الجمهور المستهدف" required error={errors.targetAudience}>
        <input
          className={`nb-input ${errors.targetAudience ? "!border-destructive" : ""}`}
          placeholder="مثال: طلاب الجامعات في الأردن"
          value={(formData.targetAudience as string) ?? ""}
          onChange={(e) => updateField("targetAudience", e.target.value)}
          onBlur={() => validateField("targetAudience")}
        />
      </FormField>

      {/* 6. Project category */}
      {categoryField && renderExtra(categoryField)}

      {/* 7. Other type-specific extras (supervisor, universityBenefit, targetLocation...) */}
      {otherExtras.map(renderExtra)}

      {/* 8. Team members */}
      <FormField label="أعضاء الفريق" error={errors.teamMembers}>
        <div className="space-y-2">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                className="nb-input flex-1"
                placeholder="اسم العضو"
                value={member.name}
                onChange={(e) => updateMember(i, { name: e.target.value })}
              />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="nb-input flex-1"
                placeholder="07XXXXXXXX"
                value={member.phone}
                onChange={(e) =>
                  updateMember(i, { phone: e.target.value.replace(/\D/g, "") })
                }
              />
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="w-10 h-10 nb-border rounded-lg flex items-center justify-center bg-card shrink-0 hover:bg-destructive hover:text-white transition-colors"
                aria-label="حذف عضو"
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

      {/* 9. Phone — dedicated slot with digits-only filter */}
      {phoneField && (
        <FormField
          label="رقم الهاتف"
          required
          error={errors.phone}
          hint={<HintIcon text="10 أرقام تبدأ بـ 07" />}
        >
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className={`nb-input ${errors.phone ? "!border-destructive" : ""}`}
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
