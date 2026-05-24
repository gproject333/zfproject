"use client";

import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";

/**
 * Applications that currently need the student's action — status
 * `needs_modification`. Reuses the paginated `myApplications` query
 * (a single student never has hundreds of applications, so the first
 * page is a safe upper bound) instead of adding a backend helper.
 */
export function useAttentionApplications() {
  const data = useQuery(api.applications.student.myApplications, {
    paginationOpts: { numItems: 50, cursor: null },
  });
  const page = data?.page ?? [];
  return {
    applications: page.filter((a) => a.status === "needs_modification"),
    loading: data === undefined,
  };
}
