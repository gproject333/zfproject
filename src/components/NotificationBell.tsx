"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/DropdownMenu";
import NotificationItem from "@/components/NotificationItem";

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const unreadCount = useQuery(api.notifications.unreadCount);
  const notifications = useQuery(api.notifications.myNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleNotificationClick = async (n: NonNullable<typeof notifications>[number]) => {
    if (!n.read) await markAsRead({ id: n._id });
    setOpen(false);
    if (n.applicationId) {
      router.push(`/student/applications/${n.applicationId}`);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="relative w-10 h-10 nb-border rounded-lg flex items-center justify-center bg-card nb-shadow-hover"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-1.5 -left-1.5 min-w-5 h-5 px-1 bg-destructive nb-border rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount! > 99 ? "99+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="!w-80 !p-0 !min-w-0 overflow-hidden">
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
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
