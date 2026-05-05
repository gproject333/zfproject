"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "@/lib/toast";
import { Tabs, Card} from "@/components/ui";

const STATUS_LABELS = {
  pending: { label: "معلق", color: "text-warning", bg: "bg-warning/10" },
  approved: { label: "مقبول", color: "text-success", bg: "bg-success/10" },
  rejected: { label: "مرفوض", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function UpgradeRequestsManager() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const requests = useQuery(
    api.supervisorUpgradeRequests.listRequests,
    filter === "all" ? {} : { status: filter },
  );
  const reviewRequest = useMutation(api.supervisorUpgradeRequests.reviewRequest);
  const [loadingId, setLoadingId] = useState<Id<"supervisorUpgradeRequests"> | null>(null);

  const handleReview = async (
    requestId: Id<"supervisorUpgradeRequests">,
    decision: "approved" | "rejected",
  ) => {
    setLoadingId(requestId);
    try {
      await reviewRequest({ requestId, decision });
      toast.success(decision === "approved" ? "تمت الموافقة وترقية الطالب إلى مشرف" : "تم رفض الطلب");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoadingId(null);
    }
  };

  const pending = requests?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" style={{ color: "#DC2626" }} />
            طلبات الترقية إلى مشرف
          </h2>
          <p className="text-muted-foreground font-medium">
            طلبات الترقية المقدمة من أعضاء هيئة التدريس (@zuj.edu.jo)
          </p>
        </div>
        {pending > 0 && (
          <span className="nb-badge bg-warning/20 text-warning font-extrabold text-sm px-3 py-1.5">
            {pending} طلب معلق
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs
        selectedKey={filter}
        onSelectionChange={(k) => setFilter(k as typeof filter)}
      >
        <Tabs.List className="overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Tabs.Tab id="all">الكل</Tabs.Tab>
          <Tabs.Tab id="pending">{STATUS_LABELS.pending.label}</Tabs.Tab>
          <Tabs.Tab id="approved">{STATUS_LABELS.approved.label}</Tabs.Tab>
          <Tabs.Tab id="rejected">{STATUS_LABELS.rejected.label}</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Table */}
      <Card className="overflow-hidden">
        {requests === undefined ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right px-4 py-3 font-extrabold">الطالب</th>
                  <th className="text-right px-4 py-3 font-extrabold hidden md:table-cell">البريد</th>
                  <th className="text-right px-4 py-3 font-extrabold hidden sm:table-cell">تاريخ الطلب</th>
                  <th className="text-right px-4 py-3 font-extrabold">الحالة</th>
                  <th className="text-right px-4 py-3 font-extrabold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const statusInfo = STATUS_LABELS[req.status];
                  const isLoading = loadingId === req._id;
                  return (
                    <tr
                      key={req._id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 nb-border flex items-center justify-center shrink-0 font-extrabold text-primary text-sm">
                            {(req.studentName ?? req.studentEmail)[0]?.toUpperCase()}
                          </div>
                          <span className="font-bold">{req.studentName ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {req.studentEmail}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString("ar-JO")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`nb-badge font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {req.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReview(req._id, "approved")}
                              disabled={isLoading}
                              className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1 text-success hover:bg-success/10 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              قبول
                            </button>
                            <button
                              onClick={() => handleReview(req._id, "rejected")}
                              disabled={isLoading}
                              className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">تم البت بالطلب</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
