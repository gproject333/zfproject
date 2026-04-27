"use client";

import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/Dialog";

interface DeleteBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteBannerDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteBannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="حذف الإعلان"
        description="هذا الإجراء لا يمكن التراجع عنه."
      >
        <div className="flex gap-2 pt-2">
          <DialogClose asChild>
            <button className="nb-btn nb-btn-outline flex-1">إلغاء</button>
          </DialogClose>
          <button
            onClick={() => void onConfirm()}
            className="nb-btn flex-1 bg-destructive text-white"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
