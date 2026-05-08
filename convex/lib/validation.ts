/**
 * Centralized field-length limits + assertion helpers used by mutations
 * before persisting user input. Error messages stay in Arabic because they
 * surface directly in the UI (toast/inline-error).
 */
export const FIELD_LIMITS = {
  // applications
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

  // articles
  articleTitle: 200,
  articleSummary: 500,
  articleBody: 50000,
  articleTag: 40,

  // banners
  bannerTitle: 200,
  bannerMessage: 1000,
  bannerLinkHref: 500,
  bannerLinkLabel: 60,

  // entrepreneurial guide
  guideTitle: 200,
  guideUrl: 500,
} as const;

export type FieldLimitKey = keyof typeof FIELD_LIMITS;

const FIELD_LABELS: Record<FieldLimitKey, string> = {
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
  articleTitle: "عنوان المقال",
  articleSummary: "ملخص المقال",
  articleBody: "محتوى المقال",
  articleTag: "وسم",
  bannerTitle: "عنوان البنر",
  bannerMessage: "رسالة البنر",
  bannerLinkHref: "رابط البنر",
  bannerLinkLabel: "نص الرابط",
  guideTitle: "عنوان المورد",
  guideUrl: "رابط المورد",
};

export function assertMaxLength(
  key: FieldLimitKey,
  value: string | undefined | null,
): void {
  if (value == null) return;
  const cap = FIELD_LIMITS[key];
  if (value.length > cap) {
    throw new Error(`${FIELD_LABELS[key]} طويل جداً (الحد الأقصى ${cap} محرف)`);
  }
}

export function assertArrayItemsMaxLength(
  key: FieldLimitKey,
  values: readonly string[] | undefined | null,
): void {
  if (!values) return;
  for (const v of values) assertMaxLength(key, v);
}
