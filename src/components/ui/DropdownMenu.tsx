"use client";

import * as RDropdown from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type DropdownMenuRootProps = ComponentProps<typeof RDropdown.Root>;

export function DropdownMenu(props: DropdownMenuRootProps) {
  return <RDropdown.Root dir="rtl" {...props} />;
}
export const DropdownMenuTrigger = RDropdown.Trigger;

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = "end",
  className = "",
}: DropdownMenuContentProps) {
  return (
    <RDropdown.Portal>
      <RDropdown.Content
        align={align}
        sideOffset={6}
        className={`glass-subtle rounded-xl min-w-[12rem] p-1 z-50 animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {children}
      </RDropdown.Content>
    </RDropdown.Portal>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export function DropdownMenuItem({
  children,
  onSelect,
  disabled,
  destructive,
}: DropdownMenuItemProps) {
  return (
    <RDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-md cursor-pointer outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50 data-[disabled]:pointer-events-none ${
        destructive
          ? "text-destructive data-[highlighted]:!bg-destructive data-[highlighted]:!text-white"
          : ""
      }`}
    >
      {children}
    </RDropdown.Item>
  );
}

export function DropdownMenuSeparator() {
  return <RDropdown.Separator className="h-px bg-border my-1" />;
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <RDropdown.Label className="px-3 py-1.5 text-xs font-bold text-muted-foreground">
      {children}
    </RDropdown.Label>
  );
}

interface DropdownMenuCheckboxItemProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
}: DropdownMenuCheckboxItemProps) {
  return (
    <RDropdown.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-md cursor-pointer outline-none data-[highlighted]:bg-muted"
    >
      <span className="w-4 h-4 flex items-center justify-center">
        <RDropdown.ItemIndicator>
          <Check className="w-4 h-4" />
        </RDropdown.ItemIndicator>
      </span>
      {children}
    </RDropdown.CheckboxItem>
  );
}
