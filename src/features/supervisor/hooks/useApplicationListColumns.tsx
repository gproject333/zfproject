"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { canTransition } from "../../../../convex/lib/statuses";
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/configs/application";
import { formatArabicDate } from "@/lib/formatters";
import StatusBadge from "@/features/applications/components/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import type { useQuickAction } from "./useQuickAction";

type Row = Doc<"applications"> & {
  studentName: string;
  studentDepartment: string;
};
type StatusKey = keyof typeof STATUS_CONFIG;
type TypeKey = keyof typeof TYPE_CONFIG;

/**
 * Encapsulates the react-table column definitions for the supervisor
 * application list — including the checkbox, data columns, sort
 * header, and the per-row quick-action dropdown. Extracted from
 * SupervisorApplicationList to keep the orchestrator component under
 * ~350 lines.
 */
export function useApplicationListColumns(
  quickAction: ReturnType<typeof useQuickAction>,
) {
  const router = useRouter();

  return useMemo<ColumnDef<Row>[]>(
    () => [
      // ── Selection checkbox ──
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              aria-label="تحديد كل الطلبات في الصفحة"
              checked={table.getIsAllPageRowsSelected()}
              ref={(el) => {
                if (el)
                  el.indeterminate =
                    !table.getIsAllPageRowsSelected() &&
                    table.getIsSomePageRowsSelected();
              }}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="w-4 h-4 cursor-pointer"
            />
          </label>
        ),
        cell: ({ row }) => (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              aria-label={`تحديد طلب ${row.original.projectName}`}
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 cursor-pointer"
            />
          </label>
        ),
      },

      // ── Data columns ──
      {
        accessorKey: "projectName",
        enableSorting: false,
        header: "المشروع",
        cell: ({ row }) => (
          <span className="font-bold">{row.getValue("projectName")}</span>
        ),
      },
      {
        accessorKey: "studentName",
        header: "الطالب",
        cell: ({ row }) => <span>{row.getValue("studentName")}</span>,
      },
      {
        accessorKey: "studentDepartment",
        header: "القسم",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.getValue("studentDepartment")}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "النوع",
        cell: ({ row }) => {
          const type = row.getValue("type") as TypeKey;
          const cfg = TYPE_CONFIG[type];
          return (
            <span className={`nb-badge-soft !text-white ${cfg.bgColor}`}>
              {cfg.label}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <StatusBadge status={row.getValue("status") as StatusKey} soft />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-extrabold text-xs hover:text-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            التاريخ
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatArabicDate(row.getValue("createdAt") as number)}
          </span>
        ),
      },

      // ── Actions dropdown ──
      {
        id: "actions",
        enableSorting: false,
        header: "",
        cell: ({ row }) => {
          const app = row.original;
          const canStart = canTransition(app.status, "under_review");
          const canAccept = canTransition(app.status, "accepted");
          const canReject = canTransition(app.status, "rejected");
          const canRequestChanges = canTransition(
            app.status,
            "needs_modification",
          );
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted"
                aria-label="القائمة"
              >
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`/supervisor/applications/${app._id}`)
                  }
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!canStart}
                  onSelect={() =>
                    quickAction.requestAction({
                      appId: app._id,
                      status: "under_review",
                      notesRequired: false,
                      title: "بدء المراجعة",
                      description: `وضع الطلب "${app.projectName}" قيد المراجعة`,
                      destructive: false,
                    })
                  }
                >
                  بدء المراجعة
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canAccept}
                  onSelect={() =>
                    quickAction.requestAction({
                      appId: app._id,
                      status: "accepted",
                      notesRequired: false,
                      title: "قبول الطلب",
                      description: `سيتم قبول الطلب "${app.projectName}" وإشعار الطالب`,
                      destructive: false,
                    })
                  }
                >
                  <CheckCircle2 className="w-4 h-4" />
                  قبول سريع
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canRequestChanges}
                  onSelect={() =>
                    quickAction.requestAction({
                      appId: app._id,
                      status: "needs_modification",
                      notesRequired: true,
                      title: "طلب تعديل",
                      description: `سيتم طلب تعديل من الطالب على "${app.projectName}"`,
                      destructive: false,
                    })
                  }
                >
                  <AlertTriangle className="w-4 h-4" />
                  يحتاج تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  destructive
                  disabled={!canReject}
                  onSelect={() =>
                    quickAction.requestAction({
                      appId: app._id,
                      status: "rejected",
                      notesRequired: true,
                      title: "رفض الطلب",
                      description: `سيتم رفض الطلب "${app.projectName}"`,
                      destructive: true,
                    })
                  }
                >
                  <XCircle className="w-4 h-4" />
                  رفض الطلب
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, quickAction],
  );
}
