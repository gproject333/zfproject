"use client";

import { useParams } from "next/navigation";
import ApplicationCreateForm from "@/features/student/components/ApplicationCreateForm";
import type { ApplicationType } from "@/features/student/hooks/useApplicationForm";

export default function NewApplicationPage() {
  const params = useParams();
  const type = params.type as ApplicationType;
  return <ApplicationCreateForm type={type} />;
}
