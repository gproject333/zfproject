"use client";

import { Check } from "lucide-react";
import {
  SOCIAL_PLATFORMS,
  getPlatformMeta,
} from "@/lib/configs/socialPlatforms";
import { Button, Input, Spinner } from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import type { DraftLink } from "./types";

interface SocialLinkFormProps {
  draft: DraftLink;
  setDraft: React.Dispatch<React.SetStateAction<DraftLink>>;
  editingId: unknown;
  saving: boolean;
  submit: (e: React.FormEvent) => void;
  cancelForm: () => void;
}

export function SocialLinkForm({
  draft,
  setDraft,
  editingId,
  saving,
  submit,
  cancelForm,
}: SocialLinkFormProps) {
  const platformMeta = getPlatformMeta(draft.platform);

  return (
    <form
      onSubmit={submit}
      className="ds-card p-6 border-[3px] border-info/50 animate-slide-up space-y-4"
    >
      <h3 className="font-extrabold text-lg">
        {editingId ? "تعديل الرابط" : "رابط جديد"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-bold" htmlFor="platform-select">
            المنصة *
          </label>
          <Select
            value={draft.platform}
            onValueChange={(v) => setDraft((d) => ({ ...d, platform: v }))}
          >
            <SelectTrigger aria-labelledby="platform-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORMS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-bold" htmlFor="url-input">
            الرابط *
          </label>
          <Input
            id="url-input"
            type="text"
            dir="ltr"
            fullWidth
            placeholder={platformMeta.placeholder}
            value={draft.url}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-bold" htmlFor="label-input">
            تسمية بديلة (اختياري)
          </label>
          <Input
            id="label-input"
            type="text"
            fullWidth
            placeholder={platformMeta.label}
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            maxLength={60}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-bold" htmlFor="order-input">
            ترتيب العرض
          </label>
          <Input
            id="order-input"
            type="number"
            fullWidth
            value={String(draft.order)}
            onChange={(e) => setDraft((d) => ({ ...d, order: Number(e.target.value) || 0 }))}
          />
          <p className="text-xs text-muted-foreground">
            تُعرض القيم الأقل أولًا؛ يُنصح باستخدام 10 و20 و30 للتدرّج.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onPress={cancelForm}
          isDisabled={saving}
          variant="outline"
          className="flex-1 sm:flex-initial"
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          isDisabled={saving}
          variant="primary"
          className="flex-1 sm:flex-initial"
        >
          {saving ? <Spinner size="sm" color="current" /> : <Check className="w-4 h-4" />}
          {editingId ? "حفظ التعديل" : "إضافة"}
        </Button>
      </div>
    </form>
  );
}
