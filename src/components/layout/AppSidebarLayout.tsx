"use client";

import { ReactNode } from "react";
import RoleGuard from "@/components/RoleGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppFooter from "@/components/AppFooter";
import ScrollingAnnouncementBar from "@/features/banners/components/ScrollingAnnouncementBar";
import AppSidebar, { type AppSidebarConfig } from "./AppSidebar";
import TopActionsCluster from "./TopActionsCluster";

type Role = "student" | "supervisor" | "admin" | "sponsor";

interface Props {
  config: AppSidebarConfig;
  /** Role(s) allowed through the RoleGuard. */
  allowedRoles: Role[];
  /** Audience whose announcements show in the ticker. */
  announcementAudience: "student" | "landing" | "supervisor";
  children: ReactNode;
}

/**
 * Role dashboard layout: the shared {@link AppSidebar} next to the page
 * content. No top navbar — notifications, settings, and the collapse
 * toggle live in the sidebar foot; mobile opens it via a floating
 * button. Used by both the supervisor and admin dashboards.
 */
export default function AppSidebarLayout({
  config,
  allowedRoles,
  announcementAudience,
  children,
}: Props) {
  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-pattern flex flex-col md:flex-row">
        <AppSidebar config={config} />

        {/* Main content column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ScrollingAnnouncementBar audience={announcementAudience} />
          <TopActionsCluster
            profileHref={config.profileHref}
            logoutHref={config.logoutHref}
          />

          <main className="flex-1 p-4 pt-16 md:p-6 md:pt-4 max-w-6xl w-full mx-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <AppFooter />
        </div>
      </div>
    </RoleGuard>
  );
}
