"use client";

import { Eye } from "lucide-react";

interface PresenceChipsProps {
  others: { userId: string; name: string; role: string | undefined }[];
}

/**
 * Compact "who else is viewing this page right now" indicator.
 * Renders nothing when no other users are present so it doesn't take
 * vertical space on a quiet page.
 *
 * Driven by the usePresence hook — the data refreshes reactively as
 * users open / close the page, so the chips appear and disappear
 * without manual polling on the consumer side.
 */
export default function PresenceChips({ others }: PresenceChipsProps) {
  if (others.length === 0) return null;

  return (
    <div
      className="flex items-center gap-2 text-xs font-bold text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-label={`${others.length} مستخدم آخر يشاهد هذا الطلب`}
    >
      <Eye className="w-3.5 h-3.5 text-info" aria-hidden="true" />
      <span>أيضاً يشاهد:</span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {others.map((u) => (
          <li
            key={u.userId}
            className="nb-badge bg-info/10 text-foreground text-xs px-2 py-0.5"
            title={u.role ? `${u.name} (${u.role})` : u.name}
          >
            {u.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
