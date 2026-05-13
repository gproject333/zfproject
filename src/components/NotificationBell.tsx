"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, CheckCheck, ChevronLeft } from "lucide-react";
import { Popover, Spinner } from "@/components/ui";
import NotificationItem from "@/components/NotificationItem";

type RolePrefix = "student" | "supervisor" | "admin" | "sponsor";

function rolePrefixFromPath(pathname: string): RolePrefix {
  if (pathname.startsWith("/supervisor")) return "supervisor";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/sponsor")) return "sponsor";
  return "student";
}

function applicationHrefFor(role: RolePrefix, applicationId: string): string {
  if (role === "supervisor" || role === "admin") {
    return `/supervisor/applications/${applicationId}`;
  }
  if (role === "sponsor") return `/sponsor/projects/${applicationId}`;
  return `/student/applications/${applicationId}`;
}

export default function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const role = rolePrefixFromPath(pathname);

  const unreadCount = useQuery(api.notifications.unreadCount);
  const notifications = useQuery(api.notifications.myNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleNotificationClick = async (
    n: NonNullable<typeof notifications>[number],
  ) => {
    if (!n.read) await markAsRead({ id: n._id });
    setOpen(false);
    if (n.applicationId) {
      router.push(applicationHrefFor(role, n.applicationId));
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push(`/${role}/notifications`);
  };

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className="relative w-10 h-10 nb-border rounded-lg flex items-center justify-center bg-card nb-shadow-hover cursor-pointer"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-1.5 -left-1.5 min-w-5 h-5 px-1 bg-destructive nb-border rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount! > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Content placement="bottom end">
        <Popover.Dialog className="w-80 p-0 min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground/10">
            <span className="font-bold text-sm">الإشعارات</span>
            {(unreadCount ?? 0) > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void markAllAsRead();
                }}
                className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                قراءة الكل
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications === undefined ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" color="current" className="text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-bold text-muted-foreground">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onClick={() => void handleNotificationClick(n)}
                />
              ))
            )}
          </div>

          {/* Footer — view-all link */}
          <button
            type="button"
            onClick={handleViewAll}
            className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-bold border-t-2 border-foreground/10 hover:bg-muted transition-colors"
          >
            عرض كل الإشعارات
            <ChevronLeft className="w-4 h-4" />
          </button>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
