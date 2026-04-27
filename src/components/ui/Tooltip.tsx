"use client";

import * as RTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export const TooltipProvider = RTooltip.Provider;

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <RTooltip.Root delayDuration={150}>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          dir="rtl"
          side={side}
          sideOffset={6}
          className="nb-card nb-shadow px-3 py-2 text-xs font-bold max-w-xs z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {content}
          <RTooltip.Arrow className="fill-foreground" width={12} height={6} />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
