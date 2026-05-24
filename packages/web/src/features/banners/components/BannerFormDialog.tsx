"use client";

import type { RefObject } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button, Spinner } from "@/components/ui";
import type { useBannerAdmin } from "../hooks/useBannerAdmin";
import { BannerFormFields } from "./bannerForm/BannerFormFields";
import { BannerMediaSelector } from "./bannerForm/BannerMediaSelector";

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
        <div className="space-y-4 max-h-[60dvh] overflow-y-auto pe-1">
          <BannerFormFields
            admin={admin}
            isHero={isHero}
            isScrolling={isScrolling}
            mediaSlot={
              isHero ? (
                <BannerMediaSelector
                  admin={admin}
                  fileInputRef={fileInputRef}
                />
              ) : null
            }
          />
        </div>

        {admin.formError && (
          <p className="text-xs font-semibold text-destructive mt-3">
            {admin.formError}
          </p>
        )}

        <div className="flex gap-2 pt-4 mt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onPress={() => {
              admin.resetForm();
              onOpenChange(false);
            }}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onPress={() => void onSubmit()}
            isDisabled={admin.saving}
            variant="primary"
            className="flex-1"
          >
            {admin.saving ? (
              <Spinner size="sm" color="current" />
            ) : admin.editingId ? (
              "حفظ التعديلات"
            ) : (
              "إنشاء الإعلان"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
