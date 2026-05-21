import {
  Home,
  LayoutDashboard,
  Plus,
  FileText,
  BookOpen,
  HelpCircle,
  Megaphone,
  Compass,
  GraduationCap,
  Users,
  Building2,
  TrendingUp,
  Share2,
  Briefcase,
} from "lucide-react";
import type { NavItem } from "./DashboardLayout";

/**
 * Single source of truth for role-based navigation items.
 *
 * Consumed by each role's dashboard layout AND by the landing-page
 * navbar — so a signed-in user sees the links for *their* role on the
 * home page instead of hardcoded student links. Adding a page means
 * adding it here once; all navbars pick it up.
 */
export const studentNavItems: NavItem[] = [
  { label: "الصفحة الرئيسية", href: "/", icon: Home },
  { label: "لوحة التحكم", href: "/student", icon: LayoutDashboard },
  { label: "طلب جديد", href: "/student/new", icon: Plus },
  { label: "طلباتي", href: "/student/applications", icon: FileText },
  { label: "المقالات", href: "/student/articles", icon: BookOpen },
  { label: "دليل التقديم", href: "/student/guide", icon: HelpCircle },
];

export const supervisorNavItems: NavItem[] = [
  { label: "الصفحة الرئيسية", href: "/", icon: Home },
  { label: "لوحة تحكم المشرف", href: "/supervisor", icon: LayoutDashboard },
  { label: "إدارة الطلبات", href: "/supervisor/applications", icon: FileText },
  { label: "الإعلانات", href: "/supervisor/banners", icon: Megaphone },
  { label: "المقالات", href: "/supervisor/articles", icon: BookOpen },
  { label: "الدليل الريادي", href: "/supervisor/entrepreneurial-guide", icon: Compass },
];

export const adminNavItems: NavItem[] = [
  { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  { label: "الطلاب", href: "/admin/students", icon: GraduationCap },
  { label: "المشرفون", href: "/admin/supervisors", icon: Users },
  { label: "الرعاة", href: "/admin/sponsors", icon: Building2 },
  { label: "إدارة الكليات", href: "/admin/colleges", icon: BookOpen },
  { label: "طلبات الترقية", href: "/admin/upgrade-requests", icon: TrendingUp },
  { label: "روابط التواصل", href: "/admin/social", icon: Share2 },
];

export const sponsorNavItems: NavItem[] = [
  { label: "مشاريعي", href: "/sponsor", icon: Briefcase },
];

/** Pick the nav items matching a user's role (defaults to student). */
export function navItemsForRole(role: string | null | undefined): NavItem[] {
  switch (role) {
    case "admin":
      return adminNavItems;
    case "supervisor":
      return supervisorNavItems;
    case "sponsor":
      return sponsorNavItems;
    default:
      return studentNavItems;
  }
}
