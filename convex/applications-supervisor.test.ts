import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";

// `import.meta.glob` is how convex-test discovers handler modules. The
// glob must be relative to the test file (which lives at the convex
// root) so the package can derive paths like "applications/supervisor".
const modules = import.meta.glob("./**/*.ts");

/**
 * Tests for the supervisor side of the application lifecycle: the
 * status-transition guard and the denormalized counters that hang off
 * it. Convex-test gives us a real in-process Convex runtime, so these
 * cover query+mutation logic AND the schema (validators reject bad
 * shapes before the handler runs).
 *
 * Each test seeds the minimal users + applications it needs through
 * `t.run(async (ctx) => ...)` (which sidesteps the auth check) and
 * then calls the public mutation via `t.withIdentity(...).mutation(...)`.
 */

const SUPERVISOR_CLERK_ID = "user_supervisor_test";
const STUDENT_CLERK_ID = "user_student_test";

async function seedFixtures(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const supervisorId = await ctx.db.insert("users", {
      clerkId: SUPERVISOR_CLERK_ID,
      email: "supervisor@zuj.edu.jo",
      name: "Dr. Supervisor",
      role: "supervisor",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const studentId = await ctx.db.insert("users", {
      clerkId: STUDENT_CLERK_ID,
      email: "student@std-zuj.edu.jo",
      name: "Test Student",
      role: "student",
      studentId: "200000001",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const applicationId = await ctx.db.insert("applications", {
      studentId,
      type: "entrepreneurial_idea",
      status: "under_review",
      submitted: true,
      projectName: "Test Project",
      description: "A".repeat(60),
      problemStatement: "Real problem",
      targetAudience: "Students",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAt: Date.now(),
    });

    // Seed the stats counter with the single under_review row so we
    // can assert deltas instead of absolute values.
    await ctx.db.insert("stats", {
      key: "global",
      students: 1,
      supervisors: 1,
      sponsors: 0,
      admins: 0,
      applicationsUnderReview: 1,
      applicationsAccepted: 0,
      applicationsRejected: 0,
      applicationsNeedsModification: 0,
      sponsorAssignments: 0,
      updatedAt: Date.now(),
    });

    return { supervisorId, studentId, applicationId };
  });
}

describe("applications.supervisor.updateApplicationStatus", () => {
  test("accepts a valid under_review → accepted transition and moves the counter", async () => {
    const t = convexTest(schema, modules);
    const { applicationId } = await seedFixtures(t);

    await t
      .withIdentity({ subject: SUPERVISOR_CLERK_ID })
      .mutation(api.applications.supervisor.updateApplicationStatus, {
        id: applicationId,
        status: "accepted",
      });

    const after = await t.run(async (ctx) => ctx.db.get(applicationId));
    expect(after?.status).toBe("accepted");

    const stats = await t.run(async (ctx) =>
      ctx.db
        .query("stats")
        .withIndex("by_key", (q) => q.eq("key", "global"))
        .first(),
    );
    expect(stats?.applicationsUnderReview).toBe(0);
    expect(stats?.applicationsAccepted).toBe(1);
  });

  test("rejects an illegal accepted → draft transition (state machine guard)", async () => {
    const t = convexTest(schema, modules);
    const fx = await seedFixtures(t);

    // Move to accepted first so the next transition is what we're
    // actually trying to validate.
    await t
      .withIdentity({ subject: SUPERVISOR_CLERK_ID })
      .mutation(api.applications.supervisor.updateApplicationStatus, {
        id: fx.applicationId,
        status: "accepted",
      });

    // canTransition() only allows accepted → no further moves. The
    // mutation should throw.
    await expect(
      t
        .withIdentity({ subject: SUPERVISOR_CLERK_ID })
        .mutation(api.applications.supervisor.updateApplicationStatus, {
          id: fx.applicationId,
          // @ts-expect-error -- we're deliberately passing a status the
          // public mutation refuses, both at the validator and at
          // canTransition().
          status: "draft",
        }),
    ).rejects.toThrow();
  });

  test("rejects non-supervisor callers", async () => {
    const t = convexTest(schema, modules);
    const fx = await seedFixtures(t);

    await expect(
      t
        .withIdentity({ subject: STUDENT_CLERK_ID })
        .mutation(api.applications.supervisor.updateApplicationStatus, {
          id: fx.applicationId,
          status: "accepted",
        }),
    ).rejects.toThrow();
  });

  test("records an applicationReviews audit row on every transition", async () => {
    const t = convexTest(schema, modules);
    const fx = await seedFixtures(t);

    await t
      .withIdentity({ subject: SUPERVISOR_CLERK_ID })
      .mutation(api.applications.supervisor.updateApplicationStatus, {
        id: fx.applicationId,
        status: "needs_modification",
        supervisorNotes: "زيد المرفقات",
      });

    const reviews = await t.run(async (ctx) =>
      ctx.db
        .query("applicationReviews")
        .withIndex("by_application", (q) =>
          q.eq("applicationId", fx.applicationId as Id<"applications">),
        )
        .collect(),
    );
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({
      fromStatus: "under_review",
      toStatus: "needs_modification",
      notes: "زيد المرفقات",
    });
  });
});
