"use client";

import type { RefObject } from "react";
import { ImageIcon, Play, Upload, Video } from "lucide-react";
import { Input } from "@/components/ui";
import { youTubeThumbnail } from "@smart-zuj/core";
import type { MediaType, useBannerAdmin } from "../../hooks/useBannerAdmin";
import { BannerPreview } from "./BannerPreview";

type BannerAdmin = ReturnType<typeof useBannerAdmin>;

interface BannerMediaSelectorProps {
  admin: BannerAdmin;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function BannerMediaSelector({
  admin,
  fileInputRef,
}: BannerMediaSelectorProps) {
  const ytThumb = youTubeThumbnail(admin.formState.youtubeUrl);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) admin.setFormField("mediaFile", file);
  };

  return (
    <>
      <div>
        <label className="block text-xs font-bold mb-1.5">نوع الوسائط</label>
        <div className="flex gap-2">
          {(
            [
              { value: "image", label: "صورة", icon: ImageIcon },
              { value: "video", label: "فيديو", icon: Video },
              { value: "youtube", label: "يوتيوب", icon: Play },
            ] as const
          ).map((opt) => {
            const active = admin.formState.mediaType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  admin.setFormField("mediaType", opt.value as MediaType);
                  admin.setFormField("mediaFile", null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ds-border ${
                  active
                    ? "bg-accent text-accent-foreground ds-shadow-sm border-foreground"
                    : "bg-transparent border-transparent hover:bg-muted hover:border-foreground"
                }`}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {admin.formState.mediaType === "image" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1.5">رفع صورة</label>
            <label className="flex items-center justify-center gap-2 py-6 ds-border rounded-xl border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-bold text-muted-foreground">
                {admin.formState.mediaFile
                  ? admin.formState.mediaFile.name
                  : "اختر صورة أو اسحبها إلى هذه المنطقة"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
          {!admin.formState.mediaFile && (
            <div>
              <label className="block text-xs font-bold mb-1.5">
                أو رابط صورة خارجي
              </label>
              <Input
                fullWidth
                dir="ltr"
                value={admin.formState.imageUrl}
                onChange={(e) =>
                  admin.setFormField("imageUrl", e.target.value)
                }
                placeholder="https://..."
              />
            </div>
          )}
          <BannerPreview
            mediaType="image"
            mediaFile={admin.formState.mediaFile}
            imageUrl={admin.formState.imageUrl}
            youtubeThumb={ytThumb}
          />
        </div>
      )}

      {admin.formState.mediaType === "video" && (
        <div>
          <label className="block text-xs font-bold mb-1.5">رفع فيديو</label>
          <label className="flex items-center justify-center gap-2 py-6 ds-border rounded-xl border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-bold text-muted-foreground">
              {admin.formState.mediaFile
                ? admin.formState.mediaFile.name
                : "اختر ملف فيديو (MP4 أو WebM)"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}

      {admin.formState.mediaType === "youtube" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              رابط اليوتيوب
            </label>
            <Input
              fullWidth
              dir="ltr"
              value={admin.formState.youtubeUrl}
              onChange={(e) =>
                admin.setFormField("youtubeUrl", e.target.value)
              }
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <BannerPreview
            mediaType="youtube"
            mediaFile={admin.formState.mediaFile}
            imageUrl={admin.formState.imageUrl}
            youtubeThumb={ytThumb}
          />
        </div>
      )}

      <p className="text-xs font-bold text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        يُعرض هذا الإعلان لجميع المستخدمين في الصفحات الرئيسية كافة.
      </p>
    </>
  );
}
