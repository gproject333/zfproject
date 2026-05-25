"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { Sparkles, Heart, Bell, UserRound, type LucideIcon } from "lucide-react";
import { api } from "@smart-zuj/convex";

const ITEMS: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/sponsor", label: "الاستكشاف", icon: Sparkles },
  { href: "/sponsor/interests", label: "الاهتمامات", icon: Heart },
  { href: "/sponsor/notifications", label: "الإشعارات", icon: Bell },
  { href: "/sponsor/profile", label: "الملف الشخصي", icon: UserRound },
];

const IDLE_HIDE_MS = 2500;

/**
 * Glassy floating nav rail for the immersive reels surface. Auto-hides
 * after IDLE_HIDE_MS of no pointer/touch/wheel activity so the video can
 * breathe; any interaction wakes it back up. Built specifically for the
 * (immersive) route group — the rest of the sponsor dashboard uses the
 * normal sidebar.
 */
export default function FloatingSponsorBottomBar() {
  const pathname = usePathname();
  const unread = useQuery(api.notifications.unreadCount) ?? 0;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const wake = () => {
      setVisible(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), IDLE_HIDE_MS);
    };
    wake();
    const events: Array<keyof WindowEventMap> = [
      "pointermove",
      "touchstart",
      "wheel",
      "scroll",
      "keydown",
    ];
    for (const ev of events) window.addEventListener(ev, wake, { passive: true });
    return () => {
      if (timer) clearTimeout(timer);
      for (const ev of events) window.removeEventListener(ev, wake);
    };
  }, []);

  return (
    <nav
      dir="rtl"
      aria-label="تنقّل الجهة الداعمة"
      onPointerEnter={() => setVisible(true)}
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5
                  bg-black/55 backdrop-blur-xl border border-secondary/35
                  rounded-full px-2.5 py-2 shadow-[0_0_24px_rgba(201,162,39,0.25)]
                  transition-all duration-500
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const showBadge = item.href === "/sponsor/notifications" && unread > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-br from-secondary to-secondary-border text-secondary-foreground shadow-[0_0_18px_rgba(201,162,39,0.5)]"
                            : "text-white/85 hover:text-white hover:bg-white/10"
                        }`}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            {isActive && (
              <span className="text-[11px] font-extrabold whitespace-nowrap">
                {item.label}
              </span>
            )}
            {showBadge && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-destructive border border-black/40" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
