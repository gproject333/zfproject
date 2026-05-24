"use client";

import { useCallback } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { STATUS_LABELS } from "../../../../convex/lib/statuses";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { formatArabicDate } from "@/lib/formatters";
import { exportCsv } from "@/lib/exportCsv";

type Row = Doc<"applications"> & {
  studentName: string;
  studentDepartment: string;
};

/**
 * Returns a handler that downloads the passed rows as a UTF-8 CSV with
 * the standard supervisor column set. Filename is stamped with today's
 * date so repeated exports don't overwrite each other.
 */
export function useApplicationCsvExport() {
  return useCallback((rows: readonly Row[]) => {
    exportCsv(
      `applications-${new Date().toISOString().slice(0, 10)}.csv`,
      rows,
      [
        { header: "المشروع", value: (r) => r.projectName },
        { header: "الطالب", value: (r) => r.studentName },
        { header: "القسم", value: (r) => r.studentDepartment },
        { header: "النوع", value: (r) => TYPE_CONFIG[r.type].label },
        { header: "الحالة", value: (r) => STATUS_LABELS[r.status] },
        { header: "تاريخ التقديم", value: (r) => formatArabicDate(r.createdAt) },
        { header: "آخر تحديث", value: (r) => formatArabicDate(r.updatedAt) },
      ],
    );
  }, []);
}
