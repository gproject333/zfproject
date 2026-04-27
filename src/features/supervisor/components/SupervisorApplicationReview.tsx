"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import PdfViewer from "@/components/PdfViewerLazy";
import ApplicationDetailsView from "@/features/applications/components/ApplicationDetailsView";
import ApplicationHeader from "@/features/applications/components/ApplicationHeader";
import StatusStepper from "@/features/applications/components/StatusStepper";
import { useApplication } from "@/features/applications/hooks/useApplication";
import { usePresence } from "@/features/applications/hooks/usePresence";
import { useReview } from "@/features/supervisor/hooks/useReview";
import ReviewPanel from "./ReviewPanel";
import ReviewHistoryTimeline from "./ReviewHistoryTimeline";
import StudentProfileCard from "./StudentProfileCard";

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
  const presenceOthers = usePresence(app?._id);
  const [showPdf, setShowPdf] = useState(false);

  if (app === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
        presenceOthers={presenceOthers}
        onBack={() => router.push("/supervisor/applications")}
        titleSize="2xl"
      />

      {/* Progress stepper */}
      <StatusStepper status={app.status} />

      {/* Main grid: profile sidebar + details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile + Details */}
        <div className="lg:col-span-2 space-y-6">
          <StudentProfileCard applicationId={app._id} />
          <ApplicationDetailsView
            app={app}
            pdfUrl={pdfUrl}
            videoUrl={videoUrl}
            onShowPdf={() => setShowPdf(true)}
            canEdit={false}
            hideSupervisorFeedback
          />
        </div>

        {/* Right column - Review Panel + History */}
        <div className="space-y-6">
          <ReviewPanel
            review={review}
            onSaved={() => router.push("/supervisor/applications")}
          />
          <ReviewHistoryTimeline applicationId={app._id} />
        </div>
      </div>
    </div>
  );
}
