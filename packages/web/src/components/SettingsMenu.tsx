"use client";

import { useRouter } from "next/navigation";
import { Settings, UserCircle, LogOut } from "lucide-react";
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
  const logout = useLogoutHandler(logoutHref);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="w-10 h-10 ds-border rounded-lg flex items-center justify-center bg-card ds-shadow-hover"
          aria-label="الإعدادات"
        >
          <Settings className="w-5 h-5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push(profileHref)}>
            <UserCircle className="w-4 h-4" />
            الملفّ الشخصي
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
        description="هل تودّ تأكيد تسجيل الخروج من الحساب؟"
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
