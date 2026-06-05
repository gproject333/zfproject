"use client";

import { Save, Link2, UserRound, GraduationCap, ExternalLink, X } from "lucide-react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { Button, Input, Card } from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import OliveSpinner from "@/components/OliveSpinner";
import { toast } from "@/lib/toast";

interface ProfileCardProps {
  profile: ReturnType<typeof useStudentProfile>;
  showAcademicFields: boolean;
  /** Full college objects — label is `name`, value is `_id`. */
  collegeOptions: { _id: string; name: string }[];
  /** Full department objects — label is `name`, value is `_id`. */
  departmentOptions: { _id: string; name: string }[];
  /** When false, fields render read-only; the header drives the toggle. */
  isEditing: boolean;
  onCancel: () => void;
  onSaved: () => void;
}

/** Read-only label/value row used in the profile's view mode. */
function ViewRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-foreground/[0.06] last:border-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 break-all text-right"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          {value}
        </a>
      ) : (
        <span className="text-sm font-semibold">{value || "—"}</span>
      )}
    </div>
  );
}

/**
 * The editable half of the profile shell. Header / avatar / read-only
 * metadata live in `ProfileHeader` + `AccountInfoCard` so this card
 * focuses on the two groups of fields the student can actually edit:
 *  - Basics (display name + LinkedIn)
 *  - Academic (college + department) — hidden for supervisor surface
 *
 * Save success / error are surfaced via `toast` so they survive
 * navigation and stay consistent with WhatsappLink.
 */
export function ProfileCard({
  profile,
  showAcademicFields,
  collegeOptions,
  departmentOptions,
  isEditing,
  onCancel,
  onSaved,
}: ProfileCardProps) {
  const linkedinHint =
    profile.form.linkedinUrl &&
    !/^https?:\/\//i.test(profile.form.linkedinUrl.trim())
      ? "يبدأ الرابط عادةً بـ https://"
      : null;

  const collegeName =
    collegeOptions.find((c) => c._id === profile.form.collegeId)?.name ??
    profile.user?.college ??
    "—";
  const departmentName =
    departmentOptions.find((d) => d._id === profile.form.departmentId)?.name ??
    profile.user?.department ??
    "—";

  const handleSubmit = async () => {
    const result = await profile.submit();
    if (result.ok) {
      toast.success("تم حفظ التغييرات");
      onSaved();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Section: basics */}
      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">المعلومات الأساسية</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              الاسم وروابط التواصل المهنية.
            </p>
          </div>
        </div>

        {isEditing ? (
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#0A66C2]" />
                رابط LinkedIn
              </label>
              <Input
                fullWidth
                value={profile.form.linkedinUrl}
                onChange={(e) => profile.setField("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                dir="ltr"
              />
              {linkedinHint && (
                <p className="text-[11px] text-muted-foreground font-medium mt-1">
                  {linkedinHint}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <ViewRow label="الاسم الكامل" value={profile.form.name} />
            <ViewRow
              label="رابط LinkedIn"
              value={profile.form.linkedinUrl || "—"}
              href={profile.form.linkedinUrl || undefined}
            />
          </div>
        )}
      </section>

      {/* Section: academic — students only */}
      {showAcademicFields && (
        <section className="space-y-4 pt-2 border-t border-foreground/[0.06]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">المعلومات الأكاديمية</h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                الكلية والتخصص — يحتاجها المشرف للتواصل معك.
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">الكلية</label>
                <Select
                  value={profile.form.collegeId}
                  onValueChange={(v) => {
                    profile.setField("collegeId", v);
                    profile.setField("departmentId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختيار الكلية" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegeOptions.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">التخصص</label>
                <Select
                  value={profile.form.departmentId}
                  onValueChange={(v) => profile.setField("departmentId", v)}
                  isDisabled={!profile.form.collegeId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        profile.form.collegeId
                          ? "اختيار التخصص"
                          : "يُرجى اختيار الكلية أولًا."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div>
              <ViewRow label="الكلية" value={collegeName} />
              <ViewRow label="التخصص" value={departmentName} />
            </div>
          )}
        </section>
      )}

      {isEditing && (
        <div className="flex gap-3">
          <Button onPress={onCancel} isDisabled={profile.saving} variant="outline" className="flex-1">
            <X className="w-4 h-4" />
            إلغاء
          </Button>
          <Button
            onPress={() => void handleSubmit()}
            isDisabled={profile.saving}
            variant="secondary"
            className="flex-[2]"
          >
            {profile.saving ? (
              <OliveSpinner size="xs" className="text-current" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ التغييرات
          </Button>
        </div>
      )}
    </Card>
  );
}
