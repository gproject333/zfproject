"use client";

import { Target, Compass, HeartHandshake, Sparkles, type LucideIcon } from "lucide-react";
import Image from "next/image";

interface PillarCard {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: "primary" | "secondary" | "accent";
}

/**
 * "من نحن" — informational section. Three pillar cards covering vision,
 * mission, and what's offered. Restyled to match the premium glass identity
 * used by the rest of the landing page; data is unchanged.
 */
const PILLARS: PillarCard[] = [
  {
    icon: Compass,
    title: "رؤيتنا",
    body:
      "أن نكون البيئة الجامعية الأولى والوجهة الرائدة في المملكة لاحتضان المشاريع التكنولوجية، ونقطة الانطلاق الأقوى لتخريج جيل من روّاد الأعمال المبتكرين.",
    tone: "accent",
  },
  {
    icon: Target,
    title: "رسالتنا",
    body:
      "تمكين طاقات طلبة جامعة الزيتونة وتوجيهها، من خلال توفير منصة رقمية تفاعلية تربط أصحاب الأفكار بالخبرات الأكاديمية، لتطوير مشاريعهم وفق أحدث المعايير.",
    tone: "secondary",
  },
  {
    icon: HeartHandshake,
    title: "ما نقدّمه",
    body:
      "إرشاد أكاديمي متخصص، ومتابعة حثيثة لكل مرحلة من مراحل بناء المشروع. نحن نوفر لك التقييم والدعم المستمر لضمان تطور فكرتك من المخطط الأولي وحتى التنفيذ النهائي.",
    tone: "primary",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative px-4 py-20 sm:py-28 overflow-hidden"
      aria-labelledby="about-heading"
    >
      <div className="relative z-[1] max-w-6xl mx-auto">
        {/* Header — image + text two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16">
          {/* Image column */}
          <div className="relative w-full aspect-video md:aspect-[4/3] rounded-[2rem] overflow-hidden ring-1 ring-foreground/10 shadow-2xl shadow-primary/10 group">
            <div
              aria-hidden
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 z-10"
              style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", opacity: 0.25 }}
            />
            <div
              aria-hidden
              className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 z-10"
              style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)", opacity: 0.25 }}
            />
            <Image
              src="/about-team.png"
              alt="فريق حاضنة الزيتونة - طلاب ومشرفون أكاديميون"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Soft gradient overlay for legibility / depth */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/30 to-transparent pointer-events-none z-[5]"
            />
          </div>

          {/* Text column */}
          <div className="text-right">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 bg-primary/10 rounded-full px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              من نحن
            </span>
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6 leading-tight"
            >
              بوابتك{" "}
              <span className="text-primary">الرقمية</span>{" "}
              نحو الريادة
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 dark:text-foreground/80 font-medium max-w-2xl leading-relaxed">
              حاضنة الزيتونة منصة متكاملة تابعة لجامعة الزيتونة الأردنية، صُممت
              لتمهّد الطريق أمام إبداعات الطلاب ومشاريع تخرجهم، عبر ربطهم بنخبة
              من المشرفين الأكاديميين. نرافقك في رحلة منهجية واضحة لتحويل فكرتك
              الطموحة إلى مشروع حقيقي وواقع ملموس.
            </p>
          </div>
        </div>

        {/* Three pillars — glass cards with tone-tinted icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="relative overflow-hidden rounded-3xl glass ring-1 ring-foreground/10 p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group"
              >
                <div
                  aria-hidden
                  className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-25 group-hover:opacity-45 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `radial-gradient(circle, var(--color-${p.tone}) 0%, transparent 70%)` }}
                />
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-white ring-1 ring-foreground/10 shadow-md shadow-foreground/5"
                >
                  <Icon className={`w-7 h-7 text-${p.tone}`} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className="relative text-xl font-extrabold mb-2 text-foreground">
                  {p.title}
                </h3>
                <p className="relative text-sm sm:text-base text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed">
                  {p.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
