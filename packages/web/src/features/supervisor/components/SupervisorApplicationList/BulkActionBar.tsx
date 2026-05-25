"use client";

import { CheckCircle2, XCircle, AlertTriangle, X as XIcon } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { useBulkAction } from "@/features/supervisor/hooks/useBulkAction";
import type { useApplicationFilters } from "@/features/supervisor/hooks/useApplicationFilters";

type BulkAction = ReturnType<typeof useBulkAction>;
type Filters = ReturnType<typeof useApplicationFilters>;

interface BulkActionBarProps {
  selectedIds: Filters["selectedIds"];
  setRowSelection: Filters["setRowSelection"];
  bulkAction: BulkAction;
}

export function BulkActionBar({
  selectedIds,
  setRowSelection,
  bulkAction,
}: BulkActionBarProps) {
  return (
    <Card
      className="border-accent border-[3px] bg-accent/5 p-3 mb-4 flex flex-wrap items-center gap-3 sticky top-4 z-10"
      role="toolbar"
      aria-label="إجراءات على الطلبات المحدَّدة"
    >
      <span className="font-extrabold">
        تم تحديد {selectedIds.length} طلب
      </span>
      <div className="flex flex-wrap gap-2 mr-auto">
        <Button
          type="button"
          onPress={() =>
            bulkAction.requestAction({
              ids: selectedIds,
              status: "accepted",
              notesRequired: false,
              title: `قبول ${selectedIds.length} طلب`,
              description: "سيُقبَل جميع الطلبات المحدَّدة المؤهَّلة، ويُبلَّغ الطلاب بذلك",
              destructive: false,
            })
          }
          variant="primary"
          size="sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          قبول
        </Button>
        <Button
          type="button"
          onPress={() =>
            bulkAction.requestAction({
              ids: selectedIds,
              status: "needs_modification",
              notesRequired: true,
              title: `طلب تعديل من ${selectedIds.length} طالب`,
              description: "سيُطلَب التعديل على جميع الطلبات المؤهَّلة",
              destructive: false,
            })
          }
          variant="outline"
          size="sm"
        >
          <AlertTriangle className="w-4 h-4" />
          يحتاج تعديل
        </Button>
        <Button
          type="button"
          onPress={() =>
            bulkAction.requestAction({
              ids: selectedIds,
              status: "rejected",
              notesRequired: true,
              title: `رفض ${selectedIds.length} طلب`,
              description: "سيُرفَض جميع الطلبات المؤهَّلة",
              destructive: true,
            })
          }
          variant="danger"
          size="sm"
        >
          <XCircle className="w-4 h-4" />
          رفض
        </Button>
        <Button
          type="button"
          onPress={() => setRowSelection({})}
          variant="outline"
          size="sm"
          aria-label="إلغاء تحديد الطلبات"
        >
          <XIcon className="w-4 h-4" />
          إلغاء التحديد
        </Button>
      </div>
    </Card>
  );
}
