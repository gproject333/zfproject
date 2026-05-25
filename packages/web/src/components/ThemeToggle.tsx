"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const LABEL: Record<ThemeMode, string> = {
  light: "الوضع: فاتح",
  dark: "الوضع: داكن",
  system: "الوضع: الجهاز",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 ds-border rounded-lg bg-card" />;
  }

  const current = (theme === "dark" || theme === "light" ? theme : "system") as ThemeMode;
  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <button
      onClick={() => setTheme(NEXT_MODE[current])}
      className="group relative w-10 h-10 ds-border rounded-lg flex items-center justify-center bg-card hover:bg-muted transition-colors overflow-hidden"
      aria-label={LABEL[current]}
      title={LABEL[current]}
    >
      <Icon
        key={current}
        className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 animate-in fade-in zoom-in-50"
      />
    </button>
  );
}
