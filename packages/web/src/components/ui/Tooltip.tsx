"use client";

import { Tooltip as HTooltip } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * No-op compatibility shim. React-aria handles tooltip delays per-instance
 * (no global provider needed), but we keep this export so existing
 * `<TooltipProvider>` callers don't break.
 */
export function TooltipProvider({
  children,
}: {
  children: ReactNode;
  delayDuration?: number;
}) {
  return <>{children}</>;
}

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <HTooltip>
      <HTooltip.Trigger>{children}</HTooltip.Trigger>
      <HTooltip.Content placement={side}>{content}</HTooltip.Content>
    </HTooltip>
  );
}
