"use client";

interface BannerPreviewProps {
  mediaFile: File | null;
  imageUrl: string;
  youtubeThumb: string | null;
  mediaType: "image" | "video" | "youtube" | "";
}

export function BannerPreview({
  mediaFile,
  imageUrl,
  youtubeThumb,
  mediaType,
}: BannerPreviewProps) {
  if (mediaType === "image" && (mediaFile || imageUrl)) {
    return (
      <div className="nb-border rounded-lg overflow-hidden bg-muted/30 max-h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaFile ? URL.createObjectURL(mediaFile) : imageUrl}
          alt="معاينة"
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  if (mediaType === "youtube" && youtubeThumb) {
    return (
      <div className="nb-border rounded-lg overflow-hidden bg-muted/30 max-h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumb}
          alt="معاينة يوتيوب"
          className="w-full h-40 object-cover"
        />
      </div>
    );
  }

  return null;
}
