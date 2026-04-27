"use client";

import { ReactNode } from "react";
import {
  Crown,
  LayoutDashboard,
  Users,
  Building2,
  Link2,
  Share2,
} from "lucide-react";
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
  navItems: [
    { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
    { label: "المشرفون", href: "/admin/supervisors", icon: Users },
    { label: "الرعاة", href: "/admin/sponsors", icon: Building2 },
    { label: "ربط المشاريع", href: "/admin/assignments", icon: Link2 },
    { label: "روابط التواصل", href: "/admin/social", icon: Share2 },
  ],
  active: {
    className: "text-white nb-shadow-sm",
    style: { background: "#DC2626", borderColor: "#991B1B" },
  },
  showNotifications: false,
  logoutHref: "/admin/login",
  profileHref: "/admin",
  backgroundClass: "",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout config={adminConfig}>{children}</DashboardLayout>;
}
