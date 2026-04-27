import type { Id } from "../../../../convex/_generated/dataModel";

interface ValidateArgs {
  pdfFile: File | null;
  videoFile: File | null;
  /** Storage id of an already-uploaded PDF (edit flow only). */
  existingPdfId?: Id<"_storage">;
  /** Storage id of an already-uploaded video (edit flow only). */
  existingVideoId?: Id<"_storage">;
}

/**
 * Shared "submit-time" check used by both create and edit flows: a final
 * submission must have a PDF and a video, either freshly selected or
 * carried over from a previous save. Returns the Arabic error message or
 * `null` when all required files are present.
 */
export function validateApplicationFiles(args: ValidateArgs): string | null {
  if (!args.pdfFile && !args.existingPdfId) return "ملف PDF مطلوب";
  if (!args.videoFile && !args.existingVideoId) return "الفيديو التقديمي مطلوب";
  return null;
}
