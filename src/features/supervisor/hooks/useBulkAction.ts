"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "@/lib/toast";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { SupervisorStatus } from "../../../../convex/lib/statuses";

interface PendingBulk {
  ids: Id<"applications">[];
  status: SupervisorStatus;
  notesRequired: boolean;
  title: string;
  description: string;
  destructive: boolean;
}

/**
 * Drives the multi-row bulk action flow for the supervisor list.
 * Stores the pending action in state so the caller can render a single
 * ConfirmDialog and reads back the {succeeded, skipped} summary from
 * bulkUpdateStatus to surface a "نجح N تُجوهل M" toast — supervisors
 * always know exactly which rows couldn't transition.
 */
export function useBulkAction(onSuccess?: () => void) {
  const bulkUpdate = useMutation(api.applications.supervisor.bulkUpdateStatus);
  const [pending, setPending] = useState<PendingBulk | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestAction = useCallback((action: PendingBulk) => {
    setPending(action);
  }, []);

  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(
    async (notes?: string) => {
      if (!pending) return;
      setIsSubmitting(true);
      try {
        const result = await bulkUpdate({
          ids: pending.ids,
          status: pending.status,
          ...(notes && notes.trim().length > 0 ? { supervisorNotes: notes } : {}),
        });
        if (result.skipped.length === 0) {
          toast.success(`تم تحديث ${result.succeeded.length} طلب بنجاح`);
        } else {
          toast(`نجح: ${result.succeeded.length} — تم تجاوز: ${result.skipped.length}`, {
            description: result.skipped[0]?.reason,
          });
        }
        setPending(null);
        onSuccess?.();
      } catch (e: unknown) {
        toast.error(
          "حدث خطأ: " + (e instanceof Error ? e.message : "حاول مرة أخرى."),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [pending, bulkUpdate, onSuccess],
  );

  return { pending, isSubmitting, requestAction, cancel, confirm };
}
