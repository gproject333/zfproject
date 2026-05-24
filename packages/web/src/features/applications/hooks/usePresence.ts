"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

/** Heartbeat cadence — must be smaller than PRESENCE_WINDOW_MS on the
 *  backend (30s) so a couple of missed beats don't drop us. */
const HEARTBEAT_INTERVAL_MS = 10_000;

/**
 * Real-time presence on an application detail / review page.
 *
 * On mount: immediately call joinPresence, then set an interval that
 * re-fires every 10 seconds. On unmount: call leavePresence to drop
 * out of the list cleanly. Browser close / crash is handled by the
 * backend's lazy eviction (rows older than 60s are deleted on the
 * next heartbeat, and getPresence filters out anything older than 30s).
 *
 * Returns the live list of OTHER users currently viewing the app. The
 * current user is excluded server-side so the UI naturally reads "X
 * others viewing" without filtering on the client.
 */
export function usePresence(applicationId: Id<"applications"> | undefined | null) {
  const join = useMutation(api.presence.joinPresence);
  const leave = useMutation(api.presence.leavePresence);
  const others = useQuery(
    api.presence.getPresence,
    applicationId ? { applicationId } : "skip",
  );

  useEffect(() => {
    if (!applicationId) return;
    // Fire immediately so the user appears in the list right away.
    void join({ applicationId });
    const id = setInterval(() => {
      void join({ applicationId });
    }, HEARTBEAT_INTERVAL_MS);
    return () => {
      clearInterval(id);
      void leave({ applicationId });
    };
  }, [applicationId, join, leave]);

  return others ?? [];
}
