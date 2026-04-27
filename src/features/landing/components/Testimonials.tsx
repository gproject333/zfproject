"use client";

import { Quote, GraduationCap } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "أحمد الخطيب",
    role: "طالب ريادة أعمال",
    quote:
      "حاضنة الزيتونة ساعدتني على تحويل فكرتي من مجرد مشروع تخرج إلى شركة ناشئة حقيقية. الدعم الأكاديمي والإرشاد كانا لا يقدران بثمن.",
    color: "bg-primary/10 border-r-primary",
  },
  {
    name: "سارة المحمود",
    role: "مشروع تخرج IT",
    quote:
      "التقديم الرقمي والمتابعة المباشرة مع المشرفين جعلا العملية سلسة جداً. أنصح كل طالب بتجربة المنصة.",
    color: "bg-secondary/10 border-r-secondary",
  },
  {
    name: "محمد العبادي",
    role: "مشروع يخدم الجامعة",
    quote:
      "حصلت على ملاحظات بنّاءة من المشرفين خلال أيام، وتم قبول مشروعي بسرعة. تجربة ممتازة من البداية إلى النهاية.",
    color: "bg-accent/10 border-r-accent",
  },
];

export default function Testimonials() {
  return (
    <section className="px-4 py-16 bg-muted/40 dark:bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 nb-badge bg-primary/10 text-primary mb-4 text-sm px-4 py-1.5">
            <GraduationCap className="w-4 h-4" />
            ماذا يقول طلابنا
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            قصص نجاح{" "}
            <span className="relative inline-block">
              ملهمة
              <span className="absolute bottom-0 left-0 right-0 h-3 bg-secondary/30 -z-10" />
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`nb-card p-6 border-r-[5px] ${t.color} animate-slide-up`}
              style={{ opacity: 0, animationDelay: `${i * 0.12}s` }}
            >
              <Quote className="w-8 h-8 text-primary/40 mb-3" />
              <p className="text-sm font-medium leading-relaxed text-foreground mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full nb-border bg-muted flex items-center justify-center">
                  <span className="text-sm font-black text-foreground">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-extrabold">{t.name}</p>
                  <p className="text-xs text-foreground/60 dark:text-foreground/70 font-bold">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
