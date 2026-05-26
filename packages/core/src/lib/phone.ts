/**
 * Convert a Jordanian phone number in E.164 form (`+962...`) to the
 * 10-digit local form (`07...`) that the application forms expect.
 *
 * Returns the input unchanged if it doesn't look E.164, so the caller
 * can pass it through safely as a default value.
 */
export function e164ToLocalJordan(phone: string | undefined | null): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (trimmed.startsWith("+962")) return "0" + trimmed.slice(4);
  if (trimmed.startsWith("962")) return "0" + trimmed.slice(3);
  return trimmed;
}
