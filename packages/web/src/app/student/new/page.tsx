"use client";

import TypeSelector from "@/features/student/components/TypeSelector";
import ProfileCompletionGate from "@/features/student/components/ProfileCompletionGate";

export default function NewApplicationPage() {
  return (
    <ProfileCompletionGate>
      <TypeSelector />
    </ProfileCompletionGate>
  );
}
