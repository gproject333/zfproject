import NotificationsView from "@/features/notifications/components/NotificationsView";

export default function SupervisorNotificationsPage() {
  return (
    <NotificationsView
      applicationHref={(id) => `/supervisor/applications/${id}`}
    />
  );
}
