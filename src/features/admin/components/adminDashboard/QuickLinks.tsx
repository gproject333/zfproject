"use client";

import Link from "next/link";
import { Users, Building2, GraduationCap, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickLink {
  label: string;
  desc: string;
  href: string;
  color: string;
  icon: LucideIcon;
}

const QUICK_LINKS: QuickLink[] = [
  { label: "إدارة الطلاب", desc: "عرض بيانات الطلاب وإدارة حساباتهم", href: "/admin/students", color: "#2563EB", icon: GraduationCap },
  { label: "إدارة المشرفين", desc: "متابعة المشرفين الأكاديميين وصلاحياتهم", href: "/admin/supervisors", color: "#7C3AED", icon: Users },
  { label: "إنشاء حساب راعٍ", desc: "إضافة شركة أو جهة راعية جديدة", href: "/admin/sponsors", color: "#C9A227", icon: Building2 },
  { label: "إدارة الكليات", desc: "إضافة وتعديل الكليات والتخصصات", href: "/admin/colleges", color: "#2D7A3E", icon: BookOpen },
];

export default function QuickLinks() {
  return (
    <div>
      <h3 className="text-xl font-extrabold mb-4">الإجراءات السريعة</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_LINKS.map((a) => (
          <Link key={a.href} href={a.href} className="nb-card-interactive p-5 text-right group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl nb-border flex items-center justify-center shrink-0 group-hover:-rotate-6 transition-transform bg-white">
                <a.icon className="w-5 h-5" style={{ color: a.color }} />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-base">{a.label}</h4>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{a.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
