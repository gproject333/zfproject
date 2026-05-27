"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@smart-zuj/convex";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OliveSpinner from "@/components/OliveSpinner";
import { getRoleHomepage, type Role } from "@smart-zuj/core";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

function isAllowedRole(role: string | undefined, allowedRoles: Role[]): role is Role {
  const effectiveRole = role || "student";
  return (allowedRoles as string[]).includes(effectiveRole);
}

/**
 * Grace window for the Convex webhook to land a brand-new user document
 * after a fresh Clerk sign-in. Without this, RoleGuard sees
 * `user === null` for a beat and bounces the user back to /login — they
 * think they're locked out even though Convex is just one round-trip
 * behind Clerk. Matches the `/login-redirect` waiting strategy.
 */
const USER_GRACE_MS = 4000;

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.shared.currentUser,
    authLoading || !isAuthenticated ? "skip" : undefined,
  );
  const router = useRouter();
  const [graceExpired, setGraceExpired] = useState(false);

  // Start the grace timer as soon as we know the user is authed but the
  // Convex row hasn't shown up yet. Reset every time the trigger flips.
  useEffect(() => {
    if (authLoading || !isAuthenticated || user !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGraceExpired(false);
      return;
    }
    const id = window.setTimeout(() => setGraceExpired(true), USER_GRACE_MS);
    return () => window.clearTimeout(id);
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user === null && graceExpired) {
      // Convex never produced a user row — webhook likely failed. Send to
      // login-redirect so its richer "تأخّر تجهيز حسابك" screen takes over.
      router.push("/login-redirect");
      return;
    }

    if (user && !isAllowedRole(user.role, allowedRoles)) {
      router.push(getRoleHomepage(user.role));
    }
  }, [authLoading, isAuthenticated, user, graceExpired, allowedRoles, router]);

  // Loading state covers both the auth handshake and the post-auth grace
  // window while we wait for the Convex user row.
  const stillLoading =
    authLoading || user === undefined || (user === null && !graceExpired);

  if (stillLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <OliveSpinner size="xl" className="text-primary" />
      </div>
    );
  }

  if (user === null || !isAllowedRole(user.role, allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
