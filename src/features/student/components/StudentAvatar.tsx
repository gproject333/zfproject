"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface StudentAvatarProps {
  name?: string;
  avatarId?: Id<"_storage">;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-14 h-14 text-lg",
};

export default function StudentAvatar({
  name,
  avatarId,
  size = "md",
}: StudentAvatarProps) {
  const avatarUrl = useQuery(api.users.shared.getAvatarUrl);
  const sizeClass = SIZE_CLASSES[size];
  const initial = name?.charAt(0) ?? "?";

  return (
    <div
      className={`${sizeClass} rounded-full nb-border overflow-hidden bg-muted shrink-0 flex items-center justify-center`}
    >
      {avatarUrl && avatarId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name ?? "الصورة الشخصية"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-black text-muted-foreground">{initial}</span>
      )}
    </div>
  );
}
