import NotificationsView from "@/features/notifications/components/NotificationsView";

export default function SponsorNotificationsPage() {
  return (
    <NotificationsView
      applicationHref={(id) => `/sponsor/projects/${id}`}
    />
  );
}
