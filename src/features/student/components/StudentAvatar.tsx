"use client";

import { useQuery } from "convex/react";
import { Avatar } from "@heroui/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface StudentAvatarProps {
  name?: string;
  avatarId?: Id<"_storage">;
  size?: "sm" | "md" | "lg";
}

/**
 * Thin wrapper on top of HeroUI Avatar that:
 *  - reads the user's avatar URL from Convex
 *  - falls back to the first letter of `name` when no image is available
 */
export default function StudentAvatar({
  name,
  avatarId,
  size = "md",
}: StudentAvatarProps) {
  const avatarUrl = useQuery(api.users.shared.getAvatarUrl);
  const initial = name?.charAt(0) ?? "?";

  return (
    <Avatar size={size}>
      {avatarUrl && avatarId && (
        <Avatar.Image src={avatarUrl} alt={name ?? "الصورة الشخصية"} />
      )}
      <Avatar.Fallback>{initial}</Avatar.Fallback>
    </Avatar>
  );
}
