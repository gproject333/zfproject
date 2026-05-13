"use client";

import { ReactNode, useMemo } from "react";
import { useQuery } from "convex/react";
import { Building2, Briefcase, Star } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import DashboardLayout, { type DashboardLayoutConfig } from "@/components/layout/DashboardLayout";

export default function SponsorLayout({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.shared.currentUser, {});

  const config: DashboardLayoutConfig = useMemo(
    () => ({
      roles: ["sponsor"],
      brand: {
        icon: (
          <div className="relative">
            <Building2 className="w-5 h-5 text-white" />
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "#1F5C2E", border: "1px solid #164520" }}
            >
              <Star className="w-2 h-2 text-white" fill="currentColor" />
            </div>
          </div>
        ),
        iconBgStyle: { background: "#C9A227" },
        homeHref: "/sponsor",
        subtitle: user?.name ? `مرحباً، ${user.name}` : "بوابة الرعاة",
        subtitleStyle: { color: "#C9A227" },
      },
      navItems: [{ label: "مشاريعي", href: "/sponsor", icon: Briefcase }],
      active: {
        className: "text-white nb-shadow-sm",
        style: { background: "#C9A227", color: "#111", borderColor: "#B7891A" },
      },
      showNotifications: false,
      logoutHref: "/login",
      profileHref: "/sponsor",
    }),
    [user?.name]
  );

  return <DashboardLayout config={config}>{children}</DashboardLayout>;
}
