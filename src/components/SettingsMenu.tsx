"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  UserCircle,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLogoutHandler } from "@/features/auth/hooks/useLogoutHandler";

interface SettingsMenuProps {
  profileHref: string;
  logoutHref?: string;
}

/**
 * Consolidated settings dropdown — profile link, theme toggle, logout.
 * Replaces the previous separate ThemeToggle + logout button cluster
 * so every dashboard header exposes the same gear icon in one place.
 * Owns its own logout confirm dialog via useLogoutHandler.
 */
export default function SettingsMenu({
  profileHref,
  logoutHref = "/login",
}: SettingsMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const logout = useLogoutHandler(logoutHref);
  const [mounted, setMounted] = useState(false);

  // next-themes hydration guard — the server doesn't know the resolved
  // theme so we delay the icon swap until after mount to avoid SSR mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = theme === "dark";
  const ThemeIcon = mounted && isDark ? Sun : Moon;
  const themeLabel = mounted && isDark ? "الوضع الفاتح" : "الوضع الداكن";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-10 h-10 nb-border rounded-lg flex items-center justify-center bg-card nb-shadow-hover"
            aria-label="الإعدادات"
          >
            <Settings className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push(profileHref)}>
            <UserCircle className="w-4 h-4" />
            ملفي الشخصي
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setTheme(isDark ? "light" : "dark")}
          >
            <ThemeIcon className="w-4 h-4" />
            {themeLabel}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onSelect={() => logout.setShowConfirm(true)}
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={logout.showConfirm}
        onOpenChange={(open) => {
          if (!logout.isLoggingOut) logout.setShowConfirm(open);
        }}
        title="تسجيل الخروج"
        description="هل أنت متأكد من رغبتك في تسجيل الخروج من الحساب؟"
        icon={<LogOut className="w-6 h-6 text-destructive" />}
        destructive
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        isSubmitting={logout.isLoggingOut}
        onConfirm={() => void logout.handleLogout()}
      />
    </>
  );
}
