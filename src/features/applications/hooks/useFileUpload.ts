"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const PDF_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Manages PDF and video file selection + upload.
 * Used by both create and edit application forms.
 */
export function useFileUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ pdf?: string; video?: string }>({});

  const onPdfDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (file.size > PDF_MAX_SIZE) {
      setErrors((prev) => ({ ...prev, pdf: "حجم الملف يجب أن لا يتجاوز 10MB" }));
      return;
    }
    setPdfFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.pdf;
      return next;
    });
  }, []);

  const onVideoDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (file.size > VIDEO_MAX_SIZE) {
      setErrors((prev) => ({ ...prev, video: "حجم الفيديو يجب أن لا يتجاوز 100MB" }));
      return;
    }
    setVideoFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.video;
      return next;
    });
  }, []);

  const pdfDropzone = useDropzone({
    onDrop: onPdfDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const videoDropzone = useDropzone({
    onDrop: onVideoDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".webm"] },
    maxFiles: 1,
  });

  /** Uploads a file to Convex storage and returns its storage ID. */
  const uploadFile = useCallback(
    async (file: File): Promise<Id<"_storage">> => {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) {
        throw new Error(`فشل رفع الملف (${res.status})`);
      }
      const { storageId } = await res.json();
      return storageId as Id<"_storage">;
    },
    [generateUploadUrl]
  );

  const clearPdf = useCallback(() => setPdfFile(null), []);
  const clearVideo = useCallback(() => setVideoFile(null), []);

  return {
    pdfFile,
    videoFile,
    pdfDropzone,
    videoDropzone,
    uploadFile,
    clearPdf,
    clearVideo,
    errors,
  };
}
