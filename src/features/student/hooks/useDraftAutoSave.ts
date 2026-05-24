"use client";

import { useEffect, useRef, useState } from "react";
import type { ApplicationFormData } from "@/features/student/types/application-form";
import type { ApplicationType } from "@/features/student/hooks/useApplicationForm";

const STORAGE_PREFIX = "smartzuj.app-draft.";
const DEBOUNCE_MS = 800;

interface SavedDraft {
  formData: ApplicationFormData;
  savedAt: number;
}

interface DraftAutoSaveResult {
  /** When non-null, a draft existed from a previous session; show a restore prompt. */
  pendingRestore: SavedDraft | null;
  /** Apply the pending draft to the form (consumer must call resetForm). */
  acceptRestore: () => void;
  /** Throw the pending draft away. */
  dismissRestore: () => void;
  /** Call this from a successful submit/draft-save so we don't keep stale data. */
  clearDraft: () => void;
}

/**
 * Auto-save the application-create form state to localStorage and warn on
 * tab close while there are unsaved edits. Files can't be persisted (the
 * browser owns them), but every other field is recovered if the student
 * navigates away or crashes the tab.
 *
 * Restore-on-mount is offered (not forced) — if there's a previous draft,
 * the consumer renders a small prompt asking the student whether to
 * resume or start fresh. The hook only sees the formData snapshot; it
 * doesn't reach into the form's API to apply the data itself.
 */
export function useDraftAutoSave(
  type: ApplicationType,
  formData: ApplicationFormData,
  isDirty: boolean,
  isSubmitting: boolean,
): DraftAutoSaveResult {
  const storageKey = `${STORAGE_PREFIX}${type}`;
  const [pendingRestore, setPendingRestore] = useState<SavedDraft | null>(null);
  const hasMounted = useRef(false);

  // Read any pre-existing draft on mount and offer it back. Skipped if the
  // form was already non-empty (e.g., navigated from another sub-route).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedDraft;
      if (parsed?.formData?.projectName !== undefined) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPendingRestore(parsed);
      }
    } catch {
      /* ignore corrupted draft */
    }
    hasMounted.current = true;
  }, [storageKey]);

  // Debounced auto-save on every form change after mount.
  useEffect(() => {
    if (!hasMounted.current || isSubmitting) return;
    if (!isDirty) return;
    const id = window.setTimeout(() => {
      try {
        const payload: SavedDraft = { formData, savedAt: Date.now() };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {
        /* private mode / quota — silently give up */
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [storageKey, formData, isDirty, isSubmitting]);

  // Warn the student before closing/reloading the tab with unsaved edits.
  useEffect(() => {
    if (!isDirty || isSubmitting) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isSubmitting]);

  const acceptRestore = () => setPendingRestore(null);
  const dismissRestore = () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setPendingRestore(null);
  };
  const clearDraft = () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  };

  return { pendingRestore, acceptRestore, dismissRestore, clearDraft };
}

/** Cheap "dirty" check used by the form so we don't autosave an empty shell. */
export function isFormDirty(formData: ApplicationFormData): boolean {
  if (formData.projectName?.trim()) return true;
  if (formData.description?.trim()) return true;
  if (formData.problemStatement?.trim()) return true;
  if (formData.targetAudience?.trim()) return true;
  if (formData.teamMembers.length > 0) return true;
  // Any extra/type-specific field with a truthy value counts as dirty.
  for (const key of Object.keys(formData)) {
    if (["projectName", "description", "problemStatement", "targetAudience", "teamMembers"].includes(key))
      continue;
    const v = formData[key];
    if (Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() : !!v) {
      return true;
    }
  }
  return false;
}
