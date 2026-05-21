"use client";

import { HelpCircle, Sparkles } from "lucide-react";
import { Accordion } from "@/components/ui";

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

/**
 * Frequently asked questions. Each Accordion.Item is wrapped in a glass card
 * so the stack reads as premium without changing the shared Accordion
 * primitive (other places in the app still rely on its default chrome).
 */
export default function FAQ() {
  return (
    <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
      <div className="relative z-[1] max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            أسئلة شائعة
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            كل ما تحتاج{" "}
            <span className="gradient-text">معرفته</span>
          </h2>
          <p className="text-foreground/60 mt-4 text-base sm:text-lg">
            أجوبة سريعة لأكثر الأسئلة شيوعاً. لم تجد سؤالك؟ تواصل معنا مباشرة.
          </p>
        </div>

        <div className="space-y-3">
          <Accordion>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl glass ring-1 ring-foreground/10 px-4 sm:px-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5 mb-3 last:mb-0 overflow-hidden"
              >
                <Accordion.Item id={`faq-${i}`}>
                  <Accordion.Heading>
                    <Accordion.Trigger className="text-right font-bold text-sm sm:text-base py-1">
                      <span className="flex items-center gap-2.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                        {item.q}
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body className="text-sm sm:text-base text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed">
                      {item.a}
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
