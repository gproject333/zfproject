"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

/**
 * First page of the student's applications, limited for dashboard
 * widget use. Reuses the existing paginated `myApplications` query
 * instead of introducing a new backend helper.
 */
export function useRecentApplications(limit = 3) {
  const data = useQuery(api.applications.student.myApplications, {
    paginationOpts: { numItems: limit, cursor: null },
  });
  return {
    applications: data?.page ?? [],
    loading: data === undefined,
  };
}
