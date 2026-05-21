"use client";

import { Skeleton as HSkeleton } from "@heroui/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <HSkeleton className={cn("rounded-md", className)} {...props} />;
}

/** Skeleton for stat cards (dashboard) */
function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-8" />
          </div>
          <Skeleton className="h-4 w-24" />
        </Card>
      ))}
    </div>
  );
}

/** Skeleton for application list items */
function SkeletonApplicationList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-5 h-5 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Full-page skeleton for dashboard */
function SkeletonDashboard() {
  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats */}
      <div className="mb-8">
        <SkeletonStatCards />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent */}
      <Skeleton className="h-6 w-28 mb-4" />
      <SkeletonApplicationList count={2} />
    </div>
  );
}

/** Skeleton for application detail page */
function SkeletonApplicationDetail() {
  return (
    <div className="animate-fade-in space-y-5">
      {/* Hero — identity block + status band */}
      <div className="nb-card overflow-hidden">
        <div className="p-6 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="border-t border-foreground/[0.07] bg-background px-6 py-5 flex items-center justify-between gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
      </div>

      {/* Body — details column + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </Card>
        <Card className="p-6 space-y-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-[4.5rem] w-full rounded-xl" />
          <Skeleton className="h-[4.5rem] w-full rounded-xl" />
        </Card>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonStatCards,
  SkeletonApplicationList,
  SkeletonDashboard,
  SkeletonApplicationDetail,
};
