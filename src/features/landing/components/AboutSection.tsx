"use client";

import { Target, Compass, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { DecorationsC } from "./SectionDecorations";

interface PillarCard {
  icon: typeof Target;
  title: string;
  body: string;
  accentClass: string;
}

/**
 * "من نحن" — informational section at the bottom of the landing page.
 * Replaces the old sign-up CtaBanner with a short platform description
 * and a three-card grid covering what we offer, our mission, and our
 * vision. Deliberately does NOT include a sign-up CTA: the navbar and
 * hero already own the conversion path.
 */
const PILLARS: PillarCard[] = [
  {
    icon: Compass,
    title: "رؤيتنا",
    body: "أن نكون البيئة الجامعية الأولى والوجهة الرائدة في المملكة لاحتضان المشاريع التكنولوجية، ونقطة الانطلاق الأقوى لتخريج جيل من روّاد الأعمال المبتكرين.",
    accentClass: "bg-accent",
  },
  {
    icon: Target,
    title: "رسالتنا",
    body: "تمكين طاقات طلبة جامعة الزيتونة وتوجيهها، من خلال توفير منصة رقمية تفاعلية تربط أصحاب الأفكار بالخبرات الأكاديمية، لتطوير مشاريعهم وفق أحدث المعايير.",
    accentClass: "bg-secondary",
  },
  {
    icon: HeartHandshake,
    title: "ما نقدّمه",
    body: "إرشاد أكاديمي متخصص، ومتابعة حثيثة لكل مرحلة من مراحل بناء المشروع. نحن نوفر لك التقييم والدعم المستمر لضمان تطور فكرتك من المخطط الأولي وحتى التنفيذ النهائي.",
    accentClass: "bg-primary",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative px-4 py-16 sm:py-20 overflow-hidden"
      aria-labelledby="about-heading"
    >
      <DecorationsC />
      <div className="relative z-[1] max-w-6xl mx-auto">
        {/* Header - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 animate-fade-in">

          {/* Image Column */}
          <div className="relative w-full aspect-video md:aspect-[4/3] nb-border-thick rounded-3xl overflow-hidden nb-shadow-lg group">
            {/* Decorative BG glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 z-10" aria-hidden="true" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-accent/20 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 z-10" aria-hidden="true" />

            <Image
              src="/about-team.png"
              alt="فريق حاضنة الزيتونة - طلاب ومشرفون أكاديميون"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {/* Text Column */}
          <div className="text-right">
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6 leading-tight"
            >
              من نحن
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 dark:text-foreground/80 font-medium max-w-2xl leading-relaxed">
              حاضنة الزيتونة هي بوابتك الرقمية نحو الريادة. منصة متكاملة تابعة لجامعة الزيتونة الأردنية، صُممت لتمهد الطريق أمام إبداعات الطلاب ومشاريع تخرجهم، عبر ربطهم بنخبة من المشرفين الأكاديميين. نحن نرافقك في رحلة منهجية واضحة لتحويل فكرتك الطموحة إلى مشروع حقيقي وواقع ملموس.
            </p>
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="nb-card p-6 sm:p-7 relative overflow-hidden animate-slide-up group transition-all duration-300 hover:-translate-y-2 hover:nb-shadow-lg"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className={`absolute -top-10 -left-10 w-24 h-24 ${p.accentClass}/10 rounded-full`}
                  aria-hidden="true"
                />
                <div
                  className={`w-14 h-14 ${p.accentClass} nb-border rounded-xl flex items-center justify-center nb-shadow-sm mb-4`}
                >
                  <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-extrabold mb-2 text-foreground">
                  {p.title}
                </h3>
                <p className="text-sm sm:text-base text-foreground/70 dark:text-foreground/80 font-medium leading-relaxed">
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
