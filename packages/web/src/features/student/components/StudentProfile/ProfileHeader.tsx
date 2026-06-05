"use client";

import { RefObject } from "react";
import { useQuery } from "convex/react";
import { Camera, MessageCircle, FileText, Pencil, Trash2 } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { Button, Card } from "@/components/ui";

const ROLE_LABEL: Record<string, string> = {
  student: "طالب",
  supervisor: "مشرف",
  admin: "مدير النظام",
  sponsor: "داعم",
};

interface ProfileHeaderProps {
  profile: ReturnType<typeof useStudentProfile>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** When false (supervisor / non-student surface), skip the applications chip. */
  showApplicationStats?: boolean;
  /** Edit-mode flag — controls avatar editing + the header edit button. */
  isEditing: boolean;
  onEdit: () => void;
  onRequestDeleteAvatar: () => void;
}

export function ProfileHeader({
  profile,
  fileInputRef,
  handleAvatarChange,
  showApplicationStats = true,
  isEditing,
  onEdit,
  onRequestDeleteAvatar,
}: ProfileHeaderProps) {
  // Only fetch stats when we're actually going to render the chip — saves a
  // Convex round-trip on the supervisor profile, which doesn't show it.
  const stats = useQuery(
    api.applications.shared.applicationStats,
    showApplicationStats ? {} : "skip",
  );

  const user = profile.user;
  const roleLabel = user?.role ? ROLE_LABEL[user.role] ?? user.role : null;
  const whatsappVerified = user?.whatsappVerified === true;

  // Compact info row under the name: studentId · college · email.
  const infoBits: string[] = [];
  if (user?.studentId) infoBits.push(user.studentId);
  if (user?.college && user?.department) {
    infoBits.push(`${user.college} — ${user.department}`);
  } else if (user?.college) {
    infoBits.push(user.college);
  }

  const avatarInner = profile.avatarPreviewUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.avatarPreviewUrl}
      alt="الصورة الشخصية"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
      {user?.name?.charAt(0) ?? "?"}
    </div>
  );

  return (
    <Card className="p-6 sm:p-7 overflow-hidden relative">
      {/* Top-trailing edit toggle — only the entry point into edit mode. */}
      {!isEditing && (
        <Button
          onPress={onEdit}
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10"
        >
          <Pencil className="w-4 h-4" />
          تعديل الملف
        </Button>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar — clickable to change only in edit mode. */}
        <div className="relative shrink-0">
          {isEditing ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ds-border overflow-hidden bg-muted group block"
              aria-label="تغيير الصورة الشخصية"
            >
              {avatarInner}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ds-border overflow-hidden bg-muted">
              {avatarInner}
            </div>
          )}

          {isEditing && profile.hasAvatar && (
            <button
              type="button"
              onClick={onRequestDeleteAvatar}
              disabled={profile.deletingAvatar}
              aria-label="حذف الصورة الشخصية"
              title="حذف الصورة"
              className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-destructive text-white ds-border flex items-center justify-center hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Identity + chips */}
        <div className="flex-1 min-w-0 w-full">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
            {user?.name ?? "—"}
          </h2>

          {infoBits.length > 0 && (
            <p className="mt-1 text-sm font-medium text-muted-foreground truncate">
              {infoBits.join(" · ")}
            </p>
          )}

          {user?.email && (
            <p
              dir="ltr"
              className="mt-0.5 text-xs font-mono text-muted-foreground/80 truncate text-right rtl:text-right"
            >
              {user.email}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {roleLabel && (
              <span className="inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {roleLabel}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                whatsappVerified
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              {whatsappVerified ? "واتساب موثّق" : "واتساب غير موثّق"}
            </span>
            {showApplicationStats && stats && stats.total > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-accent/12 text-accent">
                <FileText className="w-3 h-3" />
                {stats.total} {stats.total === 1 ? "طلب" : "طلبات"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
