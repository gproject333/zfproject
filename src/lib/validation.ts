/**
 * Field validators. Schemas live in `./schemas` (Zod); this file is
 * kept as a thin compatibility shim so existing callers — which expect
 * a string-or-null contract — don't have to change.
 */
import { phoneSchema, optionalPhoneSchema } from "./schemas";

interface PhoneOptions {
  required?: boolean;
}

export function validatePhone(
  value: string,
  { required = false }: PhoneOptions = {},
): string | null {
  if (!value.trim()) return required ? "رقم الهاتف مطلوب" : null;
  const schema = required ? phoneSchema : optionalPhoneSchema;
  const result = schema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "رقم الهاتف غير صالح";
}
