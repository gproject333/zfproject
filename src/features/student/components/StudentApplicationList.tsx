"use client";

import { useRouter } from "next/navigation";
import {FileText, Search, Plus} from "lucide-react";
import { SkeletonApplicationList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import ApplicationCard from "@/features/applications/components/ApplicationCard";
import { Button, Input, Spinner, Tabs } from "@/components/ui";
import { STATUS_CONFIG } from "@/lib/configs/application";
import { useStudentApplicationListFilters } from "@/features/student/hooks/useStudentApplicationListFilters";

type StatusKey = keyof typeof STATUS_CONFIG;
const STATUS_KEYS = Object.keys(STATUS_CONFIG) as StatusKey[];

export default function StudentApplicationList() {
  const router = useRouter();
  const {
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    filteredApps,
    status,
    loadMore,
  } = useStudentApplicationListFilters();

  if (status === "LoadingFirstPage") {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              طلباتي
            </h2>
          </div>
        </div>
        <SkeletonApplicationList count={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            طلباتي
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            تابع حالة طلباتك واقرأ ملاحظات المشرف
          </p>
        </div>
        <Button onPress={() => router.push("/student/new")} variant="secondary" size="sm">
          <Plus className="w-4 h-4" />
          طلب جديد
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث عن طلب..."
          aria-label="بحث في طلباتي"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          className="pr-11"
        />
      </div>

      <Tabs
        selectedKey={statusFilter}
        onSelectionChange={(k) => setStatusFilter(k as typeof statusFilter)}
        className="mb-6"
      >
        <Tabs.List className="overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Tabs.Tab id="all">الكل</Tabs.Tab>
          {STATUS_KEYS.map((key) => {
            const cfg = STATUS_CONFIG[key];
            const Icon = cfg.icon;
            return (
              <Tabs.Tab key={key} id={key}>
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      {filteredApps.length === 0 ? (
        <EmptyState
          variant="no-applications"
          title={statusFilter === "all" ? "لا توجد طلبات" : "لا توجد طلبات بهذه الحالة"}
          description={
            statusFilter === "all"
              ? "لم تقدم أي طلبات بعد. ابدأ الآن!"
              : "جرّب فلتراً آخر أو قدّم طلباً جديداً."
          }
          action={
            <Button onPress={() => router.push("/student/new")} variant="secondary">
              <Plus className="w-5 h-5" />
              تقديم طلب جديد
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app, i) => (
            <ApplicationCard
              key={app._id}
              application={app}
              index={i}
              onClick={() => router.push(`/student/applications/${app._id}`)}
            />
          ))}

          {status === "CanLoadMore" && (
            <div className="flex justify-center pt-2">
              <Button onPress={loadMore} variant="outline">
                تحميل المزيد
              </Button>
            </div>
          )}
          {status === "LoadingMore" && (
            <div className="flex justify-center pt-2">
              <Spinner size="md" color="current" className="text-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
