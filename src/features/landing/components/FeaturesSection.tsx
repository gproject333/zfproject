"use client";

import { Lightbulb, Code2, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DecorationsA } from "./SectionDecorations";

const FEATURES = [
  {
    icon: Lightbulb,
    color: "bg-primary",
    iconColor: "text-primary-foreground",
    glowColor: "shadow-primary/20",
    title: "فكرة ريادية",
    desc: "حوّل فكرتك إلى مشروع حقيقي بدعم أكاديمي ومنهجية واضحة.",
    tag: "Startup",
  },
  {
    icon: Code2,
    color: "bg-secondary",
    iconColor: "text-secondary-foreground",
    glowColor: "shadow-secondary/20",
    title: "مشروع IT",
    desc: "احصل على الدعم التقني والإرشاد الأكاديمي لمشروعك.",
    tag: "Tech",
  },
  {
    icon: Building2,
    color: "bg-accent",
    iconColor: "text-accent-foreground",
    glowColor: "shadow-accent/20",
    title: "مشروع يخدم الجامعة",
    desc: "قدّم حلولاً مبتكرة تضيف قيمة مباشرة للمجتمع الجامعي.",
    tag: "Academic",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative px-4 py-16 overflow-hidden">
      <DecorationsA />

      <div className="relative z-[1] max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black">
            ثلاثة مسارات،{" "}
            <span className="relative inline-block">
              لا حدود للطموح
              <span className="absolute bottom-0 left-0 right-0 h-3 bg-secondary/30 -z-10" />
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link
                href="/register"
                key={i}
                className="nb-card-interactive p-6 group animate-slide-up block text-right cursor-pointer"
                style={{ opacity: 0, animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-lg ${f.glowColor}`}
                  >
                    <Icon className={`w-8 h-8 ${f.iconColor}`} strokeWidth={1.5} />
                  </div>
                  <span className="nb-tag bg-muted text-muted-foreground dark:text-foreground/80">{f.tag}</span>
                </div>
                <h3 className="text-xl font-extrabold mb-2">{f.title}</h3>
                <p className="text-sm text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed">
                  {f.desc}
                </p>
                <div className="mt-5 flex items-center gap-1 text-primary font-bold text-sm group-hover:gap-2 transition-all">
                  <span>تقديم طلب</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
