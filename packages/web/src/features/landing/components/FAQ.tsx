"use client";

import { Sparkles } from "lucide-react";
import { Accordion } from "@/components/ui";

const ITEMS = [
  {
    q: "كيف يُقدَّم طلب الاحتضان؟",
    a: "يُنشئ الطالب حسابه الرسمي على المنصة باستخدام البريد الجامعي المعتمد، ثم يختار نوع المشروع المناسب (فكرة ريادية، أو مشروع تخرج IT، أو مشروع يخدم الجامعة)، ويُعبّئ نموذج الطلب ويُرفِق المستندات المطلوبة.",
  },
  {
    q: "ما أنواع الاحتضان المتاحة؟",
    a: "تُتاح ثلاثة مسارات: مسار الفكرة الريادية لتطوير المشاريع التجارية الناشئة، ومسار مشروع تخرج تكنولوجيا المعلومات بإشراف أكاديمي وتقني، ومسار المشاريع التطبيقية التي تخدم المجتمع الجامعي.",
  },
  {
    q: "ما المدة اللازمة لمراجعة الطلب؟",
    a: "تتم مراجعة الطلبات من قِبل المشرفين الأكاديميين خلال مدة وجيزة، ويُبلَّغ الطالب بأي تحديث على حالة طلبه عبر إشعارات رسمية على المنصة.",
  },
  {
    q: "هل يمكن تعديل الطلب بعد تقديمه؟",
    a: "نعم، في حال طلب المشرف الأكاديمي إجراء تعديلات، يستطيع الطالب تحديث الطلب وإعادة تقديمه وفق الملاحظات المُبلَّغة.",
  },
  {
    q: "هل التسجيل على المنصة مجاني؟",
    a: "نعم، يُتاح التسجيل والتقديم والمتابعة لجميع طلبة جامعة الزيتونة الأردنية دون أي رسوم.",
  },
  {
    q: "كيف تتم متابعة حالة الطلب؟",
    a: "تُتاح للطالب لوحة تحكم خاصة تعرض جميع طلباته وحالاتها (مسودة، قيد المراجعة، يحتاج تعديل، مقبول)، مع إشعارات فورية عند كل تحديث.",
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
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
            الأسئلة{" "}
            <span className="text-primary">الشائعة</span>
          </h2>
          <p className="text-foreground/65 mt-6 text-xl sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            إجابات رسمية على أبرز ما يَرِد من استفسارات بشأن إجراءات الاحتضان والتقديم على المنصة.
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
