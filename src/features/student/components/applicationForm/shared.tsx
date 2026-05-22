"use client";

import { Info, Check } from "lucide-react";
import FormField from "@/features/applications/components/FormField";
import { Tooltip } from "@/components/ui/Tooltip";
import { Input, TextArea } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import type {
  ApplicationFormData,
  ExtraField,
  TeamMember,
} from "@/features/student/types/application-form";

/**
 * Shared helpers for the per-application-type field components.
 * `HintIcon` and `renderExtraField` are reused by every variant so
 * the visual treatment of each FORM_EXTRA_FIELDS entry stays in one
 * place.
 */

export function HintIcon({ text }: { text: string }) {
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

export interface TypeFieldsProps {
  formData: ApplicationFormData;
  errors: Record<string, string>;
  updateField: (name: string, value: string | string[] | TeamMember[]) => void;
  validateField: (
    name: string,
    valueOverride?: string | string[] | TeamMember[],
  ) => void;
  extraFields: readonly ExtraField[];
}

/**
 * Slot positions inside the parent form where a per-type component
 * may inject fields. Each variant decides which of its own fields
 * belong in which slot.
 *
 * - `afterDescription`: between the project description and the
 *   problem statement (used by `projectGoals`).
 * - `beforeTeam`: between the target audience and the team members
 *   list (used by `projectCategory`, `supervisor`,
 *   `universityBenefit`, `targetLocation`).
 * - `afterTeam`: after the team members list (used by the phone
 *   field, which the parent still owns to keep the digits-only
 *   filter behaviour identical).
 */
export type FieldSlot = "afterDescription" | "beforeTeam" | "afterTeam";

/**
 * Render a single FORM_EXTRA_FIELDS entry using the right control
 * for its `type` (multiselect / select / textarea / text). Each
 * per-type component picks the entries it owns from `extraFields`
 * and forwards them here.
 */
export function renderExtraField(
  field: ExtraField,
  props: TypeFieldsProps,
) {
  const { formData, errors, updateField, validateField } = props;
  return (
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
                className={`ds-badge px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
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
        <TextArea
          rows={3}
          fullWidth
          className={`resize-none ${errors[field.name] ? "!border-destructive" : ""}`}
          placeholder={field.placeholder}
          value={(formData[field.name] as string) ?? ""}
          onChange={(e) => updateField(field.name, e.target.value)}
          onBlur={() => validateField(field.name)}
        />
      ) : (
        <Input
          fullWidth
          className={errors[field.name] ? "!border-destructive" : ""}
          placeholder={field.placeholder}
          value={(formData[field.name] as string) ?? ""}
          onChange={(e) => updateField(field.name, e.target.value)}
          onBlur={() => validateField(field.name)}
        />
      )}
    </FormField>
  );
}

/**
 * Pull a single field config out of `extraFields` by name. Returns
 * `undefined` when the variant doesn't define that field — callers
 * use it to render nothing for missing entries.
 */
export function pickField(
  extraFields: readonly ExtraField[],
  name: string,
): ExtraField | undefined {
  return extraFields.find((f) => f.name === name);
}
