"use client";

import { Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui";

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
          <Button variant="outline" className="flex-1" onPress={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onPress={() => void onConfirm()}
            variant="danger"
            className="flex-1"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
