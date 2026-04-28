"use client";

import { ReactNode } from "react";
import {
  Home,
  LayoutDashboard,
  Plus,
  FileText,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OliveLogo from "@/components/OliveLogo";

const studentConfig = {
  roles: ["student"] as const,
  brand: {
    icon: <OliveLogo className="w-full h-full" />,
    homeHref: "/student",
    subtitle: "لوحة الطالب",
  },
  navItems: [
    { label: "الصفحة الرئيسية", href: "/", icon: Home },
    { label: "لوحة التحكم", href: "/student", icon: LayoutDashboard },
    { label: "طلب جديد", href: "/student/new", icon: Plus },
    { label: "طلباتي", href: "/student/applications", icon: FileText },
    { label: "المقالات", href: "/student/articles", icon: BookOpen },
    { label: "دليل التقديم", href: "/student/guide", icon: HelpCircle },
  ],
  active: {
    className: "bg-primary nb-shadow-sm",
  },
  showNotifications: true,
  logoutHref: "/login",
  profileHref: "/student/profile",
};

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout config={studentConfig}>{children}</DashboardLayout>;
}
