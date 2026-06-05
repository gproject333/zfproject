"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { usePasswordChange } from "../../hooks/usePasswordChange";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { toast } from "@/lib/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileCard } from "./ProfileCard";
import { SecurityCard } from "./SecurityCard";
import { AccountInfoCard } from "./AccountInfoCard";
import { WhatsappLink } from "../WhatsappLink";

interface StudentProfileProps {
  /** Show college & department dropdowns. Default: true. */
  showAcademicFields?: boolean;
}

/**
 * Profile shell shared by /student/profile and /supervisor/profile.
 *
 * Layout: hero header on top (avatar + identity + status chips), then a
 * 7/5 grid on wide screens: editable fields on the right, supporting
 * cards (WhatsApp link, password change, read-only account info) on
 * the left. Stacks to a single column on mobile.
 */
export default function StudentProfile({ showAcademicFields = true }: StudentProfileProps) {
  const profile = useStudentProfile();
  const password = usePasswordChange();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({
    code: "",
    newPassword: "",
  });
  // The profile opens in read-only "view" mode; the user explicitly enters
  // edit mode to change fields or the avatar.
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteAvatar, setConfirmDeleteAvatar] = useState(false);

  const cancelEdit = () => {
    profile.resetForm();
    setIsEditing(false);
  };

  // A freshly-picked (unsaved) avatar is cleared immediately; an already-saved
  // one needs a confirm since deletion is permanent.
  const requestDeleteAvatar = () => {
    if (profile.form.avatarFile) {
      void profile.removeAvatar();
      return;
    }
    setConfirmDeleteAvatar(true);
  };

  const handleDeleteAvatar = async () => {
    const res = await profile.removeAvatar();
    if (res.ok) toast.success("تم حذف الصورة الشخصية");
    else toast.error(res.error);
    setConfirmDeleteAvatar(false);
  };

  // Hooks must run unconditionally — even when the user data hasn't loaded yet.
  const colleges = useQuery(api.colleges.list, {});
  // Use the structured ID if available; fall back to name-matching for legacy rows.
  const selectedCollegeId: Id<"colleges"> | undefined =
    (profile.form.collegeId as Id<"colleges">) || undefined;
  const departments = useQuery(
    api.colleges.getDepartmentsByCollege,
    selectedCollegeId ? { collegeId: selectedCollegeId } : "skip",
  );
  // Pass full objects so ProfileCard can render names while storing IDs.
  const collegeOptions = colleges ?? [];
  const departmentOptions = departments ?? [];

  if (profile.loading) return <SkeletonDashboard />;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) profile.setField("avatarFile", file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <ProfileHeader
        profile={profile}
        fileInputRef={fileInputRef}
        handleAvatarChange={handleAvatarChange}
        showApplicationStats={showAcademicFields}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onRequestDeleteAvatar={requestDeleteAvatar}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <ProfileCard
            profile={profile}
            showAcademicFields={showAcademicFields}
            collegeOptions={collegeOptions}
            departmentOptions={departmentOptions}
            isEditing={isEditing}
            onCancel={cancelEdit}
            onSaved={() => setIsEditing(false)}
          />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <WhatsappLink />
          <SecurityCard
            profile={profile}
            password={password}
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
          />
          <AccountInfoCard user={profile.user} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteAvatar}
        onOpenChange={(open) => {
          if (!profile.deletingAvatar) setConfirmDeleteAvatar(open);
        }}
        title="حذف الصورة الشخصية"
        description="سيتم حذف صورتك الشخصية نهائيًا. هل أنت متأكد؟"
        icon={<Trash2 className="w-6 h-6 text-destructive" />}
        destructive
        confirmLabel="نعم، حذف"
        cancelLabel="إلغاء"
        isSubmitting={profile.deletingAvatar}
        onConfirm={() => void handleDeleteAvatar()}
      />
    </div>
  );
}
