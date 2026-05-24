"use client";

import NotificationBell from "@/components/NotificationBell";
import SettingsMenu from "@/components/SettingsMenu";

interface TopActionsClusterProps {
  profileHref: string;
  logoutHref?: string;
}

/**
 * Sticky utility cluster (bell + settings) that lives at the top of
 * AppSidebarLayout's main column for supervisor + admin dashboards.
 *
 * Solves the discoverability gap of the previous setup, where these icons
 * were buried at the bottom of the (often long) sidebar — and stacked
 * vertically when collapsed. Mirrors the topbar pattern used by
 * DashboardLayout (student/sponsor), so every role now finds bell +
 * settings in the same screen region.
 *
 * Sticky (not fixed) so the cluster doesn't overlap modal/popover layers
 * and disappears cleanly if anyone scrolls the page itself. The wrapping
 * div is zero-height with right-aligned children — it claims no layout
 * space, just floats the chips into the page's start corner.
 */
export default function TopActionsCluster({
  profileHref,
  logoutHref,
}: TopActionsClusterProps) {
  return (
    <div className="sticky top-2 z-30 px-4 md:px-6 pointer-events-none">
      <div className="flex justify-end gap-2 pointer-events-auto">
        <NotificationBell />
        <SettingsMenu profileHref={profileHref} logoutHref={logoutHref} />
      </div>
    </div>
  );
}
