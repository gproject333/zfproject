import NotificationsView from "@/features/notifications/components/NotificationsView";

export default function StudentNotificationsPage() {
  return (
    <NotificationsView
      applicationHref={(id) => `/student/applications/${id}`}
    />
  );
}
