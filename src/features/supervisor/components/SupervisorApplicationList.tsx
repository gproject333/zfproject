"use client";

import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {FileText, Search, X as XIcon, CheckCircle2, XCircle, AlertTriangle, Info} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/configs/application";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button, Input, Spinner, Card} from "@/components/ui";
import { useQuickAction } from "@/features/supervisor/hooks/useQuickAction";
import { useBulkAction } from "@/features/supervisor/hooks/useBulkAction";
import { useApplicationListColumns } from "@/features/supervisor/hooks/useApplicationListColumns";
import {
  useSupervisorListFilters,
  SUPERVISOR_STATUS_KEYS,
  SUPERVISOR_TYPE_KEYS,
} from "@/features/supervisor/hooks/useSupervisorListFilters";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

/**
 * Supervisor applications list. Filter state / paginated fetch /
 * selection lives in useSupervisorListFilters. CSV export in
 * useApplicationCsvExport. Per-row and bulk action flows in their own
 * hooks. This component wires them into the react-table instance and
 * the UI.
 */
export default function SupervisorApplicationList() {
  const router = useRouter();
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
  } = useSupervisorListFilters();

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
          <FileText className="w-6 h-6 text-accent" />
          إدارة الطلبات
          {!loading && (
            <span className="text-base font-bold text-muted-foreground">
              — {filtered.length} طلب
            </span>
          )}
        </h2>
      </div>

      {selectedIds.length > 0 && (
        <Card
          className="border-accent border-[3px] bg-accent/5 p-3 mb-4 flex flex-wrap items-center gap-3 sticky top-4 z-10"
          role="toolbar"
          aria-label="إجراءات على الطلبات المحددة"
        >
          <span className="font-extrabold">
            تم اختيار {selectedIds.length} طلب
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
                  description: "سيتم قبول جميع الطلبات المحددة المؤهلة وإشعار الطلاب",
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
                  description: "سيتم طلب التعديل على جميع الطلبات المؤهلة",
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
                  description: "سيتم رفض جميع الطلبات المؤهلة",
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
              aria-label="مسح اختيار الطلبات"
            >
              <XIcon className="w-4 h-4" />
              مسح
            </Button>
          </div>
        </Card>
      )}

      <div
        className="flex flex-wrap items-center gap-3 mb-4"
        role="search"
        aria-label="تصفية الطلبات"
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث بالمشروع أو الطالب..."
            aria-label="بحث في الطلبات"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            className="pr-12 text-sm"
          />
        </div>

        <div className="min-w-[140px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="تصفية حسب الحالة">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {SUPERVISOR_STATUS_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {STATUS_CONFIG[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[140px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger aria-label="تصفية حسب النوع">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              {SUPERVISOR_TYPE_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {TYPE_CONFIG[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[140px]">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger aria-label="تصفية حسب القسم">
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأقسام</SelectItem>
              {(facets?.departments ?? []).map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[140px]">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger aria-label="تصفية حسب نطاق التاريخ">
              <SelectValue placeholder="التاريخ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التواريخ</SelectItem>
              <SelectItem value="day">آخر يوم</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {activeFilterCount > 0 && (
          <Button
            type="button"
            onPress={clearFilters}
            variant="outline"
            size="sm"
          >
            <XIcon className="w-4 h-4" />
            مسح الفلاتر ({activeFilterCount})
          </Button>
        )}
      </div>

      {showIncompletePagesBanner && (
        <Card
          className="border-info border-[2px] bg-info/5 p-3 mb-4 flex items-start gap-2 text-sm"
          role="status"
        >
          <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <p>
            هذه النتائج تظهر فقط من الصفحات المُحمّلة حتى الآن. اضغط
            <strong> &laquo;تحميل المزيد&raquo; </strong>
            في أسفل الجدول لمتابعة البحث في باقي الطلبات.
          </p>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" color="current" className="text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant={activeFilterCount > 0 ? "no-results" : "empty-inbox"}
          title={activeFilterCount > 0 ? "لا توجد نتائج" : "لا توجد طلبات"}
          description={
            activeFilterCount > 0
              ? "لا يوجد أي طلبات تطابق معايير الفلترة الحالية."
              : "لم يتم تقديم أي طلبات بعد."
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={() =>
                    router.push(`/supervisor/applications/${row.original._id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (
                          cell.column.id === "actions" ||
                          cell.column.id === "select"
                        )
                          e.stopPropagation();
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4 text-sm font-bold">
            <span className="text-muted-foreground">
              {filtered.length} طلب معروض
            </span>
            <div className="flex gap-2">
              {pageStatus === "CanLoadMore" && (
                <Button
                  type="button"
                  onPress={loadMore}
                  variant="outline"
                  size="sm"
                >
                  تحميل المزيد
                </Button>
              )}
              {pageStatus === "LoadingMore" && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Spinner size="sm" color="current" />
                  جاري التحميل...
                </span>
              )}
            </div>
          </div>
        </>
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
