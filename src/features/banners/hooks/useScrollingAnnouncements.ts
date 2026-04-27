"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";

const STORAGE_KEY = "dismissed-scrolling-announcements";

function getDismissedIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistDismissedIds(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore storage errors */
  }
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
  // Lazy-init reads localStorage on first render. Safe during SSR because
  // `getDismissedIds` catches the `window` ReferenceError and returns an
  // empty set — and `banners` is `undefined` until the Convex query
  // resolves client-side, so nothing renders that depends on this value
  // before hydration.
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() =>
    typeof window === "undefined" ? new Set() : getDismissedIds(),
  );
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
