"use client";

import { Save, Link2, UserRound, GraduationCap } from "lucide-react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { Button, Input, Card } from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import OliveSpinner from "@/components/OliveSpinner";
import { toast } from "@/lib/toast";

interface ProfileCardProps {
  profile: ReturnType<typeof useStudentProfile>;
  showAcademicFields: boolean;
  collegeNames: string[];
  collegeDepartments: string[];
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
  collegeNames,
  collegeDepartments,
}: ProfileCardProps) {
  const linkedinHint =
    profile.form.linkedinUrl &&
    !/^https?:\/\//i.test(profile.form.linkedinUrl.trim())
      ? "يبدأ الرابط عادةً بـ https://"
      : null;

  const handleSubmit = async () => {
    const result = await profile.submit();
    if (result.ok) {
      toast.success("تم حفظ التغييرات");
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder={
                      profile.form.college
                        ? "اختيار التخصص"
                        : "يُرجى اختيار الكلية أولًا."
                    }
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
          </div>
        </section>
      )}

      <Button
        onPress={() => void handleSubmit()}
        isDisabled={profile.saving}
        variant="secondary"
        fullWidth
      >
        {profile.saving ? (
          <OliveSpinner size="xs" className="text-current" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        حفظ التغييرات
      </Button>
    </Card>
  );
}
