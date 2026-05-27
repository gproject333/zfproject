"use client";

import { useRef, useState } from "react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { usePasswordChange } from "../../hooks/usePasswordChange";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
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

  // Hooks must run unconditionally — even when the user data hasn't loaded yet.
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
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <ProfileHeader
        profile={profile}
        fileInputRef={fileInputRef}
        handleAvatarChange={handleAvatarChange}
        showApplicationStats={showAcademicFields}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <ProfileCard
            profile={profile}
            showAcademicFields={showAcademicFields}
            collegeNames={collegeNames}
            collegeDepartments={collegeDepartments}
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
    </div>
  );
}
