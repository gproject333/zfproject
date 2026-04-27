"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

/**
 * Client-side slice over the shared `myNotifications` query — keeps the
 * dashboard widget lightweight (no extra round-trip) since the bell
 * already fetches the latest 50 notifications.
 */
export function useRecentNotifications(limit = 3) {
  const data = useQuery(api.notifications.myNotifications);
  return {
    notifications: data?.slice(0, limit) ?? [],
    loading: data === undefined,
  };
}
