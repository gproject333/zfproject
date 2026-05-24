"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, ArrowUpCircle, Clock, XCircle, UserCircle, ArrowLeft, Rocket, BookOpen, Compass, Send } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { Button, Card, Spinner, TextArea } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useStudentDashboardStats } from "@/features/student/hooks/useStudentDashboardStats";
import { useProfileComplete } from "@/features/student/hooks/useProfileComplete";
import StudentAvatar from "./StudentAvatar";
import AttentionSection from "./AttentionSection";
import RecentApplicationsCard from "./RecentApplicationsCard";
import RecentNotificationsCard from "./RecentNotificationsCard";
import UpcomingMeetingsCard from "./UpcomingMeetingsCard";
import { useQuery, useMutation } from "convex/react";
import { api } from "@smart-zuj/convex";
import { toast } from "@/lib/toast";

/**
 * Student dashboard: a work surface, not a second navigation menu.
 * Surfaces what needs the student's action first (AttentionSection),
 * then a compact status overview and recent activity.
 */
export default function StudentDashboard() {
  const router = useRouter();
  const { stats, user, statCards, loading } = useStudentDashboardStats();
  const profile = useProfileComplete();
  const upgradeRequest = useQuery(api.supervisorUpgradeRequests.getMyRequest, {});
  const submitRequest = useMutation(api.supervisorUpgradeRequests.submitRequest);

  const isZujStaff = user?.email?.endsWith("@zuj.edu.jo") ?? false;
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [upgradeBusy, setUpgradeBusy] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const handleUpgradeRequest = async () => {
    setUpgradeError(null);
    const trimmed = upgradeReason.trim();
    if (trimmed.length < 20) {
      setUpgradeError("اكتب سبباً واضحاً لا يقل عن 20 حرفاً.");
      return;
    }
    setUpgradeBusy(true);
    try {
      await submitRequest({ reason: trimmed });
      toast.success("تم تقديم طلب الترقية، سيتم مراجعته قريباً");
      setUpgradeOpen(false);
      setUpgradeReason("");
    } catch (e: unknown) {
      setUpgradeError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setUpgradeBusy(false);
    }
  };

  if (loading || !stats) return <SkeletonDashboard />;

  return (
    <div className="space-y-6">
      {/* Welcome + primary action */}
      <div className="flex flex-wrap items-center gap-4">
        <StudentAvatar name={user?.name} avatarId={user?.avatar} size="lg" />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">مرحباً، {user?.name ?? "بك"}</h2>
          {user?.department && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.department}
            </p>
          )}
        </div>
        <Button
          onPress={() => router.push("/student/new")}
          variant="primary"
          className="ms-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          تقديم طلب جديد
        </Button>
      </div>

      {/* Incomplete profile banner — sits ABOVE AttentionSection because
          the student literally cannot submit a new application until they
          fill it. */}
      {!profile.loading && !profile.isComplete && profile.hasUser && (
        <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-warning/40 bg-warning/[0.06]">
          <div className="w-12 h-12 rounded-xl bg-warning/15 text-warning ds-border flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-base">أكمل ملفك الشخصي</h3>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">
              {profile.missing.length > 0
                ? `لتتمكن من تقديم طلب، ينقصك: ${profile.missing.join("، ")}.`
                : "أكمل بياناتك حتى يقدر المشرف يتواصل معك."}
            </p>
          </div>
          <Link
            href="/student/profile"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-warning text-white font-bold text-sm shrink-0 hover:opacity-90 transition-opacity"
          >
            إكمال الآن
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Card>
      )}

      {/* First-time student welcome — only when zero applications AND
          profile is complete so we don't double-stack onboarding cards. */}
      {stats.total === 0 && profile.isComplete && (
        <Card className="p-6 sm:p-7 border-primary/30 bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-transparent">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-[0_8px_24px_-6px_rgba(31,92,46,0.5)]">
              <Rocket className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                مرحباً بك في حاضنة الزيتونة 👋
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1.5 leading-relaxed">
                ابدأ بتقديم فكرتك الأولى — اختار النوع، عبّي البيانات، وابعت
                للمشرف. تقدر تحفظ مسودة وترجع لها أي وقت.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="/student/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm ds-shadow-sm hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  ابدأ بفكرتك الأولى
                </Link>
                <Link
                  href="/student/guide"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-card text-foreground font-bold text-sm ds-border hover:bg-muted transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  دليل التقديم
                </Link>
                <Link
                  href="/student/articles"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-card text-foreground font-bold text-sm ds-border hover:bg-muted transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  مكتبة المقالات
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* What needs the student's action */}
      {stats.needsModification > 0 && <AttentionSection />}

      {/* Compact status overview — one clickable strip, not hero cards */}
      <div className="ds-card overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-foreground/10">
          {statCards.map((stat) => (
            <button
              key={stat.label}
              onClick={() =>
                router.push(
                  stat.filter
                    ? `/student/applications?status=${stat.filter}`
                    : "/student/applications"
                )
              }
              className="bg-card px-4 py-4 flex flex-col items-center gap-1 hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-2xl font-bold tabular-nums leading-none">
                  {stat.value}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Supervisor upgrade banner — for @zuj.edu.jo emails only */}
      {isZujStaff && (
        <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted ds-border flex items-center justify-center shrink-0">
            <ArrowUpCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">الترقية إلى مشرف</h3>
            {upgradeRequest === undefined ? null : upgradeRequest === null ? (
              <p className="text-sm text-muted-foreground mt-0.5">
                بريدك الجامعي مؤهل للترقية إلى مشرف أكاديمي. اضغط لتقديم الطلب.
              </p>
            ) : upgradeRequest.status === "pending" ? (
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-4 h-4 text-warning" />
                <p className="text-sm text-warning">طلبك قيد المراجعة من قِبل الإدارة</p>
              </div>
            ) : upgradeRequest.status === "approved" ? (
              <p className="text-sm text-success mt-0.5">تمت الموافقة على طلبك</p>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <XCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">تم رفض طلبك السابق — يمكنك إعادة التقديم</p>
              </div>
            )}
          </div>
          {(upgradeRequest === null || upgradeRequest?.status === "rejected") && (
            <Button
              onPress={() => setUpgradeOpen(true)}
              variant="primary"
              size="sm"
              className="shrink-0"
            >
              طلب الترقية
            </Button>
          )}
        </Card>
      )}

      <Dialog
        open={upgradeOpen}
        onOpenChange={(o) => {
          if (!upgradeBusy) {
            setUpgradeOpen(o);
            if (!o) setUpgradeError(null);
          }
        }}
      >
        <DialogContent
          title="طلب الترقية إلى مشرف"
          description="اشرح للأدمن سبب رغبتك بالترقية ودورك الأكاديمي حتى يستطيع البتّ بطلبك بسرعة."
          className="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="upgrade-reason" className="block text-sm font-bold mb-2">
                سبب الطلب
              </label>
              <TextArea
                id="upgrade-reason"
                fullWidth
                value={upgradeReason}
                onChange={(e) => setUpgradeReason(e.target.value)}
                placeholder="مثال: أعمل معيداً في قسم نظم المعلومات منذ سنتين وأشرف على ٣ مشاريع تخرج حالياً."
                className="min-h-[120px]"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground font-medium mt-1.5">
                {upgradeReason.trim().length} / 1000 — 20 حرفاً على الأقل
              </p>
            </div>
            {upgradeError && (
              <p className="text-xs font-bold text-destructive">{upgradeError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onPress={handleUpgradeRequest}
                isDisabled={upgradeBusy}
                variant="primary"
                fullWidth
              >
                {upgradeBusy ? <Spinner size="sm" color="current" /> : <Send className="w-4 h-4" />}
                إرسال الطلب
              </Button>
              <Button
                onPress={() => {
                  if (!upgradeBusy) setUpgradeOpen(false);
                }}
                variant="outline"
                fullWidth
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Upcoming meetings — renders nothing when empty */}
      <UpcomingMeetingsCard />

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentApplicationsCard />
        <RecentNotificationsCard />
      </div>
    </div>
  );
}
