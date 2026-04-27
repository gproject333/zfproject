"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Reveal from "@/components/Reveal";

/**
 * Four-step "how it works" process section.
 */
const STEPS = [
  { num: "١", title: "سجّل حسابك", desc: "أنشئ حسابك بإيميل الجامعة" },
  { num: "٢", title: "قدّم فكرتك", desc: "اختر نوع الاحتضان وأدخل مشروعك" },
  { num: "٣", title: "احصل على التقييم", desc: "المشرف يراجع طلبك ويرد عليك" },
  { num: "٤", title: "ابدأ الرحلة", desc: "انطلق بمشروعك بدعم كامل" },
];

export default function HowItWorks() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(window.innerWidth >= 1024 ? 2 : 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(STEPS.length / itemsPerView);
  const maxIndex = Math.max(0, STEPS.length - itemsPerView);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // RTL Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // In RTL, sliding finger left (distance > 0) means pushing content to the left, revealing the right side (Previous).
    // Sliding finger right (distance < 0) means pushing content to the right, revealing the left side (Next).
    if (isRightSwipe) {
      handleNext();
    } else if (isLeftSwipe) {
      handlePrev();
    }
  };

  // Auto-slide every 5 seconds (Optional but UX friendly)
  useEffect(() => {
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  return (
    <section className="px-4 py-16 bg-checker overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <Reveal animation="fade-in" className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black">أربع خطوات، ومشروعك ينطلق</h2>
        </Reveal>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Main Slider Window */}
          <div
            className="overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              // translateX is positive in RTL to slide to left items
              style={{ transform: `translateX(${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`w-full shrink-0 px-3 ${itemsPerView === 2 ? 'lg:w-1/2' : ''}`}
                >
                  <Reveal animation="slide-up" delay={i * 150} className="h-full">
                    <div className="nb-card p-8 sm:p-10 text-center h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0px_0px_var(--shadow-color)]">
                      <div className="w-20 h-20 bg-primary nb-border-thick rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] rotate-3 hover:rotate-0 transition-transform">
                        <span className="text-4xl font-black">{step.num}</span>
                      </div>
                      <h3 className="font-black text-xl mb-3 text-foreground">{step.title}</h3>
                      <p className="text-base text-foreground/70 dark:text-foreground/80 font-bold">{step.desc}</p>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handleNext}
            className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 w-12 h-12 bg-card nb-border-thick rounded-xl flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95 transition-all shadow-[4px_4px_0px_0px_var(--shadow-color)] z-10"
            aria-label="التالي"
          >
            {/* The Left arrow pushes to the left visually (meaning Next in RTL) */}
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 w-12 h-12 bg-card nb-border-thick rounded-xl flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95 transition-all shadow-[4px_4px_0px_0px_var(--shadow-color)] z-10"
            aria-label="السابق"
          >
            {/* The Right arrow pushes to the right visually (meaning Prev in RTL) */}
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-3 mt-10">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            // Due to itemsPerView logic, actual slide dot might represent currentIndex roughly
            const actualIndex = itemsPerView === 2 ? Math.floor(currentIndex / 2) : currentIndex;
            const isActive = actualIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx * itemsPerView)}
                className={`transition-all duration-300 nb-border rounded-full ${isActive
                    ? "w-10 h-3 bg-primary shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                    : "w-3 h-3 bg-muted-foreground/30 hover:bg-secondary cursor-pointer"
                  }`}
                aria-label={`انتقل إلى الشريحة ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
