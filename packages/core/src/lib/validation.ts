/**
 * Shared field validators. Keep rules in one place so the student
 * application form and the profile form cannot drift.
 */

interface PhoneOptions {
  required?: boolean;
}

export function validatePhone(
  value: string,
  { required = false }: PhoneOptions = {},
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "رقم الهاتف مطلوب" : null;

  if (required) {
    if (!/^\d+$/.test(trimmed)) return "رقم الهاتف يجب أن يحتوي أرقاماً فقط";
    if (trimmed.length !== 10) return "رقم الهاتف يجب أن يكون 10 أرقام";
    if (!trimmed.startsWith("07")) return "رقم الهاتف يجب أن يبدأ بـ 07";
    return null;
  }

  if (!/^07\d{8}$/.test(trimmed)) {
    return "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 07";
  }
  return null;
}
