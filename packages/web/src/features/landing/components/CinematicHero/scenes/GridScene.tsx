"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock4, Eye } from "lucide-react";

type ApplicationStatus = "accepted" | "under_review" | "needs_modification";

export function GridBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--foreground) 16%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 45%, var(--background) 95%)",
        }}
      />
      <motion.div
        className="absolute -inset-x-32 top-0 h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, transparent 35%, color-mix(in srgb, var(--accent) 18%, transparent) 50%, transparent 65%)",
        }}
        initial={{ x: "-30%" }}
        animate={{ x: "30%" }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
    </div>
  );
}

export function GridMockup() {
  const rows: { name: string; type: string; status: ApplicationStatus; time: string }[] = [
    { name: "نظام إدارة المخزون الذكي", type: "فكرة ريادية", status: "accepted", time: "اعتُمد قبل يومين" },
    { name: "منصة دروس تفاعلية", type: "مشروع تخرج (IT)", status: "under_review", time: "قيد المراجعة" },
    { name: "نظام إدارة الفعاليات", type: "مشروع يخدم الجامعة", status: "needs_modification", time: "ملاحظات من المشرف" },
  ];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent blur-xl"
      />
      <div className="relative rounded-2xl bg-card ds-border shadow-[0_20px_50px_-20px_rgba(36,82,55,0.25)] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-foreground">طلباتي</p>
            <h3 className="text-base font-extrabold text-foreground mt-1">متابعة حالة الطلب</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            تحديث مباشر
          </span>
        </div>

        <ul className="divide-y divide-border/40">
          {rows.map((r, i) => (
            <motion.li
              key={r.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.45, ease: "easeOut" }}
              className="px-5 py-4 flex items-center gap-3"
            >
              <StatusGlyph status={r.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  {r.type} · {r.time}
                </p>
              </div>
              <StatusPill status={r.status} />
            </motion.li>
          ))}
        </ul>

        <div className="px-5 py-3 border-t border-border/40 bg-muted/30 flex items-center justify-between text-[11px] font-bold">
          <span className="text-muted-foreground">3 طلبات</span>
          <span className="text-accent">عرض الكل ←</span>
        </div>
      </div>
    </div>
  );
}

function StatusGlyph({ status }: { status: ApplicationStatus }) {
  const Icon =
    status === "accepted" ? CheckCircle2 : status === "under_review" ? Eye : Clock4;
  const cls =
    status === "accepted"
      ? "bg-success/15 text-success"
      : status === "under_review"
        ? "bg-status-pending/20 text-status-pending"
        : "bg-status-modification/15 text-status-modification";
  return (
    <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
      <Icon className="w-5 h-5" />
    </span>
  );
}

function StatusPill({ status }: { status: ApplicationStatus }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-success bg-success/15 border border-success/30 px-2 py-1 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        مقبول
      </span>
    );
  }
  if (status === "under_review") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-status-pending bg-status-pending/15 border border-status-pending/30 px-2 py-1 rounded-full">
        <Eye className="w-3 h-3" />
        مراجعة
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-status-modification bg-status-modification/15 border border-status-modification/30 px-2 py-1 rounded-full">
      <Clock4 className="w-3 h-3" />
      تعديل
    </span>
  );
}
