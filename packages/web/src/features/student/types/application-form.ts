import type { FORM_EXTRA_FIELDS } from "@/lib/configs/application";

export type ApplicationType = keyof typeof FORM_EXTRA_FIELDS;

export interface TeamMember {
  name: string;
  phone: string;
}

export interface ApplicationFormData {
  projectName: string;
  description: string;
  problemStatement: string;
  targetAudience: string;
  teamMembers: TeamMember[];
  [key: string]: string | string[] | TeamMember[];
}

export type FieldValue = string | string[] | TeamMember[];
export type ExtraField = (typeof FORM_EXTRA_FIELDS)[ApplicationType][number];
