/**
 * Toast shim — re-exports HeroUI's imperative `toast` with a sonner-compatible
 * surface so the existing call sites (toast.success / toast.error / etc.)
 * keep working unchanged.
 *
 * Migration plan: callers previously imported from "sonner". They now import
 * from "@/lib/toast". The only API rename is `toast.error` → HeroUI's
 * `toast.danger`, which we alias here.
 */
import { toast as heroToast } from "@/components/ui";
import type { ReactNode } from "react";

type ToastFn = ReturnType<typeof Object.assign>; // helper alias for any

const message = (msg: ReactNode) => heroToast(msg);

export const toast = Object.assign(message, {
  success: heroToast.success,
  error: heroToast.danger,
  info: heroToast.info,
  warning: heroToast.warning,
  promise: heroToast.promise,
  close: heroToast.close,
  clear: heroToast.clear,
}) as ToastFn & {
  success: typeof heroToast.success;
  error: typeof heroToast.danger;
  info: typeof heroToast.info;
  warning: typeof heroToast.warning;
  promise: typeof heroToast.promise;
  close: typeof heroToast.close;
  clear: typeof heroToast.clear;
};
