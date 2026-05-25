"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import {Bell} from "lucide-react";
import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@smart-zuj/convex";
import NotificationItem from "@/components/NotificationItem";
import AckRequiredModal from "@/components/AckRequiredModal";
import { useRecentNotifications } from "@/features/student/hooks/useRecentNotifications";
import type { Doc } from "@smart-zuj/convex";

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
  const [ackModalNotif, setAckModalNotif] = useState<Doc<"notifications"> | null>(null);

  const handleClick = async (n: Doc<"notifications">) => {
    if (n.requireAck && !n.ackedAt) {
      setAckModalNotif(n);
      return;
    }
    if (!n.read) await markAsRead({ id: n._id });
    if (n.applicationId) {
      router.push(`/student/applications/${n.applicationId}`);
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-foreground/10">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          أحدث الإشعارات
        </h3>
      </div>

      {loading ? (
        <div className="divide-y divide-foreground/10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 px-5">
          <div className="w-12 h-12 rounded-full bg-accent/12 text-accent flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold mb-1">لا توجد إشعارات حتى الآن.</p>
          <p className="text-xs text-muted-foreground font-medium max-w-[260px] mx-auto leading-relaxed">
            سيتم إعلامك فور صدور قرار من المشرف أو تحديد موعد لقاء.
          </p>
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
      <AckRequiredModal
        notification={ackModalNotif}
        open={!!ackModalNotif}
        onClose={() => setAckModalNotif(null)}
      />
    </Card>
  );
}
