"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock4, Bell, PartyPopper, X, CalendarClock, Heart } from "lucide-react";
import type { Doc } from "@smart-zuj/convex";

const SEEN_KEY_PREFIX = "smartzuj.acceptance-seen.";

/**
 * Context strip rendered above the application detail body. Two cases:
 *
 *  1. under_review → an expectations banner so the student knows the
 *     supervisor has the app and roughly when to expect a decision.
 *  2. accepted     → a celebration card with the actual next steps that
 *     unlock at that point (sponsor interest, supervisor meeting). The
 *     celebration is dismissible and the dismissal is remembered per app
 *     in localStorage, so the student doesn't see confetti on every visit.
 *
 * Returns null for every other status — the existing SupervisorFeedbackCard
 * already covers needs_modification / rejected.
 */
export default function ApplicationStatusBanner({ app }: { app: Doc<"applications"> }) {
  if (app.status === "under_review") {
    return <UnderReviewBanner />;
  }
  if (app.status === "accepted") {
    return <AcceptedCelebration appId={app._id} />;
  }
  return null;
}

function UnderReviewBanner() {
  return (
    <div className="rounded-2xl border border-status-pending/40 bg-status-pending/[0.08] p-4 sm:p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-status-pending/20 text-status-pending flex items-center justify-center shrink-0">
        <Clock4 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-extrabold text-sm">الطلب قيد المراجعة.</p>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          يقوم المشرف الأكاديمي بمراجعة الطلب. يُتوقَّع صدور القرار خلال{" "}
          <span className="font-extrabold text-foreground">3–5 أيام عمل</span>.
          سيُرسَل إليك إشعار فور صدور القرار.
        </p>
        <p className="text-[11px] text-muted-foreground font-bold flex items-center gap-1 pt-1">
          <Bell className="w-3 h-3" />
          لا حاجة للمتابعة؛ سيتم إعلامك تلقائيًا.
        </p>
      </div>
    </div>
  );
}

function AcceptedCelebration({ appId }: { appId: string }) {
  const storageKey = `${SEEN_KEY_PREFIX}${appId}`;
  // Default to dismissed during SSR so the banner doesn't pop in on the
  // first paint; the effect re-opens it if the localStorage flag is unset.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(storageKey) !== "1") setDismissed(false);
    } catch {
      /* private mode / blocked storage — keep dismissed */
    }
  }, [storageKey]);

  if (dismissed) return null;

  const close = () => {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="relative rounded-2xl border border-success/40 bg-gradient-to-br from-success/[0.08] via-success/[0.04] to-transparent p-5 sm:p-6 overflow-hidden">
      <button
        type="button"
        onClick={close}
        aria-label="إغلاق"
        className="absolute top-3 left-3 w-7 h-7 rounded-full bg-card/80 backdrop-blur ds-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-card transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-success text-white flex items-center justify-center shrink-0 shadow-[0_8px_24px_-6px_rgba(34,197,94,0.5)]">
          <PartyPopper className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg sm:text-xl text-success leading-tight">
            تم قبول الطلب.
          </h3>
          <p className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed">
            دخل المشروع رسميًا مرحلة الاحتضان. الخطوات التالية متاحة الآن:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <NextStepCard
          icon={<CalendarClock className="w-5 h-5" />}
          accent="bg-accent/15 text-accent border-accent/30"
          title="تحديد موعد لقاء مع المشرف"
          body="يمكن للمشرف تحديد موعد لمتابعة تطوير المشروع."
        />
        <NextStepCard
          icon={<Heart className="w-5 h-5" />}
          accent="bg-secondary/15 text-secondary-border border-secondary/40"
          title="إبداء الجهات الداعمة اهتمامًا"
          body="أصبح المشروع ظاهرًا للجهات الداعمة في معرض الريلز."
        />
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        <Link
          href="/student"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-success text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          العودة إلى لوحة التحكم
        </Link>
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-card text-foreground font-bold text-sm ds-border hover:bg-muted transition-colors"
        >
          إخفاء الرسالة
        </button>
      </div>
    </div>
  );
}

function NextStepCard({
  icon,
  accent,
  title,
  body,
}: {
  icon: React.ReactNode;
  accent: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-card ds-border p-3.5 flex items-start gap-3">
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${accent}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-foreground leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}
