"use client";

import {
  pickField,
  renderExtraField,
  type FieldSlot,
  type TypeFieldsProps,
} from "./shared";

interface ItGraduationFieldsProps extends TypeFieldsProps {
  slot: FieldSlot;
}

/**
 * Per-type field block for the `it_graduation` application variant.
 * Owns `projectGoals` (afterDescription) plus `projectCategory` and
 * the academic `supervisor` field (beforeTeam). `phone` stays in
 * the parent for shared digits-only handling.
 */
export default function ItGraduationFields({
  slot,
  ...props
}: ItGraduationFieldsProps) {
  if (slot === "afterDescription") {
    const goals = pickField(props.extraFields, "projectGoals");
    return goals ? renderExtraField(goals, props) : null;
  }

  if (slot === "beforeTeam") {
    const category = pickField(props.extraFields, "projectCategory");
    const supervisor = pickField(props.extraFields, "supervisor");
    return (
      <>
        {category && renderExtraField(category, props)}
        {supervisor && renderExtraField(supervisor, props)}
      </>
    );
  }

  return null;
}
