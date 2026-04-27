"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[5px] bg-muted nb-border border-border/30",
        className
      )}
      {...props}
    />
  );
}

/** Skeleton for stat cards (dashboard) */
function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="nb-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-8" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for application list items */
function SkeletonApplicationList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="nb-card p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-5 h-5 rounded" />
          </div>
        </div>
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
          <div key={i} className="nb-card p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
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
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Content sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="nb-card p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
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
