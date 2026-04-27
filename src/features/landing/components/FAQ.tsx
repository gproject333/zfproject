"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { DecorationsB } from "./SectionDecorations";

const ITEMS = [
  {
    q: "كيف أقدّم طلب احتضان؟",
    a: "سجّل حساباً جديداً، ثم اختر نوع الاحتضان المناسب (فكرة ريادية، مشروع IT، أو مشروع يخدم الجامعة)، واملأ النموذج بالمعلومات المطلوبة وارفق الملفات اللازمة.",
  },
  {
    q: "ما هي أنواع الاحتضان المتاحة؟",
    a: "ثلاثة مسارات: فكرة ريادية — لتحويل فكرتك إلى مشروع حقيقي، مشروع تخرج IT — بدعم تقني وإرشاد أكاديمي، ومشروع يخدم الجامعة — لحلول مبتكرة تضيف قيمة للمجتمع الجامعي.",
  },
  {
    q: "كم تستغرق مراجعة الطلب؟",
    a: "يقوم المشرفون بمراجعة الطلبات بشكل دوري. ستصلك إشعارات فورية عند أي تحديث على حالة طلبك سواء تم القبول أو طُلب منك تعديل.",
  },
  {
    q: "هل يمكنني تعديل طلبي بعد التقديم؟",
    a: "نعم، إذا طلب المشرف تعديلات ستتمكن من تعديل طلبك وإعادة تقديمه مع الملاحظات المطلوبة.",
  },
  {
    q: "هل المنصة مجانية؟",
    a: "نعم، التقديم والمتابعة مجانيان بالكامل لجميع طلاب جامعة الزيتونة الأردنية.",
  },
  {
    q: "كيف أتابع حالة طلبي؟",
    a: "من لوحة التحكم الخاصة بك يمكنك متابعة حالة جميع طلباتك (مسودة، قيد المراجعة، مقبول، يحتاج تعديل) مع إشعارات فورية لكل تحديث.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section className="relative px-4 py-16 overflow-hidden">
      <DecorationsB />
      <div className="relative z-[1] max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 nb-badge bg-primary/10 text-primary mb-4 text-sm px-4 py-1.5">
            <HelpCircle className="w-4 h-4" />
            أسئلة شائعة
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            كل ما تحتاج{" "}
            <span className="relative inline-block">
              معرفته
              <span className="absolute bottom-0 left-0 right-0 h-3 bg-secondary/30 -z-10" />
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="nb-card overflow-hidden animate-slide-up"
                style={{ opacity: 0, animationDelay: `${i * 0.06}s` }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right font-bold text-sm hover:bg-muted/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-foreground/50 dark:text-foreground/60 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
