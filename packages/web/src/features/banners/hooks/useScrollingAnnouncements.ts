"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import type { Doc } from "@smart-zuj/convex";
import { storage } from "@/lib/storage";

const STORAGE_KEY = "dismissed-scrolling-announcements";

function getDismissedIds(): Set<string> {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistDismissedIds(ids: Set<string>): void {
  storage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

interface UseScrollingAnnouncementsResult {
  /** The most recent non-dismissed, non-expired scrolling banner (or null). */
  announcement: Doc<"banners"> | null;
  /** Dismiss the current announcement (persists in localStorage). */
  dismiss: () => void;
}

/**
 * Fetches active scrolling announcements for the given audience, filters
 * out dismissed and client-side-expired entries, and returns only the
 * most recent one to avoid stacking multiple marquee bars.
 */
export function useScrollingAnnouncements(
  audience: "student" | "landing" | "supervisor",
): UseScrollingAnnouncementsResult {
  const banners = useQuery(api.banners.listActiveScrolling, { audience });
  // Lazy-init reads the storage adapter on first render. Safe during SSR
  // because the adapter is backed by an in-memory map when `window` is not
  // available — and `banners` is `undefined` until the Convex query
  // resolves client-side, so nothing renders that depends on this value
  // before hydration.
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(getDismissedIds);
  const [now, setNow] = useState(Date.now);

  // Re-check expiry every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const visible =
    banners?.filter(
      (b) =>
        !dismissedIds.has(b._id) &&
        (b.expiresAt === undefined || b.expiresAt > now),
    ) ?? [];

  const announcement = visible.length > 0 ? visible[0] : null;

  const dismiss = useCallback(() => {
    if (!announcement) return;
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(announcement._id);
      persistDismissedIds(next);
      return next;
    });
  }, [announcement]);

  return { announcement, dismiss };
}
