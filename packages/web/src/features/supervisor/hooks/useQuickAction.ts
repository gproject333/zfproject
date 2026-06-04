"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "@/lib/toast";
import { getConvexErrorMessage } from "@/lib/errors";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import type { SupervisorStatus } from "@smart-zuj/convex/statuses";

interface PendingAction {
  appId: Id<"applications">;
  status: SupervisorStatus;
  /** When true the ConfirmDialog renders with `notesRequired`. */
  notesRequired: boolean;
  /** Title shown in the ConfirmDialog. */
  title: string;
  /** Description shown in the ConfirmDialog. */
  description: string;
  /** Apply destructive (red) styling to the confirm button. */
  destructive: boolean;
}

/**
 * Drives the row-level quick action flow on the supervisor list:
 * `requestAction` opens a ConfirmDialog (state lives here, the caller
 * renders the dialog), `confirm` runs the mutation, and `cancel` clears
 * the pending action.
 *
 * Toast feedback + state machine errors bubble out of the mutation
 * automatically — the backend's canTransition guard returns a clear
 * Arabic message that we surface to the supervisor as-is.
 */
export function useQuickAction() {
  const updateStatus = useMutation(api.applications.supervisor.updateApplicationStatus);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestAction = useCallback((action: PendingAction) => {
    setPending(action);
  }, []);

  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(
    async (notes?: string) => {
      if (!pending) return;
      setIsSubmitting(true);
      try {
        await updateStatus({
          id: pending.appId,
          status: pending.status,
          ...(notes && notes.trim().length > 0 ? { supervisorNotes: notes } : {}),
        });
        toast.success("حُدِّث الطلب بنجاح");
        setPending(null);
      } catch (e: unknown) {
        toast.error(getConvexErrorMessage(e, "تعذّر تحديث الطلب، يُرجى المحاولة مجددًا."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [pending, updateStatus],
  );

  return { pending, isSubmitting, requestAction, cancel, confirm };
}
