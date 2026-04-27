"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Banner from "./Banner";

interface BannerListProps {
  audience: "student" | "landing";
}

/** Displays all currently-active banners targeted at a given audience.
 * Renders nothing when there are no banners (no empty-state slot). */
export default function BannerList({ audience }: BannerListProps) {
  const banners = useQuery(api.banners.listActive, { audience });
  // Skip image banners — those render in the HeroCarousel instead.
  const textBanners = (banners ?? []).filter((b) => !b.imageUrl);
  if (textBanners.length === 0) return null;

  return (
    <div className="space-y-3">
      {textBanners.map((b) => (
        <Banner key={b._id} banner={b} />
      ))}
    </div>
  );
}
