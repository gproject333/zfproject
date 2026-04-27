/**
 * Tiny CSV export helper — no dependency, Arabic-safe.
 *
 * Builds a CSV string from a row array, prepends a UTF-8 BOM so Excel
 * reads Arabic correctly, and triggers a Blob download in the browser.
 *
 * Usage:
 *   exportCsv("applications.csv", rows, [
 *     { header: "المشروع", value: (r) => r.projectName },
 *     { header: "الطالب", value: (r) => r.studentName },
 *     { header: "التاريخ", value: (r) => new Date(r.createdAt).toLocaleDateString("ar-JO") },
 *   ]);
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  // RFC 4180: wrap in double quotes and escape embedded quotes by doubling
  // them if the value contains a comma, quote, or newline.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}

export function exportCsv<T>(
  filename: string,
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
): void {
  const csv = buildCsv(rows, columns);
  // UTF-8 BOM (\uFEFF) — without it, Excel misreads Arabic as mojibake.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the browser a tick to start the download before revoking the URL.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
