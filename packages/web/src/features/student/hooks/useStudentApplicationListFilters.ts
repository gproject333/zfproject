"use client";

import { useCallback, useMemo, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { normalizeArabic } from "@/lib/utils";

const PAGE_SIZE = 20;

/**
 * Manages the student's "my applications" list state: paginated fetch,
 * status pill filter (pre-seeded from `?status=` search param), search
 * box with Arabic normalization, and the derived filtered array.
 */
export function useStudentApplicationListFilters() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "all";
  const [statusFilter, setStatusFilterRaw] = useState<string>(initialStatus);
  const setStatusFilter = useCallback(
    (v: string) => setStatusFilterRaw(v),
    [],
  );
  const [search, setSearch] = useState("");

  const { results: applications, status, loadMore } = usePaginatedQuery(
    api.applications.student.myApplications,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const normalizedSearch = useMemo(
    () => (search ? normalizeArabic(search) : ""),
    [search],
  );

  const filteredApps = useMemo(
    () =>
      applications.filter((app) => {
        if (statusFilter !== "all" && app.status !== statusFilter) return false;
        if (
          normalizedSearch &&
          !normalizeArabic(app.projectName).includes(normalizedSearch)
        )
          return false;
        return true;
      }),
    [applications, statusFilter, normalizedSearch],
  );

  return {
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    filteredApps,
    status,
    loadMore: () => loadMore(PAGE_SIZE),
    pageSize: PAGE_SIZE,
  };
}
