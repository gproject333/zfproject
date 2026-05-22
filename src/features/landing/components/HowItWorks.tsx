"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Sprout, Leaf, Trees, Award, type LucideIcon } from "lucide-react";

/**
 * Growth-metaphor timeline. Each stage of the student journey mirrors a
 * stage in the life of an olive tree: seed → sapling → mature tree → harvest.
 * A vertical line on the start-edge (right in RTL) fills as the user scrolls
 * through the section. Steps fade-up individually as they enter view.
 */

interface Stage {
  num: string;
  title: string;
  desc: string;
  metaphor: string;
  icon: LucideIcon;
}

const STAGES: Stage[] = [
  {
    num: "١",
    title: "سجّل حسابك",
    desc: "أنشئ حسابك بإيميل الجامعة الرسمي للوصول إلى لوحة الطالب.",
    metaphor: "ازرع البذرة",
    icon: Sprout,
  },
  {
    num: "٢",
    title: "قدّم فكرتك",
    desc: "اختر نوع الاحتضان (ريادي / تقني / أكاديمي) واملأ نموذج الطلب.",
    metaphor: "اسقِ الفكرة",
    icon: Leaf,
  },
  {
    num: "٣",
    title: "احصل على التقييم",
    desc: "يراجع المشرف الأكاديمي طلبك ويرد عليك خلال أيام قليلة.",
    metaphor: "تنمو الفروع",
    icon: Trees,
  },
  {
    num: "٤",
    title: "ابدأ الرحلة",
    desc: "انطلق بمشروعك بدعم كامل من الفريق الأكاديمي وأدوات المنصة.",
    metaphor: "اقطف الثمرة",
    icon: Award,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Drive the line fill from this section's own scroll position.
  // Start filling when the section's top hits 80% of viewport, finish when
  // bottom reaches the centre — feels natural with the stage spacing.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 50%"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]);

  return (
    <section ref={sectionRef} className="relative px-4 py-20 sm:py-28 overflow-hidden">
      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
            <Sprout className="w-3.5 h-3.5" />
            رحلة النمو
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            من البذرة{" "}
            <span className="text-primary">إلى الثمرة</span>
          </h2>
          <p className="text-foreground/60 mt-4 text-base sm:text-lg">
            أربع مراحل بسيطة تأخذك من فكرة عابرة إلى مشروع حقيقي.
          </p>
        </div>

        {/* Timeline: absolute line on the right (start-edge in RTL) + stages */}
        <div className="relative">
          {/* Background line (always visible, dimmed) */}
          <div
            aria-hidden
            className="absolute top-8 bottom-8 right-[23px] sm:right-[27px] w-0.5 bg-foreground/10 rounded-full"
          />
          {/* Foreground line (gradient, height driven by scroll) */}
          <motion.div
            aria-hidden
            className="absolute top-8 right-[23px] sm:right-[27px] w-0.5 origin-top rounded-full shadow-[0_0_12px_rgba(31,92,46,0.4)]"
            style={{
              bottom: 32,
              scaleY: lineScaleY,
              background: "linear-gradient(to bottom, var(--color-primary), var(--color-accent), var(--color-secondary))",
            }}
          />

          <ul className="space-y-12 sm:space-y-14">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: reduce ? 0 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-start gap-5 pr-16 sm:pr-20"
                >
                  {/* Icon on the line — sized so its centre lines up with the rail */}
                  <div className="absolute right-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white ring-2 ring-primary/25 flex items-center justify-center shadow-lg shadow-primary/15">
                    <Icon className="relative w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="text-xs font-black text-primary tracking-widest">
                        {stage.metaphor}
                      </span>
                      <span className="text-[10px] font-bold text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full">
                        المرحلة {stage.num}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black mb-2 leading-tight">
                      {stage.title}
                    </h3>
                    <p className="text-foreground/65 dark:text-foreground/75 text-sm sm:text-base font-medium leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
