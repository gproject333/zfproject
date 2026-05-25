"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Doc } from "@smart-zuj/convex";
import { Button, Spinner } from "@/components/ui";
import NotificationItem from "@/components/NotificationItem";
import AckRequiredModal from "@/components/AckRequiredModal";

export default function SponsorNotificationsPage() {
  const router = useRouter();
  const notifications = useQuery(api.notifications.myNotifications);
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0;
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const [ackModalNotif, setAckModalNotif] = useState<Doc<"notifications"> | null>(null);

  const handleClick = async (
    n: NonNullable<typeof notifications>[number],
  ) => {
    if (n.requireAck && !n.ackedAt) {
      setAckModalNotif(n);
      return;
    }
    if (!n.read) await markAsRead({ id: n._id });
    // The sponsor's "view source" for any application notification is the
    // interests grid — sponsors don't have a per-application page.
    if (n.applicationId) router.push("/sponsor/interests");
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            الإشعارات
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            تحديثات الإدارة والمشرفين بشأن اهتماماتكم.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onPress={() => void markAllAsRead()}
            variant="outline"
            size="sm"
          >
            <CheckCheck className="w-4 h-4" />
            قراءة الكل
          </Button>
        )}
      </header>

      <div className="rounded-2xl border border-foreground/[0.08] bg-card overflow-hidden">
        {notifications === undefined ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" color="current" className="text-secondary" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-foreground/[0.05]">
            {notifications.map((n) => (
              <li key={n._id}>
                <NotificationItem
                  notification={n}
                  onClick={() => void handleClick(n)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <AckRequiredModal
        notification={ackModalNotif}
        open={!!ackModalNotif}
        onClose={() => setAckModalNotif(null)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center">
        <Bell className="w-7 h-7 text-secondary-border" />
      </div>
      <h2 className="text-lg font-extrabold">لا توجد إشعارات</h2>
      <p className="text-sm text-muted-foreground font-medium max-w-sm">
        تظهر هنا الإشعارات عند تواصل الإدارة بشأن المشاريع التي أبديتم الاهتمام بها.
      </p>
    </div>
  );
}
