"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { CalendarClock, MapPin, User as UserIcon, History, ChevronDown } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { Card } from "@/components/ui";

/** Meetings at or after this margin before "now" still count as upcoming. */
const UPCOMING_GRACE_MS = 30 * 60_000;
/** Past meetings shown before the "show all" toggle kicks in. */
const PAST_PREVIEW_COUNT = 3;

/**
 * Student-dashboard meetings card. Splits every meeting a supervisor has
 * scheduled into "upcoming" (soonest first) and "past" (most recent first),
 * each in its own labelled section so a student with several meetings can
 * scan time order at a glance. Past meetings collapse behind a toggle to
 * keep the card compact.
 *
 * Renders nothing while loading or when there are no meetings at all.
 */
export default function UpcomingMeetingsCard() {
  const meetings = useQuery(api.meetings.myMeetings, {});
  const [showAllPast, setShowAllPast] = useState(false);
  // Snapshot "now" once at mount — stable across renders (avoids the
  // impure-Date.now-in-render lint) and good enough to split past/upcoming.
  const [now] = useState(() => Date.now());

  if (!meetings || meetings.length === 0) return null;

  // `meetings` arrives oldest-first. Upcoming keeps that order (soonest
  // first); past is reversed so the most recent sits on top.
  const upcoming = meetings.filter((m) => m.scheduledAt >= now - UPCOMING_GRACE_MS);
  const past = meetings
    .filter((m) => m.scheduledAt < now - UPCOMING_GRACE_MS)
    .reverse();

  const visiblePast = showAllPast ? past : past.slice(0, PAST_PREVIEW_COUNT);

  return (
    <Card className="p-5 border-accent/30 bg-accent/[0.04]">
      <header className="flex items-center gap-2.5 mb-4">
        <span className="w-9 h-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shadow-md shrink-0">
          <CalendarClock className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base leading-none">اللقاءات والمواعيد</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            مواعيد حدّدها المشرف.
          </p>
        </div>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-accent/15 text-accent shrink-0">
          {meetings.length}
        </span>
      </header>

      {upcoming.length > 0 && (
        <section className="mb-3 last:mb-0">
          <SectionLabel
            icon={<CalendarClock className="w-3.5 h-3.5" />}
            label="القادمة"
            count={upcoming.length}
            tone="accent"
          />
          <ul className="space-y-2 mt-2">
            {upcoming.map((m) => (
              <li key={m._id}>
                <MeetingRow meeting={m} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className={upcoming.length > 0 ? "pt-3 border-t border-foreground/[0.08]" : ""}>
          <SectionLabel
            icon={<History className="w-3.5 h-3.5" />}
            label="السابقة"
            count={past.length}
            tone="muted"
          />
          <ul className="space-y-2 mt-2">
            {visiblePast.map((m) => (
              <li key={m._id}>
                <MeetingRow meeting={m} isPast />
              </li>
            ))}
          </ul>
          {past.length > PAST_PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllPast((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAllPast ? "rotate-180" : ""}`}
              />
              {showAllPast ? "عرض أقل" : `عرض كل السابقة (${past.length})`}
            </button>
          )}
        </section>
      )}
    </Card>
  );
}

function SectionLabel({
  icon,
  label,
  count,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: "accent" | "muted";
}) {
  const toneClass = tone === "accent" ? "text-accent" : "text-muted-foreground";
  return (
    <div className={`flex items-center gap-1.5 text-xs font-extrabold ${toneClass}`}>
      {icon}
      {label}
      <span className="text-[10px] font-bold opacity-70">({count})</span>
    </div>
  );
}

type Meeting = NonNullable<
  ReturnType<typeof useQuery<typeof api.meetings.myMeetings>>
>[number];

function MeetingRow({ meeting, isPast = false }: { meeting: Meeting; isPast?: boolean }) {
  const date = new Date(meeting.scheduledAt);
  const dateLabel = date.toLocaleDateString("ar-EG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateBlockClass = isPast
    ? "bg-muted text-muted-foreground"
    : "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground";

  const body = (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex flex-col items-center justify-center w-10 shrink-0 rounded-md py-1 shadow-sm ${dateBlockClass}`}
      >
        <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
          {date.toLocaleDateString("ar-EG", { month: "short" })}
        </span>
        <span className="text-base font-black leading-tight">{date.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-tight flex items-center gap-1.5 flex-wrap">
          <span>
            {dateLabel} —{" "}
            <span className={isPast ? "text-muted-foreground" : "text-accent"}>
              {timeLabel}
            </span>
          </span>
          {isPast && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              منتهٍ
            </span>
          )}
        </p>
        {(meeting.location || meeting.supervisorName) && (
          <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-x-2.5 gap-y-0.5 flex-wrap mt-0.5">
            {meeting.location && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate" dir="auto">{meeting.location}</span>
              </span>
            )}
            {meeting.supervisorName && (
              <span className="inline-flex items-center gap-1">
                <UserIcon className="w-3 h-3 shrink-0" />
                {meeting.supervisorName}
              </span>
            )}
          </p>
        )}
        {meeting.notes && (
          <p className="text-[11px] text-foreground/70 font-medium line-clamp-1 mt-0.5">
            {meeting.notes}
          </p>
        )}
      </div>
    </div>
  );

  const baseClass = `block rounded-lg border px-3 py-2.5 transition-all ${
    isPast
      ? "border-foreground/[0.06] bg-card/60 opacity-90"
      : "border-foreground/[0.08] bg-card"
  }`;

  if (meeting.applicationId) {
    return (
      <Link
        href={`/student/applications/${meeting.applicationId}`}
        className={`${baseClass} hover:border-accent/40 hover:shadow-sm`}
      >
        {body}
      </Link>
    );
  }
  return <div className={baseClass}>{body}</div>;
}
