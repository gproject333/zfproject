"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Bell, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import NotificationItem from "@/components/NotificationItem";
import { useRecentNotifications } from "@/features/student/hooks/useRecentNotifications";
import type { Doc } from "../../../../convex/_generated/dataModel";

/**
 * Dashboard widget: latest N notifications for the current student.
 * Reuses the shared NotificationItem component + the same
 * `myNotifications` query the bell already reads (via
 * useRecentNotifications) so there's no extra round-trip.
 */
export default function RecentNotificationsCard({ limit = 3 }: { limit?: number }) {
  const router = useRouter();
  const { notifications, loading } = useRecentNotifications(limit);
  const markAsRead = useMutation(api.notifications.markAsRead);

  const handleClick = async (n: Doc<"notifications">) => {
    if (!n.read) await markAsRead({ id: n._id });
    if (n.applicationId) {
      router.push(`/student/applications/${n.applicationId}`);
    }
  };

  return (
    <div className="nb-card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-foreground/10">
        <h3 className="font-extrabold flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          آخر الإشعارات
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 px-5">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-bold text-muted-foreground">لا توجد إشعارات</p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onClick={() => void handleClick(n)}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
