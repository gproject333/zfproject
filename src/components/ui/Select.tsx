"use client";

import * as RSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type SelectRootProps = ComponentProps<typeof RSelect.Root>;

export function Select(props: SelectRootProps) {
  return <RSelect.Root dir="rtl" {...props} />;
}
export const SelectValue = RSelect.Value;

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
  hasError?: boolean;
  placeholder?: string;
}

export function SelectTrigger({
  children,
  className = "",
  hasError,
}: SelectTriggerProps) {
  return (
    <RSelect.Trigger
      className={`nb-input flex items-center justify-between w-full cursor-pointer ${
        hasError ? "!border-destructive" : ""
      } ${className}`}
    >
      {children}
      <RSelect.Icon>
        <ChevronDown className="w-4 h-4 opacity-70" />
      </RSelect.Icon>
    </RSelect.Trigger>
  );
}

interface SelectContentProps {
  children: ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  return (
    <RSelect.Portal>
      <RSelect.Content
        position="popper"
        sideOffset={6}
        className="nb-card nb-shadow z-50 min-w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)] overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
      >
        <RSelect.Viewport className="p-1">{children}</RSelect.Viewport>
      </RSelect.Content>
    </RSelect.Portal>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return (
    <RSelect.Item
      value={value}
      className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-bold rounded-md cursor-pointer outline-none data-[highlighted]:bg-muted data-[state=checked]:bg-muted/50"
    >
      <RSelect.ItemText>{children}</RSelect.ItemText>
      <RSelect.ItemIndicator>
        <Check className="w-4 h-4" />
      </RSelect.ItemIndicator>
    </RSelect.Item>
  );
}
