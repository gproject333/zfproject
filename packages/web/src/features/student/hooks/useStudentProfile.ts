"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";

export interface ProfileFormState {
  name: string;
  collegeId: string;
  departmentId: string;
  linkedinUrl: string;
  avatarFile: File | null;
}

const EMPTY: ProfileFormState = {
  name: "",
  collegeId: "",
  departmentId: "",
  linkedinUrl: "",
  avatarFile: null,
};

export function useStudentProfile() {
  const user = useQuery(api.users.shared.currentUser);
  const avatarUrl = useQuery(api.users.shared.getAvatarUrl);
  const updateProfile = useMutation(api.users.shared.updateProfile);
  const generateUploadUrl = useMutation(
    api.users.shared.generateAvatarUploadUrl,
  );

  const [form, setForm] = useState<ProfileFormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Hydrate the form from the loaded user. Using the "store the previous prop"
  // pattern (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  // — runs during render whenever the user identity changes, which keeps
  // strict React 19 effect rules happy.
  const [lastUserId, setLastUserId] = useState<Id<"users"> | undefined>(undefined);
  if (user && user._id !== lastUserId) {
    setLastUserId(user._id);
    setForm({
      name: user.name ?? "",
      collegeId: (user.collegeId as string) ?? "",
      departmentId: (user.departmentId as string) ?? "",
      linkedinUrl: user.linkedinUrl ?? "",
      avatarFile: null,
    });
  }

  const setField = useCallback(
    <K extends keyof ProfileFormState>(
      field: K,
      value: ProfileFormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setSuccess(false);
    },
    [],
  );

  const avatarPreviewUrl = form.avatarFile
    ? URL.createObjectURL(form.avatarFile)
    : avatarUrl ?? null;

  async function uploadAvatar(file: File): Promise<Id<"_storage">> {
    const url = await generateUploadUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("تعذّر رفع الصورة.");
    const { storageId } = (await res.json()) as {
      storageId: Id<"_storage">;
    };
    return storageId;
  }

  const submit = useCallback(async () => {
    setError(null);
    setSuccess(false);

    if (!form.name.trim()) {
      const msg = "الاسم حقل مطلوب.";
      setError(msg);
      return { ok: false as const, error: msg };
    }

    setSaving(true);
    try {
      let avatarId: Id<"_storage"> | undefined;
      if (form.avatarFile) {
        avatarId = await uploadAvatar(form.avatarFile);
      }

      await updateProfile({
        name: form.name.trim(),
        collegeId: form.collegeId ? (form.collegeId as Id<"colleges">) : undefined,
        departmentId: form.departmentId ? (form.departmentId as Id<"departments">) : undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        avatar: avatarId,
      });

      setForm((prev) => ({ ...prev, avatarFile: null }));
      setSuccess(true);
      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "حدث خطأ.";
      setError(msg);
      return { ok: false as const, error: msg };
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, updateProfile]);

  return {
    user,
    form,
    setField,
    saving,
    error,
    success,
    submit,
    avatarPreviewUrl,
    loading: user === undefined,
  };
}
