"use client";

import { ReactNode } from "react";
import { Crown } from "lucide-react";
import { adminNavItems } from "@/components/layout/navItems";
import DashboardLayout from "@/components/layout/DashboardLayout";

const adminConfig = {
  roles: ["admin"] as const,
  brand: {
    icon: <Crown className="w-5 h-5 text-white" />,
    iconBgStyle: { background: "#DC2626" },
    homeHref: "/admin",
    subtitle: "لوحة مشرف النظام",
    subtitleStyle: { color: "#DC2626" },
  },
  navItems: adminNavItems,
  active: {
    className: "text-white nb-shadow-sm",
    style: { background: "#DC2626", borderColor: "#991B1B" },
  },
  showNotifications: true,
  logoutHref: "/admin/login",
  profileHref: "/admin",
  backgroundClass: "",
  sidebarLayout: true,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout config={adminConfig}>{children}</DashboardLayout>;
}
