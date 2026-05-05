"use client";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { Button, Input } from "@/components/ui";
import type { GuideFormState } from "../hooks/useGuideAdmin";

interface GuideFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  saving: boolean;
  formError: string | null;
  formState: GuideFormState;
  setFormField: <K extends keyof GuideFormState>(field: K, value: GuideFormState[K]) => void;
  onSubmit: () => void;
}

export default function GuideFormDialog({
  open,
  onOpenChange,
  editing,
  saving,
  formError,
  formState,
  setFormField,
  onSubmit,
}: GuideFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={editing ? "تعديل المورد" : "إضافة مورد جديد"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-extrabold mb-1 block">العنوان *</label>
            <Input
              type="text"
              value={formState.title}
              onChange={(e) => setFormField("title", e.target.value)}
              className="text-sm"
              fullWidth
              placeholder="عنوان المورد"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold mb-1 block">النوع</label>
            <Select
              value={formState.type}
              onValueChange={(v) => setFormField("type", v as GuideFormState["type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">فيديو</SelectItem>
                <SelectItem value="course">دورة</SelectItem>
                <SelectItem value="link">رابط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-extrabold mb-1 block">الرابط *</label>
            <Input
              type="url"
              value={formState.url}
              onChange={(e) => setFormField("url", e.target.value)}
              className="text-sm"
              fullWidth
              placeholder="https://..."
              required
              dir="ltr"
            />
          </div>

          {formError && (
            <div className="nb-border border-destructive bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-sm font-bold">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              onPress={() => onOpenChange(false)}
              variant="outline"
              size="sm"
              isDisabled={saving}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isDisabled={saving}
            >
              {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
