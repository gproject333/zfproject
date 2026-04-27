"use client";

import { Handshake } from "lucide-react";

const PARTNERS = [
  "جامعة الزيتونة الأردنية",
  "صندوق دعم الريادة",
  "مؤسسة الإبداع التقني",
  "حاضنة أعمال عمّان",
  "وزارة الاقتصاد الرقمي",
  "برنامج مسرّعات الأعمال",
];

/**
 * Scrolling partner/sponsor logos strip using the existing marquee CSS.
 * Uses text-based partner names since no logos are available yet —
 * can be replaced with <img> tags when logos are provided.
 */
export default function Partners() {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-12 border-y nb-border">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <div className="inline-flex items-center gap-2 nb-badge bg-secondary/10 text-secondary text-sm px-4 py-1.5">
          <Handshake className="w-4 h-4" />
          شركاؤنا ورعاتنا
        </div>
      </div>

      <div className="nb-marquee-track overflow-hidden">
        <div className="animate-marquee">
          {items.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center whitespace-nowrap mx-6 md:mx-10 px-6 py-3 rounded-xl nb-border bg-card font-bold text-sm text-foreground/70 dark:text-foreground/80"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
