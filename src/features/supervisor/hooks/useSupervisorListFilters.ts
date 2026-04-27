"use client";

import { useEffect, useMemo, useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { SortingState, RowSelectionState } from "@tanstack/react-table";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { normalizeArabic } from "@/lib/utils";

export type Row = Doc<"applications"> & {
  studentName: string;
  studentDepartment: string;
};

type TypeKey = keyof typeof TYPE_CONFIG;

/** The 4 supervisor-visible statuses accepted by the list query. */
export type ServerStatusFilter =
  | "under_review"
  | "needs_modification"
  | "accepted"
  | "rejected";

export const SUPERVISOR_STATUS_KEYS: ServerStatusFilter[] = [
  "under_review",
  "needs_modification",
  "accepted",
  "rejected",
];

export const SUPERVISOR_TYPE_KEYS: TypeKey[] = [
  "entrepreneurial_idea",
  "it_graduation",
  "university_entrepreneurial",
];

const PAGE_SIZE = 50;

/**
 * Owns all filter / pagination / selection / sorting state for the
 * supervisor applications list. Returns the derived `filtered` row set
 * plus handlers the component wires into the UI. The table instance
 * (useReactTable) stays in the component since its API is not memo-safe.
 */
export function useSupervisorListFilters() {
  const searchParams = useSearchParams();

  // Coerce the URL ?status= value through the valid keys so a stale
  // bookmarked "pending" safely falls back to "all" instead of blowing
  // up the Convex validator.
  const rawStatus = searchParams.get("status");
  const initialStatus: string =
    rawStatus && (SUPERVISOR_STATUS_KEYS as readonly string[]).includes(rawStatus)
      ? rawStatus
      : "all";

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const sortDir: "asc" | "desc" =
    sorting[0]?.id === "createdAt" && sorting[0]?.desc === false ? "asc" : "desc";

  const queryArgs = useMemo(() => {
    const args: {
      status?: ServerStatusFilter;
      type?: TypeKey;
      sortDir?: "asc" | "desc";
    } = {};
    if (statusFilter !== "all") args.status = statusFilter as ServerStatusFilter;
    if (typeFilter !== "all") args.type = typeFilter as TypeKey;
    args.sortDir = sortDir;
    return args;
  }, [statusFilter, typeFilter, sortDir]);

  const {
    results: applications,
    status: pageStatus,
    loadMore,
  } = usePaginatedQuery(
    api.applications.supervisor.listApplicationsWithStudent,
    queryArgs,
    { initialNumItems: PAGE_SIZE },
  );

  const facets = useQuery(api.applications.supervisor.filterFacets, {});

  // Clear row selection whenever server args change so bulk actions
  // can't fire on rows the supervisor can no longer see.
  useEffect(() => {
    setRowSelection({});
  }, [queryArgs.status, queryArgs.type, queryArgs.sortDir]);

  const normalizedSearch = useMemo(
    () => (search ? normalizeArabic(search) : ""),
    [search],
  );

  const haystacks = useMemo(
    () =>
      new Map(
        applications.map((a) => [
          a._id,
          normalizeArabic(a.projectName) + " " + normalizeArabic(a.studentName),
        ]),
      ),
    [applications],
  );

  const filtered = useMemo<Row[]>(() => {
    return applications.filter((a) => {
      if (
        departmentFilter !== "all" &&
        a.studentDepartment !== departmentFilter
      )
        return false;
      if (dateRange !== "all") {
        const days = dateRange === "day" ? 1 : dateRange === "week" ? 7 : 30;
        // eslint-disable-next-line react-hooks/purity
        const cutoff = Date.now() - days * 86400000;
        if (a.updatedAt < cutoff) return false;
      }
      if (normalizedSearch) {
        if (!haystacks.get(a._id)?.includes(normalizedSearch)) return false;
      }
      return true;
    });
  }, [applications, departmentFilter, dateRange, normalizedSearch, haystacks]);

  const hasClientFilters =
    departmentFilter !== "all" ||
    dateRange !== "all" ||
    normalizedSearch.length > 0;
  const showIncompletePagesBanner =
    hasClientFilters && pageStatus === "CanLoadMore";

  const activeFilterCount = [
    statusFilter !== "all",
    typeFilter !== "all",
    departmentFilter !== "all",
    dateRange !== "all",
    search !== "",
  ].filter(Boolean).length;

  const selectedIds = useMemo(
    () => Object.keys(rowSelection) as Id<"applications">[],
    [rowSelection],
  );

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setDepartmentFilter("all");
    setDateRange("all");
    setSearch("");
  };

  return {
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
    loadMore: () => loadMore(PAGE_SIZE),
    loading: pageStatus === "LoadingFirstPage",
    showIncompletePagesBanner,
    activeFilterCount,
    selectedIds,
    clearFilters,
    pageSize: PAGE_SIZE,
  };
}
