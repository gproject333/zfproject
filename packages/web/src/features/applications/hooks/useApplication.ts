"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

/**
 * Loads an application along with its PDF and video file URLs.
 * Used by student, supervisor, and sponsor detail pages.
 */
export function useApplication(appId: Id<"applications">) {
  const app = useQuery(api.applications.shared.getApplication, { id: appId });
  const pdfUrl = useQuery(
    api.files.getFileUrl,
    app?.pdfFileId ? { id: app.pdfFileId, applicationId: appId } : "skip"
  );
  const videoUrl = useQuery(
    api.files.getFileUrl,
    app?.videoFileId ? { id: app.videoFileId, applicationId: appId } : "skip"
  );

  return {
    app,
    pdfUrl,
    videoUrl,
    isLoading: app === undefined,
  };
}
