"use client";

import { Input, TextArea } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import type { useBannerAdmin } from "../../hooks/useBannerAdmin";

type BannerAdmin = ReturnType<typeof useBannerAdmin>;

interface BannerFormFieldsProps {
  admin: BannerAdmin;
  isHero: boolean;
  isScrolling: boolean;
  mediaSlot?: React.ReactNode;
}

export function BannerFormFields({
  admin,
  isHero,
  isScrolling,
  mediaSlot,
}: BannerFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-bold mb-1.5">العنوان</label>
        <Input
          fullWidth
          value={admin.formState.title}
          onChange={(e) => admin.setFormField("title", e.target.value)}
          placeholder={
            isScrolling
              ? "مثال: إعلان هامّ للطلاب"
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
        <TextArea
          rows={2}
          fullWidth
          className="resize-none"
          value={admin.formState.message}
          onChange={(e) => admin.setFormField("message", e.target.value)}
          placeholder={
            isScrolling
              ? "اكتب النص الذي يظهر ضمن الشريط المتحرك..."
              : "وصف مختصر للإعلان (اختياري)..."
          }
        />
      </div>

      {mediaSlot}

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
              <SelectItem value="supervisor">المشرفون</SelectItem>
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
            <Input
              type="date"
              fullWidth
              value={admin.formState.expiresDate}
              onChange={(e) =>
                admin.setFormField("expiresDate", e.target.value)
              }
            />
            <Input
              type="time"
              fullWidth
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
            <Input
              fullWidth
              value={admin.formState.linkLabel}
              onChange={(e) =>
                admin.setFormField("linkLabel", e.target.value)
              }
              placeholder="مثال: للمزيد من التفاصيل"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">
              رابط URL (اختياري)
            </label>
            <Input
              fullWidth
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
          onChange={(e) => admin.setFormField("isActive", e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm font-bold">مفعَّل — يُعرض فورًا</span>
      </label>
    </>
  );
}
