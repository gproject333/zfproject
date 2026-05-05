"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "@/lib/toast";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import {
  isSupervisorStatus,
  type SupervisorStatus,
} from "../../../../convex/lib/statuses";
import type { SupervisorRating } from "@/lib/configs/application";

export type { SupervisorStatus, SupervisorRating };

/**
 * Manages the supervisor's review-panel state and the mutation that saves it.
 *
 * Pre-populates from the loaded application so the panel reflects the
 * currently-saved status / rating / notes instead of appearing empty — this
 * also prevents the "save" button from wiping previous values when the
 * supervisor only wants to change one field.
 *
 * Resets whenever the `app._id` changes so state doesn't leak between
 * applications when the hook is reused.
 */
export function useReview(app: Doc<"applications"> | null | undefined) {
  const updateStatus = useMutation(api.applications.supervisor.updateApplicationStatus);

  // Primitive snapshots of the saved values — derived inline each render so
  // useEffect / useMemo dependency arrays stay stable and exhaustive.
  const initialStatus: SupervisorStatus | null =
    app && isSupervisorStatus(app.status) ? app.status : null;
  const initialRating: SupervisorRating | null = app?.supervisorRating ?? null;
  const initialNotes: string = app?.supervisorNotes ?? "";

  const [notes, setNotes] = useState(initialNotes);
  const [rating, setRating] = useState<SupervisorRating | null>(initialRating);
  const [status, setStatus] = useState<SupervisorStatus | null>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-sync local state whenever the underlying application changes (e.g. the
  // supervisor navigates to a different review, or Convex pushes a fresh
  // version after saving).
  useEffect(() => {
    setNotes(initialNotes);
    setRating(initialRating);
    setStatus(initialStatus);
  }, [initialNotes, initialRating, initialStatus]);

  const isDirty =
    status !== initialStatus || notes !== initialNotes || rating !== initialRating;

  const handleUpdate = useCallback(
    async (onSuccess?: () => void) => {
      if (!app) return;
      if (!status) {
        toast.error("يرجى اختيار حالة الطلب");
        return;
      }
      setIsSubmitting(true);
      try {
        // Only send fields that actually changed so the backend does not
        // treat an unchanged value as a rewrite. The backend also guards
        // this by only patching fields that are explicitly provided — see
        // convex/applications/supervisor.ts::updateApplicationStatus.
        //
        // Note on `rating ?? undefined`: local `rating` state uses `null`
        // for "no rating selected", but the Convex arg validator is
        // `v.optional(...)` which accepts `undefined`, not `null`.
        // Converting `null` → `undefined` sends the field as "unset" and
        // the backend's conditional-spread guard leaves any previously-
        // saved rating intact when the user hasn't touched the select.
        await updateStatus({
          id: app._id,
          status,
          ...(notes !== initialNotes ? { supervisorNotes: notes } : {}),
          ...(rating !== initialRating ? { supervisorRating: rating ?? undefined } : {}),
        });
        toast.success("تم حفظ التقييم بنجاح");
        onSuccess?.();
      } catch (e: unknown) {
        toast.error(
          "حدث خطأ أثناء الحفظ: " + (e instanceof Error ? e.message : "حاول مرة أخرى."),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [app, status, notes, rating, initialNotes, initialRating, updateStatus],
  );

  return {
    status,
    setStatus,
    rating,
    setRating,
    notes,
    setNotes,
    isSubmitting,
    isDirty,
    handleUpdate,
  };
}
