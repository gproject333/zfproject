"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { CalendarClock, MapPin, User as UserIcon } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui";

/**
 * Inline student-dashboard card listing meetings a supervisor has
 * scheduled with the student. Rendered above the "recent activity" row so
 * a fresh meeting catches the eye even if the bell wasn't checked.
 *
 * Renders nothing while the query is loading or when there are no
 * upcoming meetings — keeps the dashboard quiet by default.
 */
export default function UpcomingMeetingsCard() {
  const meetings = useQuery(api.meetings.myUpcomingMeetings, {});

  if (!meetings || meetings.length === 0) return null;

  return (
    <Card className="p-5 border-accent/30 bg-accent/[0.04]">
      <header className="flex items-center gap-2.5 mb-4">
        <span className="w-9 h-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shadow-md">
          <CalendarClock className="w-4 h-4" />
        </span>
        <div>
          <h3 className="font-extrabold text-base leading-none">لقاءات قادمة</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            مواعيد حدّدها لك المشرف
          </p>
        </div>
      </header>

      <ul className="space-y-3">
        {meetings.map((m) => (
          <li key={m._id}>
            <MeetingRow meeting={m} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

type Meeting = NonNullable<
  ReturnType<typeof useQuery<typeof api.meetings.myUpcomingMeetings>>
>[number];

function MeetingRow({ meeting }: { meeting: Meeting }) {
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

  const Wrapper = meeting.applicationId
    ? ({ children }: { children: React.ReactNode }) => (
        <Link
          href={`/student/applications/${meeting.applicationId}`}
          className="block rounded-xl border border-foreground/[0.08] bg-card p-4 hover:border-accent/40 hover:shadow-sm transition-all"
        >
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="rounded-xl border border-foreground/[0.08] bg-card p-4">
          {children}
        </div>
      );

  return (
    <Wrapper>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center justify-center w-14 shrink-0 rounded-lg bg-gradient-to-br from-accent to-accent/80 text-accent-foreground p-2 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {date.toLocaleDateString("ar-EG", { month: "short" })}
          </span>
          <span className="text-xl font-black leading-none">
            {date.getDate()}
          </span>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-extrabold text-sm leading-snug">
            {dateLabel} — <span className="text-accent">{timeLabel}</span>
          </p>
          {meeting.location && (
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate" dir="auto">{meeting.location}</span>
            </p>
          )}
          {meeting.notes && (
            <p className="text-xs text-foreground/80 font-medium line-clamp-2 leading-relaxed">
              {meeting.notes}
            </p>
          )}
          {meeting.supervisorName && (
            <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              مع {meeting.supervisorName}
            </p>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
