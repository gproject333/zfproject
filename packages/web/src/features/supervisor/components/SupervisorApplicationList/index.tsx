"use client";

import {
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { FileText, Info } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Spinner, Card } from "@/components/ui";
import { useQuickAction } from "@/features/supervisor/hooks/useQuickAction";
import { useBulkAction } from "@/features/supervisor/hooks/useBulkAction";
import { useApplicationListColumns } from "@/features/supervisor/hooks/useApplicationListColumns";
import { useApplicationFilters } from "@/features/supervisor/hooks/useApplicationFilters";
import { BulkActionBar } from "./BulkActionBar";
import { FilterBar } from "./FilterBar";
import { ApplicationsTable } from "./ApplicationsTable";
import OliveSpinner from "@/components/OliveSpinner";

/**
 * Supervisor applications list. Filter state / paginated fetch /
 * selection lives in useApplicationFilters. CSV export in
 * useApplicationCsvExport. Per-row and bulk action flows in their own
 * hooks. This component wires them into the react-table instance and
 * the UI.
 */
export default function SupervisorApplicationList() {
  const {
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    departmentFilter,
    setDepartmentFilter,
    dateRange,
    setDateRange,
    search,
    setSearch,
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    filtered,
    facets,
    pageStatus,
    loadMore,
    loading,
    showIncompletePagesBanner,
    activeFilterCount,
    selectedIds,
    clearFilters,
  } = useApplicationFilters();

  const quickAction = useQuickAction();
  const bulkAction = useBulkAction(() => setRowSelection({}));
  const columns = useApplicationListColumns(quickAction);

  const table = useReactTable({
    data: filtered,
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id as string,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: { sorting, rowSelection },
    enableRowSelection: true,
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-2xl font-extrabold flex items-center gap-2 flex-wrap">
          <FileText className="w-6 h-6 text-muted-foreground" />
          إدارة الطلبات
          {!loading && (
            <span className="text-base font-bold text-muted-foreground">
              — {filtered.length} طلب
            </span>
          )}
        </h2>
      </div>

      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedIds={selectedIds}
          setRowSelection={setRowSelection}
          bulkAction={bulkAction}
        />
      )}

      <FilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        facets={facets}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
      />

      {showIncompletePagesBanner && (
        <Card
          className="border-info border-[2px] bg-info/5 p-3 mb-4 flex items-start gap-2 text-sm"
          role="status"
        >
          <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <p>
            تعرض هذه النتائج بيانات الصفحات المُحمَّلة حتى الآن فقط. اضغط
            <strong> &laquo;تحميل المزيد&raquo; </strong>
            في أسفل الجدول لمتابعة البحث في بقية الطلبات.
          </p>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <OliveSpinner size="lg" className="text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant={activeFilterCount > 0 ? "no-results" : "empty-inbox"}
          title={activeFilterCount > 0 ? "لا توجد نتائج" : "لا توجد طلبات"}
          description={
            activeFilterCount > 0
              ? "لا توجد طلبات مطابقة لمعايير التصفية الحالية."
              : "لم تُقدَّم أي طلبات بعد."
          }
        />
      ) : (
        <ApplicationsTable
          table={table}
          filtered={filtered}
          pageStatus={pageStatus}
          loadMore={loadMore}
        />
      )}

      <ConfirmDialog
        open={quickAction.pending !== null}
        onOpenChange={(open) => {
          if (!open) quickAction.cancel();
        }}
        title={quickAction.pending?.title ?? ""}
        description={quickAction.pending?.description}
        destructive={quickAction.pending?.destructive ?? false}
        withNotes
        notesRequired={quickAction.pending?.notesRequired ?? false}
        isSubmitting={quickAction.isSubmitting}
        onConfirm={(notes) => quickAction.confirm(notes)}
      />

      <ConfirmDialog
        open={bulkAction.pending !== null}
        onOpenChange={(open) => {
          if (!open) bulkAction.cancel();
        }}
        title={bulkAction.pending?.title ?? ""}
        description={bulkAction.pending?.description}
        destructive={bulkAction.pending?.destructive ?? false}
        withNotes
        notesRequired={bulkAction.pending?.notesRequired ?? false}
        isSubmitting={bulkAction.isSubmitting}
        onConfirm={(notes) => bulkAction.confirm(notes)}
      />
    </div>
  );
}
