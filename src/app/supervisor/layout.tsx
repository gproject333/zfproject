"use client";

import { ReactNode } from "react";
import { supervisorNavItems } from "@/components/layout/navItems";
import SupervisorSidebarLayout from "@/components/layout/SupervisorSidebarLayout";

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  return <SupervisorSidebarLayout navItems={supervisorNavItems}>{children}</SupervisorSidebarLayout>;
}
