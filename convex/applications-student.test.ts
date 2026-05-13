import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

/**
 * Student-side application mutations: createApplication and
 * submitApplication. Focus is on the status invariants — draft vs.
 * submitted, the `submitted` denormalized flag, and the counter
 * increments.
 */

const STUDENT_CLERK_ID = "user_student_create";

async function seedStudent(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const id = await ctx.db.insert("users", {
      clerkId: STUDENT_CLERK_ID,
      email: "student@std-zuj.edu.jo",
      name: "Student",
      role: "student",
      studentId: "200111111",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await ctx.db.insert("stats", {
      key: "global",
      students: 1,
      supervisors: 0,
      sponsors: 0,
      admins: 0,
      applicationsUnderReview: 0,
      applicationsAccepted: 0,
      applicationsRejected: 0,
      applicationsNeedsModification: 0,
      sponsorAssignments: 0,
      updatedAt: Date.now(),
    });
    return id;
  });
}

const VALID_APP = {
  type: "entrepreneurial_idea" as const,
  projectName: "Project",
  description: "A".repeat(60),
  problemStatement: "X",
  targetAudience: "Y",
};

describe("applications.student.createApplication", () => {
  test("submitNow=false saves as draft and does NOT increment the under_review counter", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t);

    const appId = await t
      .withIdentity({ subject: STUDENT_CLERK_ID })
      .mutation(api.applications.student.createApplication, {
        ...VALID_APP,
        submitNow: false,
      });

    const app = await t.run(async (ctx) => ctx.db.get(appId));
    expect(app?.status).toBe("draft");
    expect(app?.submitted).toBe(false);
    expect(app?.submittedAt).toBeUndefined();

    const stats = await t.run(async (ctx) =>
      ctx.db
        .query("stats")
        .withIndex("by_key", (q) => q.eq("key", "global"))
        .first(),
    );
    expect(stats?.applicationsUnderReview).toBe(0);
  });

  test("submitNow=true immediately goes to under_review and bumps the counter", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t);

    const appId = await t
      .withIdentity({ subject: STUDENT_CLERK_ID })
      .mutation(api.applications.student.createApplication, {
        ...VALID_APP,
        submitNow: true,
      });

    const app = await t.run(async (ctx) => ctx.db.get(appId));
    expect(app?.status).toBe("under_review");
    expect(app?.submitted).toBe(true);
    expect(app?.submittedAt).toBeGreaterThan(0);

    const stats = await t.run(async (ctx) =>
      ctx.db
        .query("stats")
        .withIndex("by_key", (q) => q.eq("key", "global"))
        .first(),
    );
    expect(stats?.applicationsUnderReview).toBe(1);
  });

  test("rejects unauthenticated callers", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t);

    await expect(
      t.mutation(api.applications.student.createApplication, {
        ...VALID_APP,
        submitNow: false,
      }),
    ).rejects.toThrow();
  });
});
