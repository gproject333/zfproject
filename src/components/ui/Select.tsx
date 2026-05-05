"use client";

import { Select as HSelect, ListBox, ListBoxItem } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  isDisabled?: boolean;
}

/**
 * Controlled adapter on top of HeroUI's Select. Translates the Radix-style
 * `value` / `onValueChange` API the rest of the app uses into react-aria's
 * `selectedKey` / `onSelectionChange`.
 *
 * Empty string ↔ null: react-aria treats `null` as "nothing selected", so
 * if a caller passes `value=""` we map it to `null`, and on selection we
 * pass back the key as a string.
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
  isDisabled,
}: SelectProps) {
  return (
    <HSelect
      selectedKey={value === undefined ? undefined : value === "" ? null : value}
      defaultSelectedKey={defaultValue === "" ? null : defaultValue}
      onSelectionChange={(key) => onValueChange?.(key == null ? "" : String(key))}
      isDisabled={isDisabled}
    >
      {children}
    </HSelect>
  );
}

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
  hasError?: boolean;
  "aria-label"?: string;
}

export function SelectTrigger({
  children,
  className = "",
  hasError,
  ...rest
}: SelectTriggerProps) {
  return (
    <HSelect.Trigger
      className={`nb-input flex items-center justify-between w-full cursor-pointer ${
        hasError ? "!border-destructive" : ""
      } ${className}`}
      {...rest}
    >
      {children}
      <HSelect.Indicator>
        <ChevronDown className="w-4 h-4 opacity-70" />
      </HSelect.Indicator>
    </HSelect.Trigger>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return (
    <HSelect.Value>
      {({ defaultChildren, isPlaceholder }) =>
        isPlaceholder ? (
          <span className="text-muted-foreground">{placeholder ?? ""}</span>
        ) : (
          defaultChildren
        )
      }
    </HSelect.Value>
  );
}

interface SelectContentProps {
  children: ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  return (
    <HSelect.Popover className="min-w-[var(--trigger-width)] max-h-72 overflow-y-auto">
      <ListBox>{children}</ListBox>
    </HSelect.Popover>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <ListBoxItem id={value}>{children}</ListBoxItem>;
}
