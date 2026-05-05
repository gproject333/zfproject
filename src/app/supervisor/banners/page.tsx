"use client";

import { ImageIcon, Loader2, Megaphone, Plus, Type } from "lucide-react";
import { useBannerForm } from "@/features/banners/hooks/useBannerForm";
import { BannerTable } from "@/features/banners/components/BannerTable";
import { BannerFormDialog } from "@/features/banners/components/BannerFormDialog";
import { DeleteBannerDialog } from "@/features/banners/components/DeleteBannerDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui";

export default function SupervisorBannersPage() {
  const form = useBannerForm();
  const { admin } = form;
  const banners = admin.banners ?? [];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-accent" />
          إدارة الإعلانات
          {!admin.loading && (
            <span className="text-base font-bold text-muted-foreground">
              — {banners.length} إعلان
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onPress={form.openScrollingDialog}
            variant="secondary"
            size="sm"
          >
            <Type className="w-4 h-4" />
            إعلان نصي متحرك
          </Button>
          <Button
            onPress={form.openHeroDialog}
            variant="outline"
            size="sm"
          >
            <ImageIcon className="w-4 h-4" />
            إعلان صور وفيديوهات
          </Button>
        </div>
      </div>

      {admin.loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : banners.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد إعلانات بعد"
          description="أنشئ أول إعلان ليظهر للطلاب أو في الصفحة الرئيسية."
          action={
            <Button
              onPress={form.openScrollingDialog}
              variant="secondary"
            >
              <Plus className="w-5 h-5" />
              إنشاء إعلان
            </Button>
          }
        />
      ) : (
        <BannerTable
          banners={banners}
          onEdit={form.openEditDialog}
          onToggle={admin.toggle}
          onRequestDelete={form.setToDelete}
        />
      )}

      <BannerFormDialog
        open={form.dialogOpen}
        onOpenChange={form.setDialogOpen}
        admin={admin}
        fileInputRef={form.fileInputRef}
        onSubmit={form.submit}
      />

      <DeleteBannerDialog
        open={form.toDelete !== null}
        onOpenChange={(open) => !open && form.setToDelete(null)}
        onConfirm={form.confirmDelete}
      />
    </div>
  );
}
