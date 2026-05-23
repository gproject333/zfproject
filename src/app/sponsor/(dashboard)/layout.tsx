"use client";

import { ReactNode, useMemo } from "react";
import { useQuery } from "convex/react";
import { Building2, Star } from "lucide-react";
import { sponsorNavItems } from "@/components/layout/navItems";
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
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-primary border border-primary/70"
            >
              <Star className="w-2 h-2 text-white" fill="currentColor" />
            </div>
          </div>
        ),
        iconBgStyle: { background: "var(--secondary)" },
        homeHref: "/sponsor",
        subtitle: user?.name ? `مرحباً، ${user.name}` : "بوابة الرعاة",
        subtitleStyle: { color: "var(--secondary)" },
      },
      navItems: sponsorNavItems,
      active: {
        className: "text-white ds-shadow-sm",
        style: { background: "var(--secondary)", borderColor: "var(--secondary-border)" },
      },
      showNotifications: true,
      logoutHref: "/login",
      profileHref: "/sponsor/profile",
    }),
    [user?.name]
  );

  return <DashboardLayout config={config}>{children}</DashboardLayout>;
}
