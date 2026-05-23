import type { ReactNode } from "react";

/**
 * Bare layout for the sponsor reels feed. Deliberately skips the
 * DashboardLayout chrome (sidebar/header/footer) so the experience can go
 * truly full-bleed — the rest of the sponsor surface (interests,
 * notifications, profile) keeps the dashboard shell. The root layout still
 * wraps us in ConvexClientProvider so queries and auth keep working.
 */
export default function SponsorImmersiveLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black overflow-hidden">
      {children}
    </div>
  );
}
