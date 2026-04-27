"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { extractYouTubeId } from "@/lib/youtube";

const AUTOPLAY_MS = 5000;

type BannerWithMedia = Doc<"banners"> & {
  resolvedMediaUrl: string | undefined;
};

type HeroBanner = BannerWithMedia;

function getMediaType(b: HeroBanner): "image" | "video" | "youtube" {
  if (b.mediaType) return b.mediaType;
  if (b.imageUrl && extractYouTubeId(b.imageUrl)) return "youtube";
  return "image";
}

function getMediaSrc(b: HeroBanner): string {
  return b.resolvedMediaUrl ?? b.imageUrl ?? "";
}

export default function HeroCarousel() {
  const banners = useQuery(api.banners.listActive, { audience: "landing" });

  const slides = useMemo<HeroBanner[]>(
    () =>
      (banners ?? []).filter(
        (b): b is HeroBanner =>
          (b.bannerType === "hero" || !!b.imageUrl) &&
          b.bannerType !== "scrolling" &&
          b.bannerType !== "text" &&
          !!(b.resolvedMediaUrl || b.imageUrl),
      ),
    [banners],
  );

  const [rawIndex, setRawIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const index = slides.length > 0 ? rawIndex % slides.length : 0;

  useEffect(() => {
    if (slides.length <= 1 || hovered) return;
    const current = slides[index];
    if (current && getMediaType(current) === "youtube") return;
    const id = window.setInterval(() => {
      setRawIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [slides, index, hovered]);

  if (banners === undefined) {
    return (
      <Shell>
        <div className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
      </Shell>
    );
  }

  if (slides.length === 0) {
    return (
      <Shell>
        <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-accent/15 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-primary/80 rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1">
              حاضنة الزيتونة
            </h2>
            <p className="text-xs md:text-sm text-white/50 font-bold max-w-sm">
              منصة احتضان المشاريع الريادية ومشاريع التخرج
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  const go = (next: number) => {
    const count = slides.length;
    if (count === 0) return;
    setRawIndex(((next % count) + count) % count);
  };

  return (
    <Shell>
      <div
        className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="region"
        aria-label="بنرات عرض"
      >
        {slides.map((slide, i) => {
          const isActive = i === index;
          const mediaType = getMediaType(slide);
          const src = getMediaSrc(slide);

          return (
            <div
              key={slide._id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              aria-hidden={!isActive}
            >
              {mediaType === "youtube" && isActive && (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(src)}?autoplay=1&mute=1&loop=1&playlist=${extractYouTubeId(src)}&controls=0&showinfo=0&rel=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full border-0"
                  title={slide.title}
                />
              )}
              {mediaType === "video" && (
                <video
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              {mediaType === "image" && (
                <>
                  {slide.linkHref ? (
                    <a
                      href={slide.linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={slide.title}
                        loading={i === 0 ? "eager" : "lazy"}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={slide.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </>
              )}
            </div>
          );
        })}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="السابق"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="التالي"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "bg-white w-5"
                      : "bg-white/50 hover:bg-white/70 w-1.5"
                  }`}
                  aria-label={`الانتقال إلى الشريحة ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

/**
 * Dark rounded container with subtle glow and decorative corners.
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">
      <div className="relative rounded-3xl bg-card dark:bg-muted p-3 md:p-4 overflow-hidden nb-border">
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full pointer-events-none" />

        {/* Content */}
        <div className="relative z-[1]">{children}</div>
      </div>
    </div>
  );
}
