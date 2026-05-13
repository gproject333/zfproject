"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Button, Card, Spinner } from "@/components/ui";
import NotificationItem from "@/components/NotificationItem";
import { EmptyState } from "@/components/ui/EmptyState";

type Filter =
  | "all"
  | "unread"
  | Doc<"notifications">["type"];

interface FilterChip {
  value: Filter;
  label: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { value: "all", label: "الكل" },
  { value: "unread", label: "غير المقروءة" },
  { value: "status_change", label: "تغييرات الحالة" },
  { value: "new_application", label: "طلبات جديدة" },
  { value: "new_note", label: "ملاحظات" },
  { value: "announcement", label: "إعلانات" },
  { value: "assignment", label: "تعيينات" },
  { value: "upgrade_request", label: "طلبات ترقية" },
  { value: "system", label: "النظام" },
];

const PAGE_SIZE = 20;

interface NotificationsViewProps {
  /**
   * Builder for the route a notification should navigate to when clicked.
   * Each role wraps this so a supervisor goes to /supervisor/applications/[id]
   * while a student goes to /student/applications/[id].
   */
  applicationHref: (id: string) => string;
}

export default function NotificationsView({ applicationHref }: NotificationsViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.paginatedNotifications,
    { filter },
    { initialNumItems: PAGE_SIZE },
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const hasUnread = results.some((n) => !n.read);

  const handleClick = async (n: Doc<"notifications">) => {
    if (!n.read) await markAsRead({ id: n._id });
    if (n.applicationId) router.push(applicationHref(n.applicationId));
  };

  const handleDelete = async (id: Doc<"notifications">["_id"]) => {
    await deleteNotification({ id });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 nb-border rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">الإشعارات</h1>
            <p className="text-sm text-muted-foreground">
              {hasUnread ? "لديك إشعارات لم تقرأها" : "لا يوجد إشعارات جديدة"}
            </p>
          </div>
        </div>
        {hasUnread && (
          <Button
            onPress={() => void markAllAsRead()}
            variant="outline"
            size="sm"
          >
            <CheckCheck className="w-4 h-4" />
            قراءة الكل
          </Button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 flex-wrap" role="tablist" aria-label="تصفية الإشعارات">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            role="tab"
            aria-selected={filter === chip.value}
            onClick={() => setFilter(chip.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold nb-border transition-all ${
              filter === chip.value
                ? "bg-primary text-primary-foreground nb-shadow-sm"
                : "bg-card hover:bg-muted"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* List */}
      {status === "LoadingFirstPage" ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="current" className="text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد إشعارات"
          description={
            filter === "unread"
              ? "كل إشعاراتك مقروءة"
              : "ما في إشعارات تطابق هاد الفلتر"
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-foreground/5">
            {results.map((n) => (
              <li key={n._id} className="relative group">
                <NotificationItem
                  notification={n}
                  onClick={() => void handleClick(n)}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete(n._id);
                  }}
                  aria-label="حذف الإشعار"
                  className="absolute top-3 left-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Load more */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center mt-5">
          <Button
            onPress={() => loadMore(PAGE_SIZE)}
            variant="outline"
            size="sm"
          >
            تحميل المزيد
          </Button>
        </div>
      )}
      {status === "LoadingMore" && (
        <div className="flex justify-center mt-5">
          <Spinner size="md" color="current" className="text-muted-foreground" />
        </div>
      )}
      {status === "Exhausted" && results.length > 0 && (
        <p className="text-center mt-5 text-xs text-muted-foreground">
          لا يوجد إشعارات أقدم
        </p>
      )}

      {/* Total counter when there's data */}
      {results.length > 0 && (
        <p className="text-center mt-3 text-xs text-muted-foreground font-bold">
          {results.length} إشعار
        </p>
      )}
    </div>
  );
}
