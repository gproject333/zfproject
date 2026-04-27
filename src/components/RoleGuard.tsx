"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type Role = "student" | "supervisor" | "admin" | "sponsor";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

function isAllowedRole(role: string | undefined, allowedRoles: Role[]): role is Role {
  const effectiveRole = role || "student";
  return (allowedRoles as string[]).includes(effectiveRole);
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useQuery(api.users.shared.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined) {
      if (user === null) {
        // إذا لم يكن هناك مستخدم مسجل دخول، سيقوم الـ middleware بمعالجة تحويله لصفحة الدخول لاحقاً
        // لكن احتياطياً:
        router.push("/login");
      } else if (!isAllowedRole(user.role, allowedRoles)) {
        // إذا لم تكن صلاحيته من ضمن الصلاحيات المسموحة لهذه الواجهة
        // سيتم تحويله للوحة الخاصة بصلاحيته
        const effectiveRole: string = user.role || "student";
        if (effectiveRole === "admin") router.push("/admin");
        else if (effectiveRole === "sponsor") router.push("/sponsor");
        else if (effectiveRole === "supervisor") router.push("/supervisor");
        else if (effectiveRole === "student") router.push("/student");
        else router.push("/");
      }
    }
  }, [user, allowedRoles, router]);

  // أثناء عملية فحص الصلاحية، نعرض شاشة تحميل لكي لا تظهر الواجهة الخاطئة وتختفي
  if (user === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // إذا لم يكن مصرح له، لا تظهر المكونات الفرعية إلى أن يتم التحويل
  if (user === null || !isAllowedRole(user.role, allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
