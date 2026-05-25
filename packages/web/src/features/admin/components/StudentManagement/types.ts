import { Id } from "@smart-zuj/convex";

export interface StudentProfile {
  _id: Id<"users">;
  name: string | null;
  email: string;
  studentId: string | null;
  college: string | null;
  department: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  isActive: boolean;
  createdAt: number | null;
  applicationCount: number;
}
