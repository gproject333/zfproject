"use client";

export function FloatingLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      dir="rtl"
      className={
        "pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 px-1 text-sm font-bold " +
        "text-muted-foreground bg-card transition-all duration-150 " +
        "peer-focus:top-0 peer-focus:right-3 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-focus:text-primary " +
        "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:right-3 " +
        "peer-[:not(:placeholder-shown)]:translate-y-[-50%] peer-[:not(:placeholder-shown)]:text-xs"
      }
    >
      {children}
    </label>
  );
}
