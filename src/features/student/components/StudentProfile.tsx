"use client";

import { useRef, useState } from "react";
import {Camera, Save, CheckCircle2, Shield, Link2, KeyRound, Mail} from "lucide-react";
import { useStudentProfile } from "../hooks/useStudentProfile";
import { usePasswordChange } from "../hooks/usePasswordChange";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { Button, Input, Spinner, Card} from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface StudentProfileProps {
  /** Show college & department dropdowns. Default: true. */
  showAcademicFields?: boolean;
}

export default function StudentProfile({ showAcademicFields = true }: StudentProfileProps) {
  const profile = useStudentProfile();
  const password = usePasswordChange();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({
    code: "",
    newPassword: "",
  });

  // hooks must be called before any conditional return
  const colleges = useQuery(api.colleges.list, {});
  const selectedCollege = colleges?.find((c) => c.name === profile.form.college);
  const departments = useQuery(
    api.colleges.getDepartmentsByCollege,
    selectedCollege ? { collegeId: selectedCollege._id as Id<"colleges"> } : "skip",
  );
  const collegeNames = colleges?.map((c) => c.name) ?? [];
  const collegeDepartments = departments?.map((d) => d.name) ?? [];

  if (profile.loading) return <SkeletonDashboard />;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) profile.setField("avatarFile", file);
  };

  return (
    <div className="animate-fade-in flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        <h2 className="text-2xl font-extrabold text-center">ملفي الشخصي</h2>

        {/* ─── بطاقة البيانات الشخصية ─── */}
        <Card className="p-6 space-y-6">
          {/* الصورة الشخصية */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full nb-border overflow-hidden bg-muted group shrink-0"
            >
              {profile.avatarPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarPreviewUrl}
                  alt="الصورة الشخصية"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-muted-foreground">
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
            <p className="text-xs text-muted-foreground font-bold">
              اضغط لتغيير الصورة
            </p>
          </div>

          {/* حقول النموذج */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5">
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
              <label className="block text-xs font-bold mb-1.5">
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
              <label className="block text-xs font-bold mb-1.5">
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
                  <label className="block text-xs font-bold mb-1.5">الكلية</label>
                  <Select
                    value={profile.form.college}
                    onValueChange={(v) => {
                      profile.setField("college", v);
                      profile.setField("department", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الكلية" />
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
                  <label className="block text-xs font-bold mb-1.5">التخصص</label>
                  <Select
                    value={profile.form.department}
                    onValueChange={(v) => profile.setField("department", v)}
                    isDisabled={!profile.form.college}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={profile.form.college ? "اختر التخصص" : "اختر الكلية أولاً"}
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
              <label className="block text-xs font-bold mb-1.5">
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
                    يجب أن يكون 10 أرقام ويبدأ بـ 07
                  </p>
                )}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5">
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
              تم حفظ التغييرات بنجاح
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

        {/* ─── بطاقة الأمان ─── */}
        <Card className="p-6 space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            الأمان
          </h3>

          {password.step === "idle" && (
            <Button
              onPress={() =>
                profile.user?.email &&
                void password.requestReset(profile.user.email)
              }
              isDisabled={password.loading}
              variant="outline"
              size="sm"
            >
              {password.loading ? (
                <Spinner size="sm" color="current" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              تغيير كلمة المرور
            </Button>
          )}

          {password.step === "verifying" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                تم إرسال رمز التحقق إلى بريدك الإلكتروني
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    رمز التحقق
                  </label>
                  <Input
                    fullWidth
                    value={passwordForm.code}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, code: e.target.value }))
                    }
                    placeholder="123456"
                    dir="ltr"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    كلمة المرور الجديدة
                  </label>
                  <Input
                    type="password"
                    fullWidth
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onPress={() =>
                    profile.user?.email &&
                    void password.verifyAndChange(
                      profile.user.email,
                      passwordForm.code,
                      passwordForm.newPassword,
                    )
                  }
                  isDisabled={password.loading}
                  variant="secondary"
                  size="sm"
                >
                  {password.loading ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  تأكيد
                </Button>
                <Button
                  onPress={() => {
                    password.reset();
                    setPasswordForm({ code: "", newPassword: "" });
                  }}
                  variant="outline"
                  size="sm"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {password.step === "done" && (
            <p className="text-sm font-semibold text-success flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              تم تغيير كلمة المرور بنجاح
            </p>
          )}

          {password.error && (
            <p className="text-xs font-semibold text-destructive">
              {password.error}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
