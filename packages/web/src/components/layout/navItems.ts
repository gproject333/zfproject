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
  ShieldCheck,
  Crown,
  Sparkles,
  Heart,
  Bell,
  UserRound,
  ClipboardList,
  MessageCircle,
} from "lucide-react";
import type { NavItem } from "./DashboardLayout";
import type { AppSidebarConfig } from "./AppSidebar";

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
  { label: "الدليل الريادي", href: "/student/entrepreneurial-guide", icon: Compass },
  { label: "دليل التقديم", href: "/student/guide", icon: HelpCircle },
];

export const supervisorNavItems: NavItem[] = [
  { label: "الصفحة الرئيسية", href: "/", icon: Home },
  { label: "لوحة تحكم المشرف", href: "/supervisor", icon: LayoutDashboard },
  { label: "إدارة الطلبات", href: "/supervisor/applications", icon: FileText },
  { label: "اهتمامات الداعمين", href: "/supervisor/sponsor-interests", icon: Heart },
  { label: "الإعلانات", href: "/supervisor/banners", icon: Megaphone },
  { label: "المقالات", href: "/supervisor/articles", icon: BookOpen },
  { label: "الدليل الريادي", href: "/supervisor/entrepreneurial-guide", icon: Compass },
];

export const adminNavItems: NavItem[] = [
  { label: "الصفحة الرئيسية", href: "/", icon: Home },
  { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  { label: "الطلاب", href: "/admin/students", icon: GraduationCap },
  { label: "المشرفون", href: "/admin/supervisors", icon: Users },
  { label: "الداعمون", href: "/admin/sponsors", icon: Building2 },
  { label: "إدارة الكليات", href: "/admin/colleges", icon: BookOpen },
  { label: "طلبات الترقية", href: "/admin/upgrade-requests", icon: TrendingUp },
  { label: "سجل النشاط", href: "/admin/logs", icon: ClipboardList },
  { label: "سجل الواتساب", href: "/admin/whatsapp-log", icon: MessageCircle },
  { label: "روابط التواصل", href: "/admin/social", icon: Share2 },
];

export const sponsorNavItems: NavItem[] = [
  { label: "الاستكشاف", href: "/sponsor", icon: Sparkles },
  { label: "الاهتمامات", href: "/sponsor/interests", icon: Heart },
  { label: "الإشعارات", href: "/sponsor/notifications", icon: Bell },
  { label: "الملف الشخصي", href: "/sponsor/profile", icon: UserRound },
];

/**
 * App-shell sidebar config per role. The supervisor and admin both run
 * the navbar-less {@link AppSidebar}; these supply each one's brand,
 * nav items, and accent so the same component serves both — in their
 * dashboard AND on the landing page.
 */
export const supervisorSidebarConfig: AppSidebarConfig = {
  navItems: supervisorNavItems,
  homeHref: "/supervisor",
  brandIcon: ShieldCheck,
  brandBadgeClassName: "bg-white",
  brandIconClassName: "text-accent",
  subtitle: "لوحة المشرف الأكاديمي",
  profileHref: "/supervisor/profile",
  activeClassName: "bg-accent text-accent-foreground ds-shadow-sm border-foreground",
  storageKey: "supervisor-sidebar-collapsed",
};

export const adminSidebarConfig: AppSidebarConfig = {
  navItems: adminNavItems,
  homeHref: "/admin",
  brandIcon: Crown,
  brandBadgeStyle: { background: "var(--accent)" },
  brandIconClassName: "text-white",
  subtitle: "لوحة مشرف النظام",
  profileHref: "/admin",
  logoutHref: "/login",
  // Admin uses the mid-olive accent (per DESIGN.md), one step brighter
  // than supervisor's primary so the two sidebars are distinguishable
  // without breaking the olive identity.
  activeClassName: "bg-accent text-accent-foreground ds-shadow-sm border-foreground",
  storageKey: "admin-sidebar-collapsed",
};

/** Pick the sidebar config matching a user's role (null = no sidebar). */
export function sidebarConfigForRole(
  role: string | null | undefined,
): AppSidebarConfig | null {
  switch (role) {
    case "admin":
      return adminSidebarConfig;
    case "supervisor":
      return supervisorSidebarConfig;
    default:
      return null;
  }
}

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
