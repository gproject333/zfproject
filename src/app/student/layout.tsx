"use client";

import { ReactNode } from "react";
import { studentNavItems } from "@/components/layout/navItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OliveLogo from "@/components/OliveLogo";

const studentConfig = {
  roles: ["student"] as const,
  brand: {
    icon: <OliveLogo className="w-full h-full" />,
    homeHref: "/student",
    subtitle: "لوحة الطالب",
  },
  navItems: studentNavItems,
  active: {
    className: "bg-primary text-white nb-shadow-sm",
  },
  showNotifications: true,
  logoutHref: "/login",
  profileHref: "/student/profile",
};

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout config={studentConfig}>{children}</DashboardLayout>;
}
