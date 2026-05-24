"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { validatePhone } from "@smart-zuj/core";

export interface ProfileFormState {
  name: string;
  phone: string;
  college: string;
  department: string;
  studentId: string;
  linkedinUrl: string;
  avatarFile: File | null;
}

const EMPTY: ProfileFormState = {
  name: "",
  phone: "",
  college: "",
  department: "",
  studentId: "",
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
      phone: user.phone ?? "",
      college: user.college ?? "",
      department: user.department ?? "",
      studentId: user.studentId ?? "",
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
    if (!res.ok) throw new Error("فشل في رفع الصورة");
    const { storageId } = (await res.json()) as {
      storageId: Id<"_storage">;
    };
    return storageId;
  }

  const submit = useCallback(async () => {
    setError(null);
    setSuccess(false);

    if (!form.name.trim()) {
      setError("الاسم مطلوب");
      return false;
    }

    const phoneError = validatePhone(form.phone.trim());
    if (phoneError) {
      setError(phoneError);
      return false;
    }

    setSaving(true);
    try {
      let avatarId: Id<"_storage"> | undefined;
      if (form.avatarFile) {
        avatarId = await uploadAvatar(form.avatarFile);
      }

      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        college: form.college || undefined,
        department: form.department || undefined,
        studentId: form.studentId.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        avatar: avatarId,
      });

      setForm((prev) => ({ ...prev, avatarFile: null }));
      setSuccess(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
      return false;
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
