"use client";

import { motion } from "framer-motion";
import { Bell, CalendarClock, CheckCircle2, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface JourneyCard {
  icon: LucideIcon;
  step: string;
  time: string;
  title: string;
  body: string;
  accentBg: string;
  accentText: string;
  glow: string;
  isFresh?: boolean;
}

const JOURNEY_CARDS: JourneyCard[] = [
  {
    icon: CheckCircle2,
    step: "١",
    time: "قبل يومين",
    title: "اعتماد المشروع",
    body: "نظام إدارة المخزون الذكي · فكرة ريادية",
    accentBg: "bg-success/15",
    accentText: "text-success",
    glow: "shadow-[0_18px_45px_-18px_rgba(34,197,94,0.5)]",
  },
  {
    icon: CalendarClock,
    step: "٢",
    time: "أمس · الساعة ٣ عصرًا",
    title: "موعد لقاء مع المشرف الأكاديمي",
    body: "الخميس · الساعة ١٠ صباحًا · مكتب الكلية",
    accentBg: "bg-accent/15",
    accentText: "text-accent",
    glow: "shadow-[0_18px_45px_-18px_rgba(36,82,55,0.55)]",
  },
  {
    icon: Heart,
    step: "٣",
    time: "حديثًا",
    title: "اهتمام جهة داعمة بالمشروع",
    body: "شركة متخصصة في حلول سلاسل التوريد",
    accentBg: "bg-secondary/20",
    accentText: "text-secondary-border",
    glow: "shadow-[0_22px_55px_-15px_rgba(201,162,39,0.6)]",
    isFresh: true,
  },
];

export function SpotlightBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--secondary) 28%, transparent) 0%, transparent 55%), radial-gradient(circle at 15% 80%, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 55%)",
        }}
      />
      <motion.div
        className="absolute top-12 right-[18%] w-40 h-40 rounded-full opacity-25 blur-2xl"
        style={{ background: "var(--secondary)" }}
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-[20%] w-56 h-56 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--accent)" }}
        animate={{ y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function SpotlightMockup() {
  return (
    <div className="relative w-full max-w-[400px] mx-auto py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="absolute -top-2 right-2 sm:right-4 inline-flex items-center gap-2 text-[11px] font-extrabold bg-card/95 backdrop-blur ds-border rounded-full px-3 py-1.5 shadow-lg z-30"
      >
        <Bell className="w-3.5 h-3.5 text-secondary-border" />
        نموذج لمراحل مشروع طالب
      </motion.div>

      <div
        aria-hidden
        className="absolute top-8 bottom-4 right-[34px] w-px overflow-hidden"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--secondary) 55%, transparent) 12%, color-mix(in srgb, var(--accent) 45%, transparent) 50%, color-mix(in srgb, var(--success) 50%, transparent) 88%, transparent)",
          }}
        />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-1 h-10 rounded-full bg-secondary/80 blur-[2px]"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: ["-10%", "110%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
        />
      </div>

      <ul className="space-y-4 relative">
        {JOURNEY_CARDS.map((c, i) => (
          <motion.li
            key={c.title}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-stretch gap-3"
          >
            <div className="relative w-[68px] shrink-0 flex flex-col items-center pt-3">
              <div
                className={`relative w-10 h-10 rounded-full ${c.accentBg} ${c.accentText} flex items-center justify-center font-black text-base z-10 ds-border bg-card`}
              >
                {c.step}
                {c.isFresh && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-secondary"
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </div>
              <span className="mt-1.5 text-[9px] font-extrabold text-foreground/55 tracking-wide">
                {c.time}
              </span>
            </div>

            <div
              className={`flex-1 min-w-0 rounded-2xl bg-card ds-border ${c.glow} p-4 transition-transform duration-300 hover:-translate-y-0.5`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-11 h-11 rounded-xl ${c.accentBg} ${c.accentText} flex items-center justify-center shrink-0`}
                >
                  <c.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-foreground leading-snug truncate">
                      {c.title}
                    </p>
                    {c.isFresh && (
                      <span className="text-[9px] font-black text-secondary-border bg-secondary/15 border border-secondary/40 rounded-full px-1.5 py-0.5 shrink-0">
                        جديد
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed line-clamp-2">
                    {c.body}
                  </p>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
