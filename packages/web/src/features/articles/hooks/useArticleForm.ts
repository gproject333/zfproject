"use client";

import { useCallback, useRef, useState } from "react";
import { useArticleAdmin } from "./useArticleAdmin";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export type ArticleDoc = Doc<"articles"> & {
  authorName?: string;
  coverUrl?: string;
};

/**
 * UI-layer wrapper around useArticleAdmin — owns the dialog open state,
 * the pending-delete row, and the file input ref so the manager
 * component can stay presentational.
 */
export function useArticleForm() {
  const admin = useArticleAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Id<"articles"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateDialog = useCallback(() => {
    admin.initCreateForm();
    setDialogOpen(true);
  }, [admin]);

  const openEditDialog = useCallback(
    (article: ArticleDoc) => {
      admin.startEdit(article);
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
    openCreateDialog,
    openEditDialog,
    submit,
    confirmDelete,
  };
}
