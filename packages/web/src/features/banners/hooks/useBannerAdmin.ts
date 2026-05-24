"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { isYouTubeUrl } from "@/lib/youtube";

export type BannerVariant = "info" | "success" | "warning";
export type BannerAudience = "student" | "supervisor" | "landing" | "all";
export type BannerType = "text" | "scrolling" | "hero";
export type MediaType = "image" | "video" | "youtube" | "";

export interface BannerFormState {
  title: string;
  message: string;
  variant: BannerVariant;
  audience: BannerAudience;
  isActive: boolean;
  linkHref: string;
  linkLabel: string;
  imageUrl: string;
  bannerType: BannerType;
  /** ISO date string for the expiry date input (YYYY-MM-DD) */
  expiresDate: string;
  /** Time string for the optional expiry time input (HH:mm) */
  expiresTime: string;
  /** Media discriminator for hero banners */
  mediaType: MediaType;
  /** Selected file for upload (image or video) */
  mediaFile: File | null;
  /** YouTube URL (separate from imageUrl for clarity in the form) */
  youtubeUrl: string;
}

const EMPTY: BannerFormState = {
  title: "",
  message: "",
  variant: "info",
  audience: "all",
  isActive: true,
  linkHref: "",
  linkLabel: "",
  imageUrl: "",
  bannerType: "text",
  expiresDate: "",
  expiresTime: "",
  mediaType: "",
  mediaFile: null,
  youtubeUrl: "",
};

/** Convert date + optional time strings to a Unix timestamp (ms). */
function toExpiresAt(date: string, time: string): number | undefined {
  if (!date) return undefined;
  const dateTime = time ? `${date}T${time}` : `${date}T23:59:59`;
  const ts = new Date(dateTime).getTime();
  return isNaN(ts) ? undefined : ts;
}

/** Convert a Unix timestamp back to date/time strings. */
function fromExpiresAt(ts: number | undefined): {
  expiresDate: string;
  expiresTime: string;
} {
  if (!ts) return { expiresDate: "", expiresTime: "" };
  const d = new Date(ts);
  const expiresDate = d.toISOString().slice(0, 10);
  const expiresTime = d.toTimeString().slice(0, 5);
  return { expiresDate, expiresTime };
}

/**
 * All state + mutations for the supervisor banner management page.
 */
export function useBannerAdmin() {
  const banners = useQuery(api.banners.listAll, {});
  const createBanner = useMutation(api.banners.createBanner);
  const updateBanner = useMutation(api.banners.updateBanner);
  const toggleActive = useMutation(api.banners.toggleActive);
  const deleteBanner = useMutation(api.banners.deleteBanner);
  const generateUploadUrl = useMutation(api.banners.generateBannerUploadUrl);

  const [formState, setFormState] = useState<BannerFormState>(EMPTY);
  const [editingId, setEditingId] = useState<Id<"banners"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const setFormField = useCallback(
    <K extends keyof BannerFormState>(field: K, value: BannerFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormState(EMPTY);
    setEditingId(null);
    setFormError(null);
  }, []);

  /** Pre-fill the form for creating a scrolling announcement. */
  const initScrollingForm = useCallback(() => {
    setFormState({
      ...EMPTY,
      bannerType: "scrolling",
      variant: "info",
    });
    setEditingId(null);
    setFormError(null);
  }, []);

  /** Pre-fill the form for creating a hero (image/video) banner. */
  const initHeroForm = useCallback(() => {
    setFormState({
      ...EMPTY,
      bannerType: "hero",
      audience: "all",
      mediaType: "image",
    });
    setEditingId(null);
    setFormError(null);
  }, []);

  const startEdit = useCallback((banner: Doc<"banners">) => {
    const { expiresDate, expiresTime } = fromExpiresAt(banner.expiresAt);
    const inferredMediaType: MediaType =
      banner.mediaType ??
      (banner.imageUrl && isYouTubeUrl(banner.imageUrl)
        ? "youtube"
        : banner.imageUrl
          ? "image"
          : "");
    setEditingId(banner._id);
    setFormState({
      title: banner.title,
      message: banner.message,
      variant: banner.variant,
      audience: banner.audience,
      isActive: banner.isActive,
      linkHref: banner.linkHref ?? "",
      linkLabel: banner.linkLabel ?? "",
      imageUrl:
        inferredMediaType === "youtube" ? "" : (banner.imageUrl ?? ""),
      bannerType: banner.bannerType ?? (banner.imageUrl ? "hero" : "text"),
      expiresDate,
      expiresTime,
      mediaType: inferredMediaType,
      mediaFile: null,
      youtubeUrl:
        inferredMediaType === "youtube" ? (banner.imageUrl ?? "") : "",
    });
    setFormError(null);
  }, []);

  /** Upload a file to Convex storage and return the storage ID. */
  async function uploadFile(file: File): Promise<Id<"_storage">> {
    const url = await generateUploadUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("فشل في رفع الملف");
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    return storageId;
  }

  const submitForm = useCallback(async () => {
    setFormError(null);

    if (!formState.title.trim()) {
      setFormError("العنوان مطلوب");
      return false;
    }

    const isHero = formState.bannerType === "hero";
    const isScrolling = formState.bannerType === "scrolling";

    // Scrolling and text banners require a message
    if (!isHero && !formState.message.trim()) {
      setFormError("نص الرسالة مطلوب");
      return false;
    }

    // Hero banners require media
    if (isHero) {
      if (formState.mediaType === "youtube" && !formState.youtubeUrl.trim()) {
        setFormError("رابط اليوتيوب مطلوب");
        return false;
      }
      if (
        formState.mediaType === "youtube" &&
        !isYouTubeUrl(formState.youtubeUrl.trim())
      ) {
        setFormError("رابط اليوتيوب غير صالح");
        return false;
      }
      if (
        formState.mediaType === "image" &&
        !formState.mediaFile &&
        !formState.imageUrl.trim()
      ) {
        setFormError("يرجى رفع صورة أو إدخال رابط الصورة");
        return false;
      }
      if (formState.mediaType === "video" && !formState.mediaFile) {
        setFormError("يرجى رفع ملف الفيديو");
        return false;
      }
    }

    setSaving(true);
    try {
      const expiresAt = toExpiresAt(
        formState.expiresDate,
        formState.expiresTime,
      );

      let storageId: Id<"_storage"> | undefined;
      let imageUrl: string | undefined;
      let mediaType: "image" | "video" | "youtube" | undefined;

      if (isHero) {
        mediaType =
          formState.mediaType === "" ? undefined : formState.mediaType;

        if (formState.mediaType === "youtube") {
          imageUrl = formState.youtubeUrl.trim();
        } else if (formState.mediaFile) {
          storageId = await uploadFile(formState.mediaFile);
        } else if (formState.imageUrl.trim()) {
          imageUrl = formState.imageUrl.trim();
        }
      } else {
        imageUrl = formState.imageUrl.trim() || undefined;
      }

      const payload = {
        title: formState.title.trim(),
        message: formState.message.trim() || (isHero ? "" : undefined) || "",
        variant: formState.variant,
        audience: isHero ? ("all" as const) : formState.audience,
        isActive: formState.isActive,
        linkHref: formState.linkHref.trim() || undefined,
        linkLabel: formState.linkLabel.trim() || undefined,
        imageUrl,
        bannerType: formState.bannerType,
        expiresAt,
        mediaType,
        storageId,
      };

      if (editingId) {
        await updateBanner({ id: editingId, ...payload });
      } else {
        await createBanner(payload);
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
  }, [formState, editingId, updateBanner, createBanner, resetForm]);

  const toggle = useCallback(
    async (id: Id<"banners">, isActive: boolean) => {
      await toggleActive({ id, isActive });
    },
    [toggleActive],
  );

  const remove = useCallback(
    async (id: Id<"banners">) => {
      await deleteBanner({ id });
    },
    [deleteBanner],
  );

  return {
    banners,
    loading: banners === undefined,
    saving,
    formState,
    editingId,
    formError,
    setFormField,
    resetForm,
    initScrollingForm,
    initHeroForm,
    startEdit,
    submitForm,
    toggle,
    remove,
  };
}
