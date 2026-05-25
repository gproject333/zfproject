"use client";

import { useRouter } from "next/navigation";
import { flexRender, type Table as ReactTable } from "@tanstack/react-table";
import { Button, Spinner } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import type { useApplicationFilters } from "@/features/supervisor/hooks/useApplicationFilters";

type Filters = ReturnType<typeof useApplicationFilters>;

interface ApplicationsTableProps {
  table: ReactTable<Filters["filtered"][number]>;
  filtered: Filters["filtered"];
  pageStatus: Filters["pageStatus"];
  loadMore: Filters["loadMore"];
}

export function ApplicationsTable({
  table,
  filtered,
  pageStatus,
  loadMore,
}: ApplicationsTableProps) {
  const router = useRouter();

  return (
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
              جارٍ التحميل...
            </span>
          )}
        </div>
      </div>
    </>
  );
}
