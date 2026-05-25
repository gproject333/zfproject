"use client";

import { RefObject } from "react";
import { Camera, Save, CheckCircle2, Link2 } from "lucide-react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { Button, Input, Spinner, Card } from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

interface ProfileCardProps {
  profile: ReturnType<typeof useStudentProfile>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  showAcademicFields: boolean;
  collegeNames: string[];
  collegeDepartments: string[];
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileCard({
  profile,
  fileInputRef,
  showAcademicFields,
  collegeNames,
  collegeDepartments,
  handleAvatarChange,
}: ProfileCardProps) {
  return (
    <Card className="p-6 space-y-6">
      {/* الصورة الشخصية */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full ds-border overflow-hidden bg-muted group shrink-0"
        >
          {profile.avatarPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarPreviewUrl}
              alt="الصورة الشخصية"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {profile.user?.name?.charAt(0) ?? "?"}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </button>
        <p className="text-xs text-muted-foreground">
          انقر لتغيير الصورة.
        </p>
      </div>

      {/* حقول النموذج */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1.5">
            الاسم الكامل
          </label>
          <Input
            fullWidth
            value={profile.form.name}
            onChange={(e) => profile.setField("name", e.target.value)}
            placeholder="الاسم الكامل"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">
            البريد الإلكتروني
          </label>
          <Input
            fullWidth
            className="bg-muted/50 cursor-not-allowed"
            value={profile.user?.email ?? ""}
            readOnly
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">
            الرقم الجامعي
          </label>
          <Input
            fullWidth
            value={profile.form.studentId}
            onChange={(e) => profile.setField("studentId", e.target.value)}
            placeholder="مثال: 202010001"
            dir="ltr"
          />
        </div>

        {showAcademicFields && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1.5">الكلية</label>
              <Select
                value={profile.form.college}
                onValueChange={(v) => {
                  profile.setField("college", v);
                  profile.setField("department", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختيار الكلية" />
                </SelectTrigger>
                <SelectContent>
                  {collegeNames.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">التخصص</label>
              <Select
                value={profile.form.department}
                onValueChange={(v) => profile.setField("department", v)}
                isDisabled={!profile.form.college}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={profile.form.college ? "اختيار التخصص" : "يُرجى اختيار الكلية أولًا."}
                  />
                </SelectTrigger>
                <SelectContent>
                  {collegeDepartments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5">
            رقم الهاتف
          </label>
          <Input
            fullWidth
            value={profile.form.phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              profile.setField("phone", val);
            }}
            placeholder="07XXXXXXXX"
            dir="ltr"
            maxLength={10}
            inputMode="numeric"
          />
          {profile.form.phone &&
            !/^07\d{8}$/.test(profile.form.phone) && (
              <p className="text-[10px] text-destructive mt-1 font-bold">
                يجب أن يتألف من عشرة أرقام تبدأ بـ 07.
              </p>
            )}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[#0A66C2]" />
            رابط LinkedIn
          </label>
          <Input
            fullWidth
            value={profile.form.linkedinUrl}
            onChange={(e) =>
              profile.setField("linkedinUrl", e.target.value)
            }
            placeholder="https://linkedin.com/in/..."
            dir="ltr"
          />
        </div>
      </div>

      {/* رسائل الحالة */}
      {profile.error && (
        <p className="text-xs font-semibold text-destructive">
          {profile.error}
        </p>
      )}
      {profile.success && (
        <p className="text-xs font-semibold text-success flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          تم حفظ التغييرات بنجاح.
        </p>
      )}

      <Button
        onPress={() => void profile.submit()}
        isDisabled={profile.saving}
        variant="secondary"
        fullWidth
      >
        {profile.saving ? (
          <Spinner size="sm" color="current" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        حفظ التغييرات
      </Button>
    </Card>
  );
}
