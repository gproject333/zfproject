import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

const APP_DATA = {
  type: "entrepreneurial_idea" as const,
  projectName: "تطبيق ذكي",
  description: "وصف.",
  problemStatement: "مشكلة.",
  targetAudience: "جمهور.",
};

async function seedStudent(t: ReturnType<typeof convexTest>, clerkId: string) {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      email: `${clerkId}@test.local`,
      name: clerkId,
      role: "student",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

async function seedSupervisor(t: ReturnType<typeof convexTest>, clerkId: string) {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      email: `${clerkId}@zuj.edu.jo`,
      name: clerkId,
      role: "supervisor",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

async function insertAppUnderReview(t: ReturnType<typeof convexTest>, studentId: ReturnType<typeof seedStudent> extends Promise<infer T> ? T : never) {
  return await t.run(async (ctx) =>
    ctx.db.insert("applications", {
      ...APP_DATA,
      studentId,
      status: "under_review",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAt: Date.now(),
    }),
  );
}

describe("supervisor.updateApplicationStatus — allowed transitions", () => {
  test("under_review → accepted records the decision + appends a review row", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");
    const id = await insertAppUnderReview(t, stu);

    await t.withIdentity({ subject: "sup-1" }).mutation(
      api.applications.supervisor.updateApplicationStatus,
      { id, status: "accepted", supervisorRating: "excellent" },
    );

    const updated = await t.run((ctx) => ctx.db.get(id));
    expect(updated?.status).toBe("accepted");
    expect(updated?.supervisorRating).toBe("excellent");

    const reviews = await t.run((ctx) =>
      ctx.db.query("applicationReviews").withIndex("by_application", (q) => q.eq("applicationId", id)).collect(),
    );
    expect(reviews).toHaveLength(1);
    expect(reviews[0].fromStatus).toBe("under_review");
    expect(reviews[0].toStatus).toBe("accepted");
  });

  test("under_review → needs_modification works", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");
    const id = await insertAppUnderReview(t, stu);

    await t.withIdentity({ subject: "sup-1" }).mutation(
      api.applications.supervisor.updateApplicationStatus,
      { id, status: "needs_modification", supervisorNotes: "أضف خطة مالية." },
    );

    const updated = await t.run((ctx) => ctx.db.get(id));
    expect(updated?.status).toBe("needs_modification");
  });
});

describe("supervisor.updateApplicationStatus — note required for rejection / changes", () => {
  test("rejecting without a note is refused", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");
    const id = await insertAppUnderReview(t, stu);

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(
        api.applications.supervisor.updateApplicationStatus,
        { id, status: "rejected" },
      ),
    ).rejects.toThrow();

    const unchanged = await t.run((ctx) => ctx.db.get(id));
    expect(unchanged?.status).toBe("under_review");
  });

  test("requesting changes with a blank note is refused", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");
    const id = await insertAppUnderReview(t, stu);

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(
        api.applications.supervisor.updateApplicationStatus,
        { id, status: "needs_modification", supervisorNotes: "   " },
      ),
    ).rejects.toThrow();
  });

  test("rejecting with a note succeeds", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");
    const id = await insertAppUnderReview(t, stu);

    await t.withIdentity({ subject: "sup-1" }).mutation(
      api.applications.supervisor.updateApplicationStatus,
      { id, status: "rejected", supervisorNotes: "الفكرة غير مكتملة." },
    );

    const updated = await t.run((ctx) => ctx.db.get(id));
    expect(updated?.status).toBe("rejected");
    expect(updated?.supervisorNotes).toBe("الفكرة غير مكتملة.");
  });

  test("bulk request-changes skips entries that lack a note", async () => {
    const t = convexTest(schema, modules);
    await seedSupervisor(t, "sup-1");
    const stu = await seedStudent(t, "stu-1");
    const id = await insertAppUnderReview(t, stu);

    const result = await t.withIdentity({ subject: "sup-1" }).mutation(
      api.applications.supervisor.bulkUpdateStatus,
      { ids: [id], status: "needs_modification" },
    );

    expect(result.succeeded).toHaveLength(0);
    expect(result.skipped.find((s) => s.id === id)).toBeTruthy();
  });
});

describe("supervisor.updateApplicationStatus — forbidden transitions", () => {
  test("accepted → rejected is rejected (terminal status)", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");
    const id = await t.run(async (ctx) =>
      ctx.db.insert("applications", {
        ...APP_DATA,
        studentId: stu,
        status: "accepted",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(
        api.applications.supervisor.updateApplicationStatus,
        { id, status: "rejected" },
      ),
    ).rejects.toThrow();
  });

  test("non-supervisors cannot change status", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedStudent(t, "stu-1");
    const id = await insertAppUnderReview(t, stu);

    await expect(
      t.withIdentity({ subject: "stu-1" }).mutation(
        api.applications.supervisor.updateApplicationStatus,
        { id, status: "accepted" },
      ),
    ).rejects.toThrow();
  });
});

describe("supervisor.bulkUpdateStatus", () => {
  test("caps at 100 ids per call", async () => {
    const t = convexTest(schema, modules);
    await seedSupervisor(t, "sup-1");
    const stu = await seedStudent(t, "stu-1");
    const id = await insertAppUnderReview(t, stu);
    const fakeIds = Array(101).fill(id);

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(
        api.applications.supervisor.bulkUpdateStatus,
        { ids: fakeIds, status: "accepted" },
      ),
    ).rejects.toThrow();
  });

  test("skips entries whose current status disallows the transition", async () => {
    const t = convexTest(schema, modules);
    await seedSupervisor(t, "sup-1");
    const stu = await seedStudent(t, "stu-1");
    const acceptedId = await t.run(async (ctx) =>
      ctx.db.insert("applications", {
        ...APP_DATA,
        studentId: stu,
        status: "accepted",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    const reviewableId = await insertAppUnderReview(t, stu);

    const result = await t.withIdentity({ subject: "sup-1" }).mutation(
      api.applications.supervisor.bulkUpdateStatus,
      { ids: [acceptedId, reviewableId], status: "accepted" },
    );

    expect(result.succeeded).toContain(reviewableId);
    expect(result.skipped.find((s) => s.id === acceptedId)).toBeTruthy();
  });
});
