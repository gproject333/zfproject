"use client";

import { ReactNode } from "react";
import {
  Home,
  LayoutDashboard,
  FileText,
  Megaphone,
  BookOpen,
  Compass,
} from "lucide-react";
import SupervisorSidebarLayout from "@/components/layout/SupervisorSidebarLayout";

const NAV_ITEMS = [
  { label: "الصفحة الرئيسية", href: "/", icon: Home },
  { label: "لوحة تحكم المشرف", href: "/supervisor", icon: LayoutDashboard },
  { label: "إدارة الطلبات", href: "/supervisor/applications", icon: FileText },
  { label: "الإعلانات", href: "/supervisor/content/banners", icon: Megaphone },
  { label: "المقالات", href: "/supervisor/content/articles", icon: BookOpen },
  { label: "الدليل الريادي", href: "/supervisor/content/guide", icon: Compass },
];

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  return <SupervisorSidebarLayout navItems={NAV_ITEMS}>{children}</SupervisorSidebarLayout>;
}
