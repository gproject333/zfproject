/**
 * Shared display formatters for Arabic (Jordan) locale.
 * Consolidates repeated inline formatting across components.
 */

export function formatArabicDate(ts: number | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString("ar-JO");
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
