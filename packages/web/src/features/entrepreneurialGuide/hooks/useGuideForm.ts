"use client";

import { useCallback, useState } from "react";
import { useGuideAdmin } from "./useGuideAdmin";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

/**
 * UI-layer wrapper around useGuideAdmin — owns the dialog open state
 * and the pending-delete row so GuideManager stays presentational.
 */
export function useGuideForm() {
  const admin = useGuideAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Id<"entrepreneurialGuide"> | null>(null);

  const openCreateDialog = useCallback(() => {
    admin.initCreateForm();
    setDialogOpen(true);
  }, [admin]);

  const openEditDialog = useCallback(
    (resource: Doc<"entrepreneurialGuide">) => {
      admin.startEdit(resource);
      setDialogOpen(true);
    },
    [admin],
  );

  const submit = useCallback(async () => {
    const ok = await admin.submitForm();
    if (ok) setDialogOpen(false);
  }, [admin]);

  const confirmDelete = useCallback(async () => {
    if (toDelete) await admin.remove(toDelete);
    setToDelete(null);
  }, [admin, toDelete]);

  return {
    admin,
    dialogOpen,
    setDialogOpen,
    toDelete,
    setToDelete,
    openCreateDialog,
    openEditDialog,
    submit,
    confirmDelete,
  };
}
