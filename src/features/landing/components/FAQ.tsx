"use client";

import { HelpCircle } from "lucide-react";
import { Accordion } from "@/components/ui";
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

        <Accordion>
          {ITEMS.map((item, i) => (
            <Accordion.Item key={i} id={`faq-${i}`}>
              <Accordion.Heading>
                <Accordion.Trigger className="text-right font-bold text-sm">
                  {item.q}
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="text-sm text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed">
                  {item.a}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
