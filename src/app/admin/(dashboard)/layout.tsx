"use client";

import { ReactNode } from "react";
import { adminSidebarConfig } from "@/components/layout/navItems";
import AppSidebarLayout from "@/components/layout/AppSidebarLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppSidebarLayout
      config={adminSidebarConfig}
      allowedRoles={["admin"]}
      announcementAudience="student"
    >
      {children}
    </AppSidebarLayout>
  );
}
