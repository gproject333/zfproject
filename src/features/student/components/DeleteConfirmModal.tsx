"use client";

import { Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/Dialog";
import { Button } from "@/components/ui";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  projectName,
  isDeleting,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-destructive/10 nb-border rounded-xl flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-extrabold">حذف الطلب</h3>
            <p className="text-sm text-muted-foreground">هذا الإجراء لا يمكن التراجع عنه</p>
          </div>
        </div>
        <p className="text-sm mb-6">
          هل أنت متأكد من حذف طلب &quot;<strong>{projectName}</strong>&quot;؟
        </p>
        <div className="flex gap-3">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">إلغاء</Button>
          </DialogClose>
          <Button
            onPress={onConfirm}
            isDisabled={isDeleting}
            variant="danger"
            className="flex-1"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
