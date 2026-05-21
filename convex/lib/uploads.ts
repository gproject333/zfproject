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
