"use client";

import type { RefObject } from "react";
import {
  ImageIcon,
  Loader2,
  Play,
  Upload,
  Video,
} from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/Dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { youTubeThumbnail } from "@/lib/youtube";
import { Button } from "@/components/ui";
import type {
  MediaType,
  useBannerAdmin,
} from "../hooks/useBannerAdmin";

type BannerAdmin = ReturnType<typeof useBannerAdmin>;

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: BannerAdmin;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: () => Promise<void> | void;
}

export function BannerFormDialog({
  open,
  onOpenChange,
  admin,
  fileInputRef,
  onSubmit,
}: BannerFormDialogProps) {
  const isScrolling = admin.formState.bannerType === "scrolling";
  const isHero = admin.formState.bannerType === "hero";
  const ytThumb = youTubeThumbnail(admin.formState.youtubeUrl);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) admin.setFormField("mediaFile", file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={
          admin.editingId
            ? "تعديل إعلان"
            : isScrolling
              ? "إعلان نصي متحرك"
              : "إعلان صور وفيديوهات"
        }
        description={
          isScrolling
            ? "أنشئ شريط إعلان متحرك يظهر أعلى الصفحة تحت شريط التنقل."
            : "أضف إعلاناً مرئياً يظهر في قسم الهيرو في جميع الصفحات."
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">العنوان</label>
            <input
              className="nb-input"
              value={admin.formState.title}
              onChange={(e) => admin.setFormField("title", e.target.value)}
              placeholder={
                isScrolling
                  ? "مثال: إعلان هام للطلاب"
                  : "مثال: يوم وظيفي في الجامعة"
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              {isScrolling ? "نص الإعلان المتحرك" : "الوصف"}
              {isHero && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  (اختياري)
                </span>
              )}
            </label>
            <textarea
              rows={2}
              className="nb-input resize-none"
              value={admin.formState.message}
              onChange={(e) => admin.setFormField("message", e.target.value)}
              placeholder={
                isScrolling
                  ? "اكتب النص الذي سيظهر كشريط متحرك..."
                  : "وصف مختصر للإعلان (اختياري)..."
              }
            />
          </div>

          {isHero && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  نوع الوسائط
                </label>
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
                          admin.setFormField(
                            "mediaType",
                            opt.value as MediaType,
                          );
                          admin.setFormField("mediaFile", null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all nb-border ${
                          active
                            ? "bg-accent text-accent-foreground nb-shadow-sm border-foreground"
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
                    <label className="block text-xs font-bold mb-1.5">
                      رفع صورة
                    </label>
                    <label className="flex items-center justify-center gap-2 py-6 nb-border rounded-xl border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-bold text-muted-foreground">
                        {admin.formState.mediaFile
                          ? admin.formState.mediaFile.name
                          : "اختر صورة أو اسحبها هنا"}
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
                      <input
                        className="nb-input"
                        dir="ltr"
                        value={admin.formState.imageUrl}
                        onChange={(e) =>
                          admin.setFormField("imageUrl", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  )}
                  {(admin.formState.mediaFile ||
                    admin.formState.imageUrl) && (
                    <div className="nb-border rounded-lg overflow-hidden bg-muted/30 max-h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          admin.formState.mediaFile
                            ? URL.createObjectURL(admin.formState.mediaFile)
                            : admin.formState.imageUrl
                        }
                        alt="معاينة"
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (
                            e.currentTarget as HTMLImageElement
                          ).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {admin.formState.mediaType === "video" && (
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    رفع فيديو
                  </label>
                  <label className="flex items-center justify-center gap-2 py-6 nb-border rounded-xl border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-bold text-muted-foreground">
                      {admin.formState.mediaFile
                        ? admin.formState.mediaFile.name
                        : "اختر ملف فيديو (MP4, WebM)"}
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
                    <input
                      className="nb-input"
                      dir="ltr"
                      value={admin.formState.youtubeUrl}
                      onChange={(e) =>
                        admin.setFormField("youtubeUrl", e.target.value)
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  {ytThumb && (
                    <div className="nb-border rounded-lg overflow-hidden bg-muted/30 max-h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ytThumb}
                        alt="معاينة يوتيوب"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs font-bold text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                يظهر هذا الإعلان لجميع المستخدمين في جميع الصفحات الرئيسية.
              </p>
            </>
          )}

          {isScrolling && (
            <div>
              <label className="block text-xs font-bold mb-1.5">
                الجمهور المستهدف
              </label>
              <Select
                value={admin.formState.audience}
                onValueChange={(v) =>
                  admin.setFormField(
                    "audience",
                    v as "student" | "supervisor" | "landing" | "all",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="student">الطلاب</SelectItem>
                  <SelectItem value="supervisor">المشرفين</SelectItem>
                  <SelectItem value="landing">
                    الصفحة الرئيسية / الزوار
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(isScrolling || isHero) && (
            <div>
              <label className="block text-xs font-bold mb-1.5">
                مدة العرض (تاريخ الانتهاء){" "}
                <span className="text-muted-foreground font-normal">
                  — الوقت اختياري
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="nb-input"
                  value={admin.formState.expiresDate}
                  onChange={(e) =>
                    admin.setFormField("expiresDate", e.target.value)
                  }
                />
                <input
                  type="time"
                  className="nb-input"
                  value={admin.formState.expiresTime}
                  onChange={(e) =>
                    admin.setFormField("expiresTime", e.target.value)
                  }
                  placeholder="اختياري"
                />
              </div>
            </div>
          )}

          {isScrolling && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  كلمة الرابط (اختياري)
                </label>
                <input
                  className="nb-input"
                  value={admin.formState.linkLabel}
                  onChange={(e) =>
                    admin.setFormField("linkLabel", e.target.value)
                  }
                  placeholder="مثال: اضغط هنا"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  رابط URL (اختياري)
                </label>
                <input
                  className="nb-input"
                  dir="ltr"
                  value={admin.formState.linkHref}
                  onChange={(e) =>
                    admin.setFormField("linkHref", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={admin.formState.isActive}
              onChange={(e) =>
                admin.setFormField("isActive", e.target.checked)
              }
              className="w-4 h-4"
            />
            <span className="text-sm font-bold">نشط — يظهر فوراً</span>
          </label>

          {admin.formError && (
            <p className="text-xs font-semibold text-destructive">
              {admin.formError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <DialogClose asChild>
              <button
                type="button"
                className="nb-btn nb-btn-outline flex-1"
                onClick={() => admin.resetForm()}
              >
                إلغاء
              </button>
            </DialogClose>
            <Button
              type="button"
              onPress={() => void onSubmit()}
              isDisabled={admin.saving}
              variant="secondary"
              className="flex-1"
            >
              {admin.saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : admin.editingId ? (
                "حفظ التعديلات"
              ) : (
                "إنشاء الإعلان"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
