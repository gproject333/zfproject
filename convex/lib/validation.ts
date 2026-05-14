import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

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

// ============================================
// التحقق من البريد الجامعي
// ============================================

/** Al-Zaytoonah email domains accepted for self-service registration. */
export const UNIVERSITY_EMAIL_DOMAINS = [
  "@zuj.edu.jo",
  "@std-zuj.edu.jo",
  "@std.zuj.edu.jo",
] as const;

/** True when `email` belongs to an Al-Zaytoonah domain (case-insensitive). */
export function isUniversityEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return UNIVERSITY_EMAIL_DOMAINS.some((domain) => normalized.endsWith(domain));
}

// ============================================
// التحقق من حجم الملفات المرفوعة
// ============================================

/** Upload size caps in bytes — mirrored on the client in useFileUpload.ts. */
export const FILE_SIZE_LIMITS = {
  pdf: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Rejects an attached storage file that exceeds its size cap. The client
 * enforces the same limit before upload, but a direct POST to the upload
 * URL bypasses that — so the size is re-checked server-side once the file
 * is attached to an application.
 */
export async function assertFileWithinLimit(
  ctx: MutationCtx,
  kind: "pdf" | "video",
  storageId: Id<"_storage"> | undefined,
): Promise<void> {
  if (!storageId) return;
  const meta = await ctx.db.system.get(storageId);
  if (!meta) throw new Error("الملف المرفوع غير موجود");
  const cap = FILE_SIZE_LIMITS[kind];
  if (meta.size > cap) {
    const capMb = Math.round(cap / (1024 * 1024));
    throw new Error(
      kind === "pdf"
        ? `حجم ملف PDF يتجاوز الحد الأقصى المسموح (${capMb}MB)`
        : `حجم الفيديو يتجاوز الحد الأقصى المسموح (${capMb}MB)`,
    );
  }
}
