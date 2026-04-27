export const FIELD_LIMITS = {
  projectName: 120,
  description: 3000,
  problemStatement: 2000,
  targetAudience: 1000,
  projectGoals: 2000,
  universityBenefit: 2000,
  targetLocation: 300,
  supervisor: 120,
  supervisorNotes: 2000,
  phone: 20,
  teamMemberName: 80,
  teamMemberPhone: 20,
  projectCategory: 100,
} as const;

export type FieldLimitKey = keyof typeof FIELD_LIMITS;

function fieldLabel(key: FieldLimitKey): string {
  const labels: Record<FieldLimitKey, string> = {
    projectName: "اسم المشروع",
    description: "وصف المشروع",
    problemStatement: "المشكلة",
    targetAudience: "الجمهور المستهدف",
    projectGoals: "أهداف المشروع",
    universityBenefit: "الفائدة للجامعة",
    targetLocation: "المكان المستهدف",
    supervisor: "اسم المشرف",
    supervisorNotes: "الملاحظات",
    phone: "رقم الهاتف",
    teamMemberName: "اسم عضو الفريق",
    teamMemberPhone: "رقم هاتف عضو الفريق",
    projectCategory: "نوع المشروع",
  };
  return labels[key];
}

export function assertMaxLength(
  key: FieldLimitKey,
  value: string | undefined | null,
): void {
  if (value == null) return;
  const cap = FIELD_LIMITS[key];
  if (value.length > cap) {
    throw new Error(`${fieldLabel(key)} طويل جداً (الحد الأقصى ${cap} محرف)`);
  }
}

export function assertArrayItemsMaxLength(
  key: FieldLimitKey,
  values: readonly string[] | undefined | null,
): void {
  if (!values) return;
  for (const v of values) assertMaxLength(key, v);
}
