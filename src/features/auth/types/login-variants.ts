import type { ReactNode } from "react";

export type LoginVariant = "student" | "admin" | "sponsor" | "supervisor";

/**
 * Each login route picks one of four LoginVariantConfigs. All four share
 * the same calm light-surface layout (DESIGN.md "The Olive Reading Room")
 * and differ only in:
 *
 *  - brand identity (icon, icon background, title, subtitle)
 *  - submit button color (per Sponsor-Only Gold Rule, only sponsor gets gold)
 *  - optional footer note (e.g. "this page is for admins only")
 *  - whether forgot-password + register links render (student only)
 */
export interface LoginVariantConfig {
  redirectTo: string;
  brand: {
    icon: ReactNode;
    /** Tailwind class for the icon's rounded-square background — `bg-primary` / `bg-accent` / `bg-secondary`. */
    iconBgClass: string;
    title: string;
    subtitle: string;
  };
  emailPlaceholder: string;
  passwordPlaceholder: string;
  submitText: string;
  /** Tailwind class for the submit button — usually a `buttonVariants(...)` call or equivalent. */
  submitButtonClass: string;
  /** Optional small note rendered below the card. */
  footerNote?: string;
  /** Show "forgot password" and "create account" links — student only. */
  showStudentLinks?: boolean;
}
