import { describe, expect, test } from "vitest";
import { generateOtpCode, hashOtpCode, normalizePhone } from "./helpers";

describe("normalizePhone", () => {
  test("accepts E.164 format", () => {
    expect(normalizePhone("+962795551234")).toBe("+962795551234");
  });

  test("converts 00 prefix to +", () => {
    expect(normalizePhone("00962795551234")).toBe("+962795551234");
  });

  test("converts Jordanian local format (079...) to E.164", () => {
    expect(normalizePhone("0795551234")).toBe("+962795551234");
  });

  test("strips whitespace, dashes, parentheses", () => {
    expect(normalizePhone("+962 (79) 555-1234")).toBe("+962795551234");
  });

  test("rejects empty string", () => {
    expect(() => normalizePhone("")).toThrow();
  });

  test("rejects letters", () => {
    expect(() => normalizePhone("+96279ABCD234")).toThrow();
  });

  test("rejects too short", () => {
    expect(() => normalizePhone("+12345")).toThrow();
  });

  test("rejects too long", () => {
    expect(() => normalizePhone("+1234567890123456789")).toThrow();
  });
});

describe("generateOtpCode", () => {
  test("returns 6-digit numeric string", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      const n = Number(code);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });

  test("produces varied output (not the same code twice in a row)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) seen.add(generateOtpCode());
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("hashOtpCode", () => {
  test("is deterministic", async () => {
    expect(await hashOtpCode("123456")).toBe(await hashOtpCode("123456"));
  });

  test("differs for different inputs", async () => {
    expect(await hashOtpCode("123456")).not.toBe(await hashOtpCode("123457"));
  });

  test("returns 64-character hex string", async () => {
    expect(await hashOtpCode("123456")).toMatch(/^[0-9a-f]{64}$/);
  });
});
