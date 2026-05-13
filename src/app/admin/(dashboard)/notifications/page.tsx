import NotificationsView from "@/features/notifications/components/NotificationsView";

export default function AdminNotificationsPage() {
  return (
    <NotificationsView
      applicationHref={(id) => `/supervisor/applications/${id}`}
    />
  );
}
