import type { Id } from "../../../../convex/_generated/dataModel";
import type { ApplicationFormData } from "@/features/student/hooks/useApplicationForm";

interface UploadedFiles {
  pdfFileId?: Id<"_storage">;
  videoFileId?: Id<"_storage">;
}

/**
 * Builds the shared portion of the create/update application mutation
 * payload from the form state and uploaded file IDs.
 */
export function buildApplicationPayload(
  formData: ApplicationFormData,
  files: UploadedFiles = {}
) {
  const cleanedTeam = formData.teamMembers.filter(
    (m) => m.name.trim() !== "" || m.phone.trim() !== ""
  );

  const str = (key: string) => {
    const v = formData[key];
    return typeof v === "string" && v !== "" ? v : undefined;
  };

  // projectCategory: IT form holds string[], others hold a single string.
  // Normalize both to an array for the backend.
  const rawCategory = formData.projectCategory;
  let projectCategory: string[] | undefined;
  if (Array.isArray(rawCategory)) {
    const arr = rawCategory.filter((v): v is string => typeof v === "string");
    projectCategory = arr.length > 0 ? arr : undefined;
  } else if (typeof rawCategory === "string" && rawCategory !== "") {
    projectCategory = [rawCategory];
  }

  return {
    projectName: formData.projectName,
    description: formData.description,
    problemStatement: formData.problemStatement,
    targetAudience: formData.targetAudience,
    teamMembers: cleanedTeam.length > 0 ? cleanedTeam : undefined,
    phone: str("phone"),
    projectGoals: str("projectGoals"),
    projectCategory,
    targetLocation: str("targetLocation"),
    supervisor: str("supervisor"),
    universityBenefit: str("universityBenefit"),
    ...(files.pdfFileId && { pdfFileId: files.pdfFileId }),
    ...(files.videoFileId && { videoFileId: files.videoFileId }),
  };
}
