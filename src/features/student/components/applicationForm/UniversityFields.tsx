"use client";

import {
  pickField,
  renderExtraField,
  type FieldSlot,
  type TypeFieldsProps,
} from "./shared";

interface UniversityFieldsProps extends TypeFieldsProps {
  slot: FieldSlot;
}

/**
 * Per-type field block for the `university_entrepreneurial`
 * variant. Has no `afterDescription` entry; the `beforeTeam` slot
 * carries `projectCategory`, `universityBenefit` and
 * `targetLocation`. `phone` stays in the parent.
 */
export default function UniversityFields({
  slot,
  ...props
}: UniversityFieldsProps) {
  if (slot === "beforeTeam") {
    const category = pickField(props.extraFields, "projectCategory");
    const benefit = pickField(props.extraFields, "universityBenefit");
    const location = pickField(props.extraFields, "targetLocation");
    return (
      <>
        {category && renderExtraField(category, props)}
        {benefit && renderExtraField(benefit, props)}
        {location && renderExtraField(location, props)}
      </>
    );
  }

  return null;
}
