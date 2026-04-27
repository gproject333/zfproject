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

const OliveLogo = () => (
  <svg viewBox="0 0 300 300" className="w-6 h-6">
    <g transform="translate(150 150)">
      <g fill="#ffffff" stroke="#1A1A1A" strokeWidth="10" strokeLinejoin="round">
        <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z"/>
        <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(60)"/>
        <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(120)"/>
        <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(180)"/>
        <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(240)"/>
        <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(300)"/>
      </g>
      <ellipse cx="0" cy="0" rx="13" ry="17" fill="#2B1F3A" stroke="#1A1A1A" strokeWidth="6"/>
    </g>
  </svg>
);

const studentConfig = {
  roles: ["student"] as const,
  brand: {
    icon: <OliveLogo />,
    iconBgClass: "bg-primary",
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
