"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export type GuideResourceType = "video" | "course" | "link";

export interface GuideFormState {
  title: string;
  type: GuideResourceType;
  url: string;
}

const EMPTY: GuideFormState = {
  title: "",
  type: "link",
  url: "",
};

export function useGuideAdmin() {
  const resources = useQuery(api.entrepreneurialGuide.list, {});
  const createResource = useMutation(api.entrepreneurialGuide.create);
  const updateResource = useMutation(api.entrepreneurialGuide.update);
  const deleteResource = useMutation(api.entrepreneurialGuide.remove);

  const [formState, setFormState] = useState<GuideFormState>(EMPTY);
  const [editingId, setEditingId] = useState<Id<"entrepreneurialGuide"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const setFormField = useCallback(
    <K extends keyof GuideFormState>(field: K, value: GuideFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormState(EMPTY);
    setEditingId(null);
    setFormError(null);
  }, []);

  const initCreateForm = useCallback(() => {
    setFormState(EMPTY);
    setEditingId(null);
    setFormError(null);
  }, []);

  const startEdit = useCallback((resource: Doc<"entrepreneurialGuide">) => {
    setEditingId(resource._id);
    setFormState({
      title: resource.title,
      type: resource.type,
      url: resource.url,
    });
    setFormError(null);
  }, []);

  const submitForm = useCallback(async () => {
    setFormError(null);

    if (!formState.title.trim()) {
      setFormError("العنوان مطلوب");
      return false;
    }
    if (!formState.url.trim()) {
      setFormError("الرابط مطلوب");
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        title: formState.title.trim(),
        type: formState.type,
        url: formState.url.trim(),
      };

      if (editingId) {
        await updateResource({ id: editingId, ...payload });
      } else {
        await createResource(payload);
      }
      resetForm();
      return true;
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "حدث خطأ");
      return false;
    } finally {
      setSaving(false);
    }
  }, [formState, editingId, updateResource, createResource, resetForm]);

  const remove = useCallback(
    async (id: Id<"entrepreneurialGuide">) => {
      await deleteResource({ id });
    },
    [deleteResource],
  );

  return {
    resources,
    loading: resources === undefined,
    saving,
    formState,
    editingId,
    formError,
    setFormField,
    resetForm,
    initCreateForm,
    startEdit,
    submitForm,
    remove,
  };
}
