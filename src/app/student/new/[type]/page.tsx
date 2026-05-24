"use client";

import { useParams } from "next/navigation";
import ApplicationCreateForm from "@/features/student/components/ApplicationCreateForm";
import ProfileCompletionGate from "@/features/student/components/ProfileCompletionGate";
import type { ApplicationType } from "@/features/student/hooks/useApplicationForm";

export default function NewApplicationPage() {
  const params = useParams();
  const type = params.type as ApplicationType;
  return (
    <ProfileCompletionGate>
      <ApplicationCreateForm type={type} />
    </ProfileCompletionGate>
  );
}
