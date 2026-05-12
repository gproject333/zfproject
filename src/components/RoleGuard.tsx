"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui";
import { getRoleHomepage, type Role } from "@/lib/roles";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

function isAllowedRole(role: string | undefined, allowedRoles: Role[]): role is Role {
  const effectiveRole = role || "student";
  return (allowedRoles as string[]).includes(effectiveRole);
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  // Skip the query until Convex has received the Clerk JWT to avoid a false null on refresh
  const user = useQuery(
    api.users.shared.currentUser,
    authLoading || !isAuthenticated ? "skip" : undefined
  );
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user !== undefined) {
      if (user === null) {
        router.push("/login");
      } else if (!isAllowedRole(user.role, allowedRoles)) {
        router.push(getRoleHomepage(user.role));
      }
    }
  }, [authLoading, isAuthenticated, user, allowedRoles, router]);

  if (authLoading || user === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="xl" color="current" className="text-primary" />
      </div>
    );
  }

  if (user === null || !isAllowedRole(user.role, allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
