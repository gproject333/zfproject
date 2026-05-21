"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {FileText, ChevronLeft} from "lucide-react";
import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import ApplicationCard from "@/features/applications/components/ApplicationCard";
import { useRecentApplications } from "@/features/student/hooks/useRecentApplications";

/**
 * Dashboard widget: latest N applications for the current student.
 * Reuses the shared `ApplicationCard` so each row looks identical
 * to the full list page.
 */
export default function RecentApplicationsCard({ limit = 3 }: { limit?: number }) {
  const router = useRouter();
  const { applications, loading } = useRecentApplications(limit);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-foreground/10">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          آخر طلباتي
        </h3>
        <Link
          href="/student/applications"
          className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          عرض الكل
          <ChevronLeft className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="p-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nb-card p-5 flex items-center gap-4">
              <Skeleton className="h-7 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-5 h-5 rounded" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-10 px-5">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {applications.map((app, i) => (
            <ApplicationCard
              key={app._id}
              application={app}
              index={i}
              onClick={() =>
                router.push(`/student/applications/${app._id}`)
              }
            />
          ))}
        </div>
      )}
    </Card>
  );
}
