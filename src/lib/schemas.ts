/**
 * Shared Zod schemas — single source of truth for client-side form
 * validation. Convex functions enforce their own checks via `v.*`
 * validators and `assertMaxLength` in `convex/lib/validation.ts`;
 * these schemas are about giving users immediate feedback before the
 * submit round-trips.
 *
 * Schemas are imported into the existing form hooks (useApplicationForm,
 * useRegisterForm, useStudentProfile) and used via `.safeParse()`
 * so the hooks keep their current "errors as Record<string, string>"
 * shape — no react-hook-form migration required.
 */
import { z } from "zod";

// ============================================
// Primitives
// ============================================

/** Jordanian mobile number: 10 digits, starts with 07. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^07\d{8}$/, "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 07");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (val) => val.length === 0 || /^07\d{8}$/.test(val),
    "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 07",
  );

/** 9-digit university id, no separators. */
export const studentIdSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$/, "الرقم الجامعي يجب أن يكون 9 أرقام بالضبط");

/** Min 3 chars after trim. */
export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل");

/** Clerk-side password rule. Real complexity is enforced server-side. */
export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");

/** ZUJ-issued addresses only. */
const VALID_EMAIL_DOMAINS = ["@zuj.edu.jo", "@std-zuj.edu.jo", "@std.zuj.edu.jo"];
const STUDENT_DOMAINS = ["@std-zuj.edu.jo", "@std.zuj.edu.jo"];

export const universityEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (val) => VALID_EMAIL_DOMAINS.some((d) => val.endsWith(d)),
    "يجب استخدام البريد الجامعي (@zuj.edu.jo أو @std-zuj.edu.jo)",
  );

export function isStudentEmail(email: string): boolean {
  return STUDENT_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

export function isStaffEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@zuj.edu.jo");
}

// ============================================
// Application — core fields
// ============================================

export const applicationCoreSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, "اسم المشروع مطلوب")
    .max(120, "اسم المشروع طويل جداً"),
  description: z
    .string()
    .trim()
    .min(50, "الوصف يجب أن يكون 50 حرفاً على الأقل")
    .max(3000, "الوصف طويل جداً"),
  problemStatement: z
    .string()
    .trim()
    .min(1, "المشكلة مطلوبة")
    .max(2000, "نص المشكلة طويل جداً"),
  targetAudience: z
    .string()
    .trim()
    .min(1, "الجمهور المستهدف مطلوب")
    .max(1000, "النص طويل جداً"),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "اسم العضو مطلوب").max(80),
  phone: phoneSchema,
});

// ============================================
// Auth — register steps
// ============================================

export const registerStep1Schema = z.object({
  name: fullNameSchema,
  email: universityEmailSchema,
  studentId: studentIdSchema,
});

export const registerStep3Schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    college: z.string(),
    department: z.string(),
    isStudent: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمتا المرور غير متطابقتين",
  })
  .refine((data) => !data.isStudent || data.college.length > 0, {
    path: ["college"],
    message: "الكلية مطلوبة",
  })
  .refine((data) => !data.isStudent || data.department.length > 0, {
    path: ["department"],
    message: "التخصص مطلوب",
  });

// ============================================
// Profile (student-side)
// ============================================

export const studentProfileSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب"),
  phone: optionalPhoneSchema,
});

// ============================================
// Helpers
// ============================================

/**
 * Run a Zod schema and return `{ field: errorMessage }` shaped errors
 * — matches the existing `errors` state in form hooks so call sites
 * don't change their error rendering.
 */
export function safeParseToFieldErrors<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && !errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { ok: false, errors };
}
