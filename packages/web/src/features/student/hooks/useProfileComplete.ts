"use client";

import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";

export interface ProfileCompleteness {
  loading: boolean;
  isComplete: boolean;
  /** Missing field labels, ready for display. */
  missing: string[];
  /** Sign-only check: did currentUser resolve at all? */
  hasUser: boolean;
}

/**
 * "Complete enough to submit an application" check. Requires the three
 * student-only fields a supervisor will need to identify the applicant —
 * studentId, college, and department. Phone/LinkedIn/avatar stay optional.
 *
 * Returns the missing fields in display order so callers can render a
 * concrete prompt ("أكمل: الرقم الجامعي، الكلية") instead of a vague
 * "complete your profile" message.
 */
export function useProfileComplete(): ProfileCompleteness {
  const user = useQuery(api.users.shared.currentUser);

  if (user === undefined) {
    return { loading: true, isComplete: false, missing: [], hasUser: false };
  }
  if (user === null) {
    return { loading: false, isComplete: false, missing: [], hasUser: false };
  }

  const missing: string[] = [];
  if (!user.studentId?.trim()) missing.push("الرقم الجامعي");
  if (!user.college?.trim()) missing.push("الكلية");
  if (!user.department?.trim()) missing.push("التخصص");

  return {
    loading: false,
    isComplete: missing.length === 0,
    missing,
    hasUser: true,
  };
}
