"use client";

import { ReactNode } from "react";
import { supervisorSidebarConfig } from "@/components/layout/navItems";
import AppSidebarLayout from "@/components/layout/AppSidebarLayout";

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  return (
    <AppSidebarLayout
      config={supervisorSidebarConfig}
      allowedRoles={["supervisor"]}
      announcementAudience="supervisor"
    >
      {children}
    </AppSidebarLayout>
  );
}
