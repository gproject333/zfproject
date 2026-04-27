"use client";

import { useCallback, useRef, useState } from "react";
import { useBannerAdmin } from "./useBannerAdmin";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export type BannerDoc = Doc<"banners">;

/**
 * UI-layer wrapper around `useBannerAdmin`. Owns the dialog open state,
 * file input ref, pending-delete selection, and the open/close helpers
 * that coordinate those with the admin form state.
 */
export function useBannerForm() {
  const admin = useBannerAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Id<"banners"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openScrollingDialog = useCallback(() => {
    admin.initScrollingForm();
    setDialogOpen(true);
  }, [admin]);

  const openHeroDialog = useCallback(() => {
    admin.initHeroForm();
    setDialogOpen(true);
  }, [admin]);

  const openEditDialog = useCallback(
    (banner: BannerDoc) => {
      admin.startEdit(banner);
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
    fileInputRef,
    openScrollingDialog,
    openHeroDialog,
    openEditDialog,
    submit,
    confirmDelete,
  };
}
