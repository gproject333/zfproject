"use client";

interface VariantDotsProps {
  count: number;
  activeIndex: number;
  onSelect: (i: number) => void;
  accent: "primary" | "accent" | "secondary";
}

export function VariantDots({ count, activeIndex, onSelect, accent }: VariantDotsProps) {
  const activeBg =
    accent === "accent"
      ? "bg-accent"
      : accent === "secondary"
        ? "bg-secondary-border"
        : "bg-primary";
  return (
    <div className="mt-5 flex items-center gap-2" role="tablist" aria-label="بدائل العرض">
      {Array.from({ length: count }, (_, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`المشهد ${i + 1} من ${count}`}
            onClick={() => onSelect(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active ? `w-8 ${activeBg}` : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
            }`}
          />
        );
      })}
    </div>
  );
}
