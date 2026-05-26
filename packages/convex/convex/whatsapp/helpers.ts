const JORDAN_COUNTRY_CODE = "962";

/**
 * Normalize a user-entered phone to E.164 (e.g. "+962795551234").
 * Handles:
 *   - Already-E.164:           "+962795551234"
 *   - International "00" prefix: "00962795551234"
 *   - Jordanian local (default): "0795551234" -> "+962795551234"
 *   - Stray whitespace/dashes/parens
 *
 * Throws on any input that can't be coerced to a plausible E.164.
 */
export function normalizePhone(raw: string): string {
  if (!raw || typeof raw !== "string") {
    throw new Error("رقم الهاتف مطلوب");
  }

  const stripped = raw.replace(/[^\d+]/g, "");
  if (stripped === "" || /[A-Za-z]/.test(raw)) {
    throw new Error("رقم الهاتف غير صالح");
  }

  let digits: string;
  if (stripped.startsWith("+")) {
    digits = stripped.slice(1);
  } else if (stripped.startsWith("00")) {
    digits = stripped.slice(2);
  } else if (stripped.startsWith("0")) {
    digits = JORDAN_COUNTRY_CODE + stripped.slice(1);
  } else {
    digits = stripped;
  }

  if (!/^\d+$/.test(digits)) {
    throw new Error("رقم الهاتف غير صالح");
  }
  if (digits.length < 8 || digits.length > 15) {
    throw new Error("طول رقم الهاتف غير صالح");
  }

  return "+" + digits;
}

/**
 * Generate a 6-digit OTP. Uses the Web Crypto API (available in the
 * Convex V8 runtime). Zero-padded so leading zeros are preserved.
 */
export function generateOtpCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const n = buf[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

/**
 * SHA-256 the OTP code so we never store plaintext in the DB.
 * Returns a lowercase hex string.
 */
export async function hashOtpCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
