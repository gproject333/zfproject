import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireSupervisor } from "./lib/auth";
import { assertMaxLength } from "./lib/validation";
import { maybeSendWhatsapp } from "./lib/notifications";

/**
 * Schedule a meeting between a supervisor and a student. The meeting row
 * is the source of truth; we also drop a `meeting` notification into the
 * student's inbox so they see it immediately without polling a separate
 * surface.
 */
export const scheduleMeeting = mutation({
  args: {
    studentId: v.id("users"),
    scheduledAt: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);

    const student = await ctx.db.get(args.studentId);
    if (!student || student.role !== "student") {
      throw new Error("الطالب غير موجود");
    }
    if (args.scheduledAt < Date.now() - 60_000) {
      throw new Error("تاريخ اللقاء يجب أن يكون مستقبلياً");
    }
    assertMaxLength("meetingLocation", args.location);
    assertMaxLength("meetingNotes", args.notes);

    const meetingId = await ctx.db.insert("meetings", {
      studentId: args.studentId,
      scheduledBy: supervisor._id,
      scheduledAt: args.scheduledAt,
      location: args.location?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      applicationId: args.applicationId,
      createdAt: Date.now(),
    });

    const when = new Date(args.scheduledAt).toLocaleString("ar-EG", {
      dateStyle: "long",
      timeStyle: "short",
    });
    const supervisorLabel = supervisor.name?.trim() || "المشرف";
    const locationLine = args.location?.trim() ? ` — ${args.location.trim()}` : "";
    await ctx.db.insert("notifications", {
      userId: args.studentId,
      title: "موعد لقاء جديد",
      message: `${supervisorLabel} حدّد معك موعد لقاء يوم ${when}${locationLine}`,
      type: "meeting",
      applicationId: args.applicationId,
      read: false,
      requireAck: true,
      createdAt: Date.now(),
    });

    await maybeSendWhatsapp(ctx, {
      userId: args.studentId,
      kind: "meeting",
      data: {
        action: "scheduled",
        meetingDate: when,
        supervisorName: supervisorLabel,
        location: args.location?.trim() ?? "",
      },
    });

    return meetingId;
  },
});

/** Student-facing: upcoming meetings sorted soonest-first. */
export const myUpcomingMeetings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || user.role !== "student") return [];

    const now = Date.now();
    const rows = await ctx.db
      .query("meetings")
      .withIndex("by_student_scheduled", (q) => q.eq("studentId", user._id))
      .collect();

    const upcoming = rows.filter((m) => m.scheduledAt >= now - 30 * 60_000);
    upcoming.sort((a, b) => a.scheduledAt - b.scheduledAt);

    return await Promise.all(
      upcoming.map(async (m) => {
        const supervisor = await ctx.db.get(m.scheduledBy);
        return {
          _id: m._id,
          scheduledAt: m.scheduledAt,
          location: m.location ?? null,
          notes: m.notes ?? null,
          applicationId: m.applicationId ?? null,
          supervisorName: supervisor?.name ?? null,
        };
      }),
    );
  },
});

/** Supervisor-facing: meetings I scheduled, newest first. */
export const myScheduledMeetings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || (user.role !== "supervisor" && user.role !== "admin")) return [];

    const rows = await ctx.db
      .query("meetings")
      .withIndex("by_scheduledBy", (q) => q.eq("scheduledBy", user._id))
      .collect();

    rows.sort((a, b) => b.scheduledAt - a.scheduledAt);

    return await Promise.all(
      rows.map(async (m) => {
        const student = await ctx.db.get(m.studentId);
        return {
          _id: m._id,
          scheduledAt: m.scheduledAt,
          location: m.location ?? null,
          notes: m.notes ?? null,
          applicationId: m.applicationId ?? null,
          studentName: student?.name ?? null,
          studentEmail: student?.email ?? null,
        };
      }),
    );
  },
});

/** Delete a meeting; only the supervisor who scheduled it can cancel. */
export const cancelMeeting = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const user = await requireSupervisor(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) return;
    if (meeting.scheduledBy !== user._id && user.role !== "admin") {
      throw new Error("لا يمكنك إلغاء موعد لم تحدده");
    }
    await ctx.db.delete(args.meetingId);

    await ctx.db.insert("notifications", {
      userId: meeting.studentId,
      title: "تم إلغاء موعد لقاء",
      message: `أُلغي اللقاء المقرر يوم ${new Date(meeting.scheduledAt).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}`,
      type: "meeting",
      applicationId: meeting.applicationId,
      read: false,
      requireAck: true,
      createdAt: Date.now(),
    });

    await maybeSendWhatsapp(ctx, {
      userId: meeting.studentId,
      kind: "meeting",
      data: {
        action: "cancelled",
        meetingDate: new Date(meeting.scheduledAt).toLocaleString("ar-EG", {
          dateStyle: "long",
          timeStyle: "short",
        }),
      },
    });
  },
});
