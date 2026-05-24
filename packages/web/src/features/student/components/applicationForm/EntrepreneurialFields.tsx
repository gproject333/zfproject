"use client";

import {
  pickField,
  renderExtraField,
  type FieldSlot,
  type TypeFieldsProps,
} from "./shared";

interface EntrepreneurialFieldsProps extends TypeFieldsProps {
  slot: FieldSlot;
}

/**
 * Per-type field block for the `entrepreneurial_idea` application
 * variant. Owns `projectGoals` (afterDescription) and
 * `projectCategory` (beforeTeam). The `phone` field is rendered by
 * the parent because it needs the shared digits-only filter.
 */
export default function EntrepreneurialFields({
  slot,
  ...props
}: EntrepreneurialFieldsProps) {
  if (slot === "afterDescription") {
    const goals = pickField(props.extraFields, "projectGoals");
    return goals ? renderExtraField(goals, props) : null;
  }

  if (slot === "beforeTeam") {
    const category = pickField(props.extraFields, "projectCategory");
    return category ? renderExtraField(category, props) : null;
  }

  return null;
}
