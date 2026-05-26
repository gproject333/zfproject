"use client";

import { useRef, useState } from "react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { usePasswordChange } from "../../hooks/usePasswordChange";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { ProfileCard } from "./ProfileCard";
import { SecurityCard } from "./SecurityCard";
import { WhatsappLink } from "../WhatsappLink";

interface StudentProfileProps {
  /** Show college & department dropdowns. Default: true. */
  showAcademicFields?: boolean;
}

export default function StudentProfile({ showAcademicFields = true }: StudentProfileProps) {
  const profile = useStudentProfile();
  const password = usePasswordChange();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({
    code: "",
    newPassword: "",
  });

  // hooks must be called before any conditional return
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
    <div className="animate-fade-in flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        <h2 className="text-2xl font-bold text-center">الملف الشخصي</h2>

        {/* ─── بطاقة البيانات الشخصية ─── */}
        <ProfileCard
          profile={profile}
          fileInputRef={fileInputRef}
          showAcademicFields={showAcademicFields}
          collegeNames={collegeNames}
          collegeDepartments={collegeDepartments}
          handleAvatarChange={handleAvatarChange}
        />

        {/* ─── بطاقة الواتساب ─── */}
        <WhatsappLink />

        {/* ─── بطاقة الأمان ─── */}
        <SecurityCard
          profile={profile}
          password={password}
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
        />
      </div>
    </div>
  );
}
