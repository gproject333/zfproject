import type { SVGProps, ComponentType } from "react";
import { Mail, Phone, Globe, MessageCircle, Send } from "lucide-react";

export type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

// ============================================================
// Inline brand SVGs
// ============================================================
// lucide-react@1.7 does not ship brand icons, so we render minimal
// inline SVG paths here. Each component accepts the same props as a
// lucide icon so they're interchangeable at the call site. Strokes
// use `currentColor` so the footer's text color drives the icon color.

const FacebookIcon: SocialIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.99 22 12Z" />
  </svg>
);

const InstagramIcon: SocialIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon: SocialIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon: SocialIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YoutubeIcon: SocialIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export interface PlatformMeta {
  /** Canonical lowercase key stored in the database. */
  key: string;
  /** Arabic display name shown in the admin form + tooltip. */
  label: string;
  /** Icon component (lucide or inline brand SVG). */
  icon: SocialIcon;
  /** Placeholder for the URL input — helps the admin remember the format. */
  placeholder: string;
}

/**
 * Known social platforms. The schema stores `platform` as a free-form
 * string so future platforms can be added without a migration — the
 * admin form surfaces this list in a select, and the footer falls back
 * to the generic `Globe` icon for any unknown platform.
 */
export const SOCIAL_PLATFORMS: readonly PlatformMeta[] = [
  { key: "facebook", label: "فيسبوك", icon: FacebookIcon, placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "إنستغرام", icon: InstagramIcon, placeholder: "https://instagram.com/..." },
  { key: "twitter", label: "تويتر (X)", icon: TwitterIcon, placeholder: "https://x.com/..." },
  { key: "linkedin", label: "لينكدإن", icon: LinkedinIcon, placeholder: "https://linkedin.com/company/..." },
  { key: "youtube", label: "يوتيوب", icon: YoutubeIcon, placeholder: "https://youtube.com/@..." },
  { key: "whatsapp", label: "واتساب", icon: MessageCircle as SocialIcon, placeholder: "https://wa.me/962..." },
  { key: "telegram", label: "تيليغرام", icon: Send as SocialIcon, placeholder: "https://t.me/..." },
  { key: "email", label: "بريد إلكتروني", icon: Mail as SocialIcon, placeholder: "mailto:info@example.com" },
  { key: "phone", label: "هاتف", icon: Phone as SocialIcon, placeholder: "tel:+962..." },
  { key: "website", label: "موقع إلكتروني", icon: Globe as SocialIcon, placeholder: "https://..." },
] as const;

export const SOCIAL_PLATFORM_MAP: Record<string, PlatformMeta> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p]),
);

/**
 * Resolve a stored platform key back to its metadata, falling back to
 * a generic website entry for unknown values so the footer still
 * renders something useful.
 */
export function getPlatformMeta(key: string): PlatformMeta {
  return (
    SOCIAL_PLATFORM_MAP[key.toLowerCase()] ?? {
      key,
      label: key,
      icon: Globe as SocialIcon,
      placeholder: "https://...",
    }
  );
}
