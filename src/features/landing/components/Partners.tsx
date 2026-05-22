"use client";

import { Handshake, Sprout } from "lucide-react";

const PARTNERS = [
  "جامعة الزيتونة الأردنية",
  "صندوق دعم الريادة",
  "مؤسسة الإبداع التقني",
  "حاضنة أعمال عمّان",
  "وزارة الاقتصاد الرقمي",
  "برنامج مسرّعات الأعمال",
];

/**
 * Scrolling partners strip. Glass chips on a faint gradient background —
 * matches the premium identity of the rest of the landing page. Will use
 * <img> tags once partner logos are provided.
 */
export default function Partners() {
  return (
    <section className="relative py-14 overflow-hidden bg-gradient-to-b from-foreground/[0.015] to-transparent">
      <div className="max-w-7xl mx-auto px-4 mb-7 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-3 bg-primary/10 rounded-full px-3 py-1.5">
          <Handshake className="w-3.5 h-3.5" />
          شركاؤنا ورعاتنا
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-foreground/80">
          نعمل بالشراكة مع{" "}
          <span className="text-primary">أفضل المؤسسات</span>
        </h3>
      </div>

      <div className="relative nb-marquee-track">
        <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-0  w-24 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-6 py-2" style={{ animationDuration: "40s" }}>
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex items-center gap-6 px-3 shrink-0"
            >
              {PARTNERS.map((name, i) => (
                <li
                  key={`${copy}-${i}`}
                  className="inline-flex items-center gap-2.5 whitespace-nowrap glass ring-1 ring-foreground/10 rounded-full px-5 py-2.5 text-foreground/75 font-bold text-sm shadow-sm hover:shadow-md hover:ring-primary/20 transition-all"
                >
                  <Sprout className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
