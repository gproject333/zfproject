/**
 * UI primitives barrel — HeroUI is the foundation. ALL UI consumers MUST
 * import from here, never from `@heroui/react` directly. An ESLint rule
 * enforces this.
 *
 * Names that collide with custom wrappers (Dialog, Select, DropdownMenu,
 * Tooltip) are intentionally NOT re-exported from HeroUI — the local
 * wrappers own that name space. `Skeleton` is similarly owned by the
 * local wrapper that composes dashboard skeletons.
 */
export {
  Accordion,
  Avatar,
  Breadcrumbs,
  Button,
  buttonVariants,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Chip,
  I18nProvider,
  Input,
  InputOTP,
  ListBox,
  ListBoxItem,
  Popover,
  RouterProvider,
  TextArea,
  Spinner,
  Switch,
  Tabs,
  Tag,
  TagGroup,
  Toast,
  toast,
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
} from "@heroui/react";

export * from "./Skeleton";
