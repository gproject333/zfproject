"use client";

import Link from "next/link";
import { Rocket, ArrowLeft } from "lucide-react";
import { useConvexAuth } from "convex/react";

export default function FinalCTA() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <section className="px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-center">
          <div className="absolute top-0 left-0 w-40 h-40 bg-primary-foreground/5 rounded-br-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-foreground/5 rounded-tl-full pointer-events-none" />

          <div className="relative z-[1]">
            <div className="w-16 h-16 bg-primary-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Rocket className="w-8 h-8 text-primary-foreground" />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-primary-foreground mb-3">
              جاهز تبدأ؟
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/70 font-bold max-w-lg mx-auto mb-8">
              انضم لمئات الطلاب الذين حوّلوا أفكارهم إلى مشاريع حقيقية. قدّم
              طلبك الآن وابدأ رحلتك الريادية مع حاضنة الزيتونة.
            </p>

            <Link
              href={isAuthenticated ? "/student" : "/register"}
              className="nb-btn inline-flex items-center gap-2 px-8 py-3 bg-primary-foreground text-primary font-extrabold text-base rounded-xl hover:opacity-90 transition-opacity nb-border border-primary-foreground/20"
            >
              {isAuthenticated ? "الذهاب للوحة التحكم" : "قدّم مشروعك الآن"}
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
