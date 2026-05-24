"use client";

import { Dropdown, Separator } from "@heroui/react";
import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({ children, open, onOpenChange }: DropdownMenuProps) {
  return (
    <Dropdown isOpen={open} onOpenChange={onOpenChange}>
      {children}
    </Dropdown>
  );
}

interface DropdownMenuTriggerProps {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

/**
 * Renders a real `<button>` (HeroUI Dropdown.Trigger extends react-aria
 * Button). Old callsites that wrapped a `<button>` with `asChild` should
 * inline the className here instead — the trigger IS the button now.
 */
export function DropdownMenuTrigger({ children, className, ...rest }: DropdownMenuTriggerProps) {
  return (
    <Dropdown.Trigger className={className} {...rest}>
      {children}
    </Dropdown.Trigger>
  );
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

const PLACEMENT_MAP = {
  start: "bottom start",
  center: "bottom",
  end: "bottom end",
} as const;

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: DropdownMenuContentProps) {
  return (
    <Dropdown.Popover className={className} placement={PLACEMENT_MAP[align]}>
      <Dropdown.Menu>{children as ComponentProps<typeof Dropdown.Menu>["children"]}</Dropdown.Menu>
    </Dropdown.Popover>
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
    <Dropdown.Item
      onAction={onSelect}
      isDisabled={disabled}
      variant={destructive ? "danger" : "default"}
    >
      {children}
    </Dropdown.Item>
  );
}

export function DropdownMenuSeparator() {
  return <Separator orientation="horizontal" className="my-1" />;
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground">{children}</div>
  );
}

interface DropdownMenuCheckboxItemProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}

/**
 * Backwards-compatible checkbox menu item. HeroUI's Dropdown doesn't have
 * a built-in checkbox-row primitive; we render a plain Item that toggles
 * the controlled boolean and shows/hides a check icon. No callsites use
 * this currently — kept exported in case anything is added later.
 */
export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
}: DropdownMenuCheckboxItemProps) {
  return (
    <Dropdown.Item onAction={() => onCheckedChange(!checked)}>
      <span className="w-4 h-4 inline-flex items-center justify-center">
        {checked && <Check className="w-4 h-4" />}
      </span>
      {children}
    </Dropdown.Item>
  );
}
