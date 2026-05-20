import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

const SHARED_DRAFT = {
  type: "entrepreneurial_idea" as const,
  projectName: "زراعة الزيتون الذكية",
  description: "نظام ري ذكي لمزارع الزيتون.",
  problemStatement: "هدر المياه في الري التقليدي.",
  targetAudience: "مزارعو الزيتون في الأردن.",
};

async function seedStudent(t: ReturnType<typeof convexTest>, clerkId: string, name = "أحمد") {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      email: `${clerkId}@test.local`,
      name,
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

describe("student.createApplication", () => {
  test("creates a draft by default", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t, "stu-1");
    const id = await t.withIdentity({ subject: "stu-1" }).mutation(
      api.applications.student.createApplication,
      SHARED_DRAFT,
    );
    const created = await t.run((ctx) => ctx.db.get(id));
    expect(created?.status).toBe("draft");
    expect(created?.submittedAt).toBeUndefined();
  });

  test("submits immediately when submitNow=true and stamps submittedAt", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");

    const id = await t.withIdentity({ subject: "stu-1" }).mutation(
      api.applications.student.createApplication,
      { ...SHARED_DRAFT, submitNow: true },
    );
    const created = await t.run((ctx) => ctx.db.get(id));
    expect(created?.status).toBe("under_review");
    expect(typeof created?.submittedAt).toBe("number");
  });

  test("rejects non-students", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("users", {
        clerkId: "sup-1",
        email: "sup@zuj.edu.jo",
        role: "supervisor",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(
        api.applications.student.createApplication,
        SHARED_DRAFT,
      ),
    ).rejects.toThrow();
  });

  test("rejects oversize text per FIELD_LIMITS (description 3000 cap)", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t, "stu-1");
    await expect(
      t.withIdentity({ subject: "stu-1" }).mutation(
        api.applications.student.createApplication,
        { ...SHARED_DRAFT, description: "x".repeat(3001) },
      ),
    ).rejects.toThrow();
  });
});

describe("student.submitApplication", () => {
  test("moves draft → under_review", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t, "stu-1");
    await seedSupervisor(t, "sup-1");

    const id = await t.withIdentity({ subject: "stu-1" }).mutation(
      api.applications.student.createApplication,
      SHARED_DRAFT,
    );
    await t.withIdentity({ subject: "stu-1" }).mutation(
      api.applications.student.submitApplication,
      { id },
    );

    const after = await t.run((ctx) => ctx.db.get(id));
    expect(after?.status).toBe("under_review");
  });

  test("refuses to submit an application owned by someone else", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t, "stu-1");
    await seedStudent(t, "stu-2");

    const id = await t.withIdentity({ subject: "stu-1" }).mutation(
      api.applications.student.createApplication,
      SHARED_DRAFT,
    );

    await expect(
      t.withIdentity({ subject: "stu-2" }).mutation(
        api.applications.student.submitApplication,
        { id },
      ),
    ).rejects.toThrow();
  });

  test("rejects re-submitting an already-accepted application", async () => {
    const t = convexTest(schema, modules);
    const stuId = await seedStudent(t, "stu-1");

    const id = await t.run(async (ctx) =>
      ctx.db.insert("applications", {
        ...SHARED_DRAFT,
        studentId: stuId,
        status: "accepted",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );

    await expect(
      t.withIdentity({ subject: "stu-1" }).mutation(
        api.applications.student.submitApplication,
        { id },
      ),
    ).rejects.toThrow();
  });
});

describe("student.deleteApplication", () => {
  test("a student can delete their own draft", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t, "stu-1");
    const id = await t.withIdentity({ subject: "stu-1" }).mutation(
      api.applications.student.createApplication,
      SHARED_DRAFT,
    );
    await t.withIdentity({ subject: "stu-1" }).mutation(
      api.applications.student.deleteApplication,
      { id },
    );
    expect(await t.run((ctx) => ctx.db.get(id))).toBeNull();
  });

  test("a student cannot delete an under_review application", async () => {
    const t = convexTest(schema, modules);
    const stuId = await seedStudent(t, "stu-1");
    const id = await t.run(async (ctx) =>
      ctx.db.insert("applications", {
        ...SHARED_DRAFT,
        studentId: stuId,
        status: "under_review",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    await expect(
      t.withIdentity({ subject: "stu-1" }).mutation(
        api.applications.student.deleteApplication,
        { id },
      ),
    ).rejects.toThrow();
  });
});
