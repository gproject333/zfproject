"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { CheckCircle2, ArrowLeft, List } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import PdfViewer from "@/components/PdfViewerLazy";
import ApplicationDetailsView from "@/features/applications/components/ApplicationDetailsView";
import ApplicationHeader from "@/features/applications/components/ApplicationHeader";
import StatusStepper from "@/features/applications/components/StatusStepper";
import { useApplication } from "@/features/applications/hooks/useApplication";

import { useReview } from "@/features/supervisor/hooks/useReview";
import ReviewPanel from "./ReviewPanel";
import ReviewHistoryTimeline from "./ReviewHistoryTimeline";
import StudentProfileButton from "./StudentProfileButton";
import ScheduleMeetingButton from "./ScheduleMeetingButton";
import OliveSpinner from "@/components/OliveSpinner";

/**
 * Supervisor application review page. Composes a hero card (title +
 * type + status badge) → stepper → sidebar grid (student profile +
 * application details) → review panel + history.
 */
export default function SupervisorApplicationReview() {
  const router = useRouter();
  const params = useParams();
  const appId = params.id as Id<"applications">;

  const { app, pdfUrl, videoUrl } = useApplication(appId);
  const review = useReview(app);

  const [showPdf, setShowPdf] = useState(false);
  const [savedDialog, setSavedDialog] = useState(false);
  // Live-updated pool of still-pending applications, current one excluded
  // — drives the "Review next" CTA in the post-save dialog.
  const nextPending = useQuery(api.applications.supervisor.nextPendingApplication, {
    excludeId: appId,
  });

  if (app === undefined) {
    return (
      <div className="flex justify-center py-20">
        <OliveSpinner size="lg" className="text-accent" />
      </div>
    );
  }

  if (app === null) {
    return <div className="text-center py-20 font-bold">الطلب غير موجود</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {showPdf && pdfUrl && (
        <PdfViewer url={pdfUrl} title={app.projectName} onClose={() => setShowPdf(false)} />
      )}

      <ApplicationHeader
        app={app}

        onBack={() => router.push("/supervisor/applications")}
        titleSize="2xl"
      />

      {/* Progress stepper */}
      <StatusStepper status={app.status} />

      {/* Main grid: profile sidebar + details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile + Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StudentProfileButton applicationId={app._id} />
            <ScheduleMeetingButton
              studentId={app.studentId}
              applicationId={app._id}
            />
          </div>
          <ApplicationDetailsView
            app={app}
            pdfUrl={pdfUrl}
            videoUrl={videoUrl}
            onShowPdf={() => setShowPdf(true)}
          />
        </div>

        {/* Right column - Review Panel + History */}
        <div className="space-y-6">
          <ReviewPanel
            review={review}
            onSaved={() => setSavedDialog(true)}
          />
          <ReviewHistoryTimeline applicationId={app._id} />
        </div>
      </div>

      {/* Post-save dialog: keeps the supervisor in flow. If there's a
          pending app to review, the primary CTA jumps straight to it;
          otherwise they return to the list with a "inbox clear" message. */}
      <Dialog open={savedDialog} onOpenChange={setSavedDialog}>
        <DialogContent title="تم حفظ القرار" className="max-w-md">
          <div className="space-y-5">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center ring-4 ring-success/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground font-medium leading-relaxed">
              {nextPending?.id
                ? `تبقّى ${nextPending.remaining} طلب${nextPending.remaining === 1 ? "" : "اً"} بانتظار القرار. يمكن متابعة المراجعة أو العودة إلى القائمة.`
                : "اكتملت مراجعة جميع الطلبات. لا توجد طلبات معلّقة في الوقت الحالي."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {nextPending?.id ? (
                <Button
                  onPress={() => {
                    setSavedDialog(false);
                    router.push(`/supervisor/applications/${nextPending.id}`);
                  }}
                  variant="primary"
                  fullWidth
                >
                  مراجعة الطلب التالي
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              ) : null}
              <Button
                onPress={() => {
                  setSavedDialog(false);
                  router.push("/supervisor/applications");
                }}
                variant={nextPending?.id ? "outline" : "primary"}
                fullWidth
              >
                <List className="w-4 h-4" />
                العودة إلى القائمة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
