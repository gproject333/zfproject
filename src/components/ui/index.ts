/**
 * UI primitives barrel.
 *
 * Re-exports HeroUI components used across the app so callers import from
 * `@/components/ui` instead of `@heroui/react` directly. When we wrap a
 * primitive (e.g. to preset a variant), only this file changes — call sites
 * stay untouched.
 *
 * Names that collide with the existing custom wrappers (Dialog, Select,
 * DropdownMenu, Tooltip) are intentionally NOT re-exported yet. They will
 * be added phase-by-phase as the old wrappers are deleted.
 */
export {
  Button,
  buttonVariants,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Chip,
  Input,
  ListBox,
  ListBoxItem,
  TextArea,
  Skeleton,
} from "@heroui/react";

export type {
  ButtonProps,
  ButtonVariants,
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
  ChipProps,
  InputProps,
  TextAreaProps,
  SkeletonProps,
} from "@heroui/react";
