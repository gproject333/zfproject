"use client";

import { Lightbulb, FileText, GraduationCap, ArrowLeft } from "lucide-react";

export function MistBackground() {
  return (
    <>
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-30 pointer-events-none blur-3xl"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-24 w-[460px] h-[460px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: "var(--color-secondary)" }}
      />
    </>
  );
}

export function MistMockup() {
  const types = [
    { icon: Lightbulb, title: "فكرة ريادية", desc: "مشروع تجاري قابل للتنفيذ", active: true },
    { icon: FileText, title: "مشروع تخرج (IT)", desc: "مشروع تقني ضمن متطلبات التخرج", active: false },
    { icon: GraduationCap, title: "مشروع يخدم الجامعة", desc: "مشروع يقدم قيمة للمجتمع الجامعي", active: false },
  ];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-primary/8 -rotate-[2deg] translate-x-3 translate-y-3"
      />
      <div className="relative rounded-2xl bg-card ds-border shadow-[0_20px_50px_-20px_rgba(31,92,46,0.25)] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
          <p className="text-xs font-extrabold text-foreground">اختيار نوع الاحتضان</p>
          <h3 className="text-base font-extrabold text-foreground mt-1">حدِّد نوع المشروع</h3>
          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
            يُختار النوع وفق طبيعة المشروع ومتطلباته
          </p>
        </div>

        <ul className="p-3 space-y-2">
          {types.map((t) => (
            <li key={t.title}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  t.active ? "bg-primary/8 ring-1 ring-primary/30" : "bg-muted/30 ds-border"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    t.active ? "bg-primary text-primary-foreground" : "bg-card text-foreground/60"
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{t.desc}</p>
                </div>
                {t.active && (
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    مختار
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="px-5 pb-5 pt-2 border-t border-border/40">
          <div className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm">
            متابعة
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
