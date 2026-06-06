import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const UPLOAD_LIMITS = {
  pdfBytes: 10 * 1024 * 1024,
  videoBytes: 100 * 1024 * 1024,
} as const;

const PDF_MB = UPLOAD_LIMITS.pdfBytes / 1024 / 1024;
const VIDEO_MB = UPLOAD_LIMITS.videoBytes / 1024 / 1024;

async function fileSize(
  ctx: MutationCtx,
  fileId: Id<"_storage">,
): Promise<number> {
  const meta = await ctx.db.system.get(fileId);
  if (!meta) throw new Error("الملف غير موجود في التخزين");
  return meta.size;
}

/**
 * A submitted application MUST carry both a PDF and an introductory video.
 * Server-side enforcement of the rule the client form already checks, so it
 * holds even when a caller bypasses the UI and hits the mutation directly.
 * Drafts are exempt — only call this on the transition into `under_review`.
 */
export function assertAttachmentsPresent(
  pdfFileId: Id<"_storage"> | undefined,
  videoFileId: Id<"_storage"> | undefined,
): void {
  if (!pdfFileId || !videoFileId) {
    throw new Error("يجب إرفاق ملف PDF وفيديو تعريفي قبل تقديم الطلب");
  }
}

export async function assertPdfWithinLimit(
  ctx: MutationCtx,
  fileId: Id<"_storage">,
): Promise<void> {
  const size = await fileSize(ctx, fileId);
  if (size > UPLOAD_LIMITS.pdfBytes) {
    throw new Error(`ملف PDF يتجاوز الحد الأقصى (${PDF_MB} ميجابايت)`);
  }
}

export async function assertVideoWithinLimit(
  ctx: MutationCtx,
  fileId: Id<"_storage">,
): Promise<void> {
  const size = await fileSize(ctx, fileId);
  if (size > UPLOAD_LIMITS.videoBytes) {
    throw new Error(`الفيديو يتجاوز الحد الأقصى (${VIDEO_MB} ميجابايت)`);
  }
}
