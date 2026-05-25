"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Camera, CheckCircle2, Link2, Save } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import { Button, Card, Input, Spinner } from "@/components/ui";
import { validatePhone } from "@smart-zuj/core";

interface FormState {
  name: string;
  phone: string;
  linkedinUrl: string;
  avatarFile: File | null;
}

const EMPTY: FormState = { name: "", phone: "", linkedinUrl: "", avatarFile: null };

/**
 * Sponsor self-service profile editor — narrower than the student version
 * (no academic fields, no student ID), tuned to the gold brand. Avatar
 * uploads reuse the shared generateAvatarUploadUrl mutation. All other
 * fields hit the shared updateProfile mutation.
 */
export default function SponsorProfileForm() {
  const user = useQuery(api.users.shared.currentUser);
  const avatarUrl = useQuery(api.users.shared.getAvatarUrl);
  const updateProfile = useMutation(api.users.shared.updateProfile);
  const generateUploadUrl = useMutation(api.users.shared.generateAvatarUploadUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Hydrate the editable form from the server document once it lands and on
  // re-fetch. Same pattern used by useStudentProfile.
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        linkedinUrl: user.linkedinUrl ?? "",
        avatarFile: null,
      });
    }
  }, [user]);

  const avatarPreview = form.avatarFile
    ? URL.createObjectURL(form.avatarFile)
    : avatarUrl ?? null;

  if (user === undefined) {
    return (
      <Card className="p-10 flex justify-center">
        <Spinner size="lg" color="current" className="text-secondary" />
      </Card>
    );
  }
  if (user === null) {
    return (
      <Card className="p-6 text-center text-sm font-bold text-muted-foreground">
        تعذّر تحميل البيانات. يُرجى إعادة تحميل الصفحة.
      </Card>
    );
  }

  async function uploadAvatar(file: File): Promise<Id<"_storage">> {
    const url = await generateUploadUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("تعذّر رفع الصورة");
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    return storageId;
  }

  async function submit() {
    setError(null);
    setSuccess(false);

    if (!form.name.trim()) {
      setError("الاسم مطلوب");
      return;
    }
    const phoneError = validatePhone(form.phone.trim());
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setSaving(true);
    try {
      const avatarId = form.avatarFile ? await uploadAvatar(form.avatarFile) : undefined;
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        avatar: avatarId,
      });
      setForm((prev) => ({ ...prev, avatarFile: null }));
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقّع");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6 space-y-6 border-secondary/20 shadow-[0_0_24px_rgba(201,162,39,0.08)]">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden bg-muted group shrink-0
                     border-2 border-secondary/40 shadow-[0_0_24px_rgba(201,162,39,0.25)]"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="الصورة الشخصية"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-muted-foreground bg-gradient-to-br from-secondary/15 to-secondary/5">
              {user.name?.charAt(0) ?? "؟"}
            </div>
          )}
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setForm((prev) => ({ ...prev, avatarFile: file }));
                setSuccess(false);
              }
            }}
          />
        </button>
        <p className="text-xs text-muted-foreground font-semibold">
          يمكن النقر على الصورة لتغييرها
        </p>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold mb-1.5">الاسم الكامل</label>
          <Input
            fullWidth
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setSuccess(false);
            }}
            placeholder="الاسم الكامل"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5">البريد الإلكتروني</label>
          <Input
            fullWidth
            className="bg-muted/50 cursor-not-allowed"
            value={user.email ?? ""}
            readOnly
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5">رقم الهاتف</label>
          <Input
            fullWidth
            value={form.phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm((p) => ({ ...p, phone: val }));
              setSuccess(false);
            }}
            placeholder="07XXXXXXXX"
            dir="ltr"
            maxLength={10}
            inputMode="numeric"
          />
          {form.phone && !/^07\d{8}$/.test(form.phone) && (
            <p className="text-[10px] text-destructive mt-1 font-bold">
              يجب أن يتكوّن من 10 أرقام ويبدأ بـ 07
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[#0A66C2]" />
            رابط LinkedIn
          </label>
          <Input
            fullWidth
            value={form.linkedinUrl}
            onChange={(e) => {
              setForm((p) => ({ ...p, linkedinUrl: e.target.value }));
              setSuccess(false);
            }}
            placeholder="https://linkedin.com/in/..."
            dir="ltr"
          />
        </div>
      </div>

      {/* Feedback */}
      {error && <p className="text-xs font-bold text-destructive">{error}</p>}
      {success && (
        <p className="text-xs font-bold text-success flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          حُفظت التغييرات بنجاح
        </p>
      )}

      <Button
        onPress={() => void submit()}
        isDisabled={saving}
        variant="secondary"
        fullWidth
      >
        {saving ? <Spinner size="sm" color="current" /> : <Save className="w-4 h-4" />}
        حفظ التغييرات
      </Button>
    </Card>
  );
}
