"use client";

import { ReactNode } from "react";
import RoleGuard from "@/components/RoleGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppFooter from "@/components/AppFooter";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";
import SupervisorSidebar, { type SupervisorNavItem } from "./SupervisorSidebar";

export type { SupervisorNavItem };

interface Props {
  navItems: SupervisorNavItem[];
  children: ReactNode;
}

/**
 * Supervisor route layout: the shared {@link SupervisorSidebar} next to
 * the page content. No top navbar — notifications, settings, and the
 * collapse toggle live in the sidebar foot; mobile opens it via a
 * floating button.
 */
export default function SupervisorSidebarLayout({ navItems, children }: Props) {
  return (
    <RoleGuard allowedRoles={["supervisor"]}>
      <div className="min-h-screen bg-pattern flex flex-col md:flex-row">
        <SupervisorSidebar navItems={navItems} />

        {/* Main content column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ScrollingAnnouncementBar audience="supervisor" />

          <main className="flex-1 p-4 pt-16 md:p-6 max-w-6xl w-full mx-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <AppFooter />
        </div>
      </div>
    </RoleGuard>
  );
}
