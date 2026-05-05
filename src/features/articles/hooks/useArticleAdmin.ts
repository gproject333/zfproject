"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export type ArticleAudience = "student" | "supervisor" | "all";

export interface ArticleFormState {
  title: string;
  summary: string;
  body: string;
  tags: string[];
  audience: ArticleAudience;
  isPublished: boolean;
  coverStorageId?: Id<"_storage">;
  coverFile: File | null;
  /** Signed URL for an already-uploaded cover, shown while editing. */
  existingCoverUrl?: string;
}

const EMPTY: ArticleFormState = {
  title: "",
  summary: "",
  body: "",
  tags: [],
  audience: "student",
  isPublished: true,
  coverStorageId: undefined,
  coverFile: null,
  existingCoverUrl: undefined,
};

/**
 * All state + mutations for the supervisor article management page.
 * Mirrors the structure of `useBannerAdmin` but with the simpler set
 * of fields articles need. File upload uses the standard
 * `generateArticleCoverUploadUrl` -> POST -> storageId flow.
 */
export function useArticleAdmin() {
  const articles = useQuery(api.articles.listAll, {});
  const createArticle = useMutation(api.articles.createArticle);
  const updateArticle = useMutation(api.articles.updateArticle);
  const togglePublished = useMutation(api.articles.togglePublished);
  const deleteArticle = useMutation(api.articles.deleteArticle);
  const generateUploadUrl = useMutation(api.articles.generateArticleCoverUploadUrl);

  const [formState, setFormState] = useState<ArticleFormState>(EMPTY);
  const [editingId, setEditingId] = useState<Id<"articles"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const setFormField = useCallback(
    <K extends keyof ArticleFormState>(field: K, value: ArticleFormState[K]) => {
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

  const startEdit = useCallback(
    (article: Doc<"articles"> & { coverUrl?: string }) => {
      setEditingId(article._id);
      setFormState({
        title: article.title,
        summary: article.summary ?? "",
        body: article.body,
        tags: article.tags ?? [],
        audience: article.audience,
        isPublished: article.isPublished,
        coverStorageId: article.coverStorageId,
        coverFile: null,
        existingCoverUrl: article.coverUrl,
      });
      setFormError(null);
    },
    [],
  );

  async function uploadFile(file: File): Promise<Id<"_storage">> {
    const url = await generateUploadUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("فشل في رفع صورة الغلاف");
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    return storageId;
  }

  const submitForm = useCallback(async () => {
    setFormError(null);

    if (!formState.title.trim()) {
      setFormError("العنوان مطلوب");
      return false;
    }
    if (!formState.body.trim()) {
      setFormError("محتوى المقالة مطلوب");
      return false;
    }

    setSaving(true);
    try {
      let coverStorageId = formState.coverStorageId;
      if (formState.coverFile) {
        coverStorageId = await uploadFile(formState.coverFile);
      }

      const payload = {
        title: formState.title.trim(),
        summary: formState.summary.trim() || undefined,
        body: formState.body,
        coverStorageId,
        tags: formState.tags.length > 0 ? formState.tags : undefined,
        audience: formState.audience,
        isPublished: formState.isPublished,
      };

      if (editingId) {
        await updateArticle({ id: editingId, ...payload });
      } else {
        await createArticle(payload);
      }
      resetForm();
      return true;
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "حدث خطأ");
      return false;
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, editingId, updateArticle, createArticle, resetForm]);

  const toggle = useCallback(
    async (id: Id<"articles">, isPublished: boolean) => {
      await togglePublished({ id, isPublished });
    },
    [togglePublished],
  );

  const remove = useCallback(
    async (id: Id<"articles">) => {
      await deleteArticle({ id });
    },
    [deleteArticle],
  );

  return {
    articles,
    loading: articles === undefined,
    saving,
    formState,
    editingId,
    formError,
    setFormField,
    resetForm,
    initCreateForm,
    startEdit,
    submitForm,
    toggle,
    remove,
  };
}
