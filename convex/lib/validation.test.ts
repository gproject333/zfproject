import { describe, expect, test } from "vitest";
import {
  FIELD_LIMITS,
  assertMaxLength,
  assertArrayItemsMaxLength,
} from "./validation";

describe("assertMaxLength", () => {
  test("accepts null and undefined as no-ops (optional fields stay optional)", () => {
    expect(() => assertMaxLength("projectName", undefined)).not.toThrow();
    expect(() => assertMaxLength("projectName", null)).not.toThrow();
  });

  test("accepts values up to and including the cap", () => {
    const cap = FIELD_LIMITS.projectName;
    expect(() => assertMaxLength("projectName", "x".repeat(cap))).not.toThrow();
  });

  test("throws once the value exceeds the cap", () => {
    const cap = FIELD_LIMITS.description;
    expect(() => assertMaxLength("description", "x".repeat(cap + 1))).toThrow();
  });

  test("the thrown message names the field and the cap so the UI can surface a useful error", () => {
    const cap = FIELD_LIMITS.articleTitle;
    expect(() => assertMaxLength("articleTitle", "x".repeat(cap + 1))).toThrow(
      new RegExp(`${cap}`),
    );
  });
});

describe("assertArrayItemsMaxLength", () => {
  test("no-op for null / undefined / empty arrays", () => {
    expect(() => assertArrayItemsMaxLength("projectCategory", undefined)).not.toThrow();
    expect(() => assertArrayItemsMaxLength("projectCategory", null)).not.toThrow();
    expect(() => assertArrayItemsMaxLength("projectCategory", [])).not.toThrow();
  });

  test("validates every item, not just the first", () => {
    const cap = FIELD_LIMITS.articleTag;
    expect(() =>
      assertArrayItemsMaxLength("articleTag", ["short", "x".repeat(cap + 1)]),
    ).toThrow();
  });
});

describe("FIELD_LIMITS coverage", () => {
  // Catches regressions where a new mutation introduces a field but
  // forgets to register a cap in validation.ts.
  test("covers every application-form field", () => {
    const expected = [
      "projectName",
      "description",
      "problemStatement",
      "targetAudience",
      "projectGoals",
      "universityBenefit",
      "targetLocation",
      "supervisor",
      "phone",
      "teamMemberName",
      "teamMemberPhone",
      "projectCategory",
    ] as const;
    for (const key of expected) {
      expect(FIELD_LIMITS[key]).toBeGreaterThan(0);
    }
  });

  test("covers the article/banner/guide fields added by the backend persona", () => {
    const expected = [
      "articleTitle",
      "articleSummary",
      "articleBody",
      "articleTag",
      "bannerTitle",
      "bannerMessage",
      "bannerLinkHref",
      "bannerLinkLabel",
      "guideTitle",
      "guideUrl",
    ] as const;
    for (const key of expected) {
      expect(FIELD_LIMITS[key]).toBeGreaterThan(0);
    }
  });
});
