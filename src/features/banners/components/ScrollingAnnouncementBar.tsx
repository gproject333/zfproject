"use client";

import { Component, useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useScrollingAnnouncements } from "../hooks/useScrollingAnnouncements";

interface ScrollingAnnouncementBarProps {
  audience: "student" | "landing" | "supervisor";
  /**
   * "static" (default) — normal document flow, used inside sticky/fixed
   * layouts like DashboardLayout and AppSidebarLayout.
   *
   * "above-navbar" — pinned to the very top of the viewport, above a
   * fixed navbar (landing page). The parent must offset its navbar and
   * page content by the bar's height (40px) using `onVisibilityChange`.
   */
  variant?: "static" | "above-navbar";
  /**
   * Fires whenever the bar appears or disappears. Lets the landing page
   * shift its fixed navbar down while an announcement is showing.
   */
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * Lightweight error boundary that silently swallows failures (e.g. if
 * the Convex function hasn't been deployed yet) so the rest of the
 * layout keeps working.
 */
class SafeBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function ScrollingAnnouncementBarInner({
  audience,
  variant = "static",
  onVisibilityChange,
}: ScrollingAnnouncementBarProps) {
  const { announcement, dismiss } = useScrollingAnnouncements(audience);

  // Report visibility up so a fixed-navbar parent can offset itself.
  const isVisible = !!announcement;
  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  if (!announcement) return null;

  const hasLink = !!announcement.linkHref && !!announcement.linkLabel;

  const textContent = (
    <span className="inline-flex items-center gap-6 whitespace-nowrap px-8">
      <span>{announcement.message}</span>
      {hasLink && (
        <a
          href={announcement.linkHref!}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 font-extrabold hover:opacity-80 transition-opacity"
        >
          {announcement.linkLabel}
        </a>
      )}
    </span>
  );

  const bar = (
    <div
      className={`w-full bg-primary text-white overflow-hidden ${
        variant === "above-navbar"
          ? "fixed top-0 left-0 right-0 z-50"
          : "relative z-40"
      }`}
      role="marquee"
      aria-label="إعلان"
    >
      {/* Close button */}
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-md flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors"
        aria-label="إغلاق الإعلان"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Marquee track */}
      <div className="nb-marquee-track py-2.5 pr-10">
        <div className="animate-marquee motion-reduce:hidden font-bold text-sm">
          {textContent}
          {textContent}
        </div>

        <div className="hidden motion-reduce:block font-bold text-sm text-center truncate px-10">
          {announcement.message}
          {hasLink && (
            <>
              {" "}
              <a
                href={announcement.linkHref!}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 font-extrabold"
              >
                {announcement.linkLabel}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return bar;
}

/**
 * Full-width marquee bar that displays the most recent active scrolling
 * announcement for the given audience. Sits directly under the navbar.
 *
 * Wrapped in an error boundary so a missing Convex deployment won't
 * crash the entire layout.
 */
export default function ScrollingAnnouncementBar(
  props: ScrollingAnnouncementBarProps,
) {
  return (
    <SafeBoundary>
      <ScrollingAnnouncementBarInner {...props} />
    </SafeBoundary>
  );
}
