import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

type Role = "student" | "supervisor" | "admin" | "sponsor";

async function seedUser(
  t: ReturnType<typeof convexTest>,
  opts: { clerkId: string; role: Role; isActive?: boolean },
) {
  return await t.run((ctx) =>
    ctx.db.insert("users", {
      clerkId: opts.clerkId,
      email: `${opts.clerkId}@test.local`,
      name: opts.clerkId,
      role: opts.role,
      isActive: opts.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

describe("toggleUserActive", () => {
  test("admin can freeze a student", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "adm-1", role: "admin" });
    const stu = await seedUser(t, { clerkId: "stu-1", role: "student" });

    await t.withIdentity({ subject: "adm-1" }).mutation(
      api.users.admin.toggleUserActive,
      { userId: stu, isActive: false },
    );

    const updated = await t.run((ctx) => ctx.db.get(stu));
    expect(updated?.isActive).toBe(false);
  });

  test("an admin cannot freeze their own account", async () => {
    const t = convexTest(schema, modules);
    const adm = await seedUser(t, { clerkId: "adm-1", role: "admin" });
    await seedUser(t, { clerkId: "adm-2", role: "admin" });

    await expect(
      t.withIdentity({ subject: "adm-1" }).mutation(
        api.users.admin.toggleUserActive,
        { userId: adm, isActive: false },
      ),
    ).rejects.toThrow();
  });

  test("freezing one admin is allowed while another active admin remains", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "adm-1", role: "admin" });
    const adm2 = await seedUser(t, { clerkId: "adm-2", role: "admin" });

    await t.withIdentity({ subject: "adm-1" }).mutation(
      api.users.admin.toggleUserActive,
      { userId: adm2, isActive: false },
    );

    expect((await t.run((ctx) => ctx.db.get(adm2)))?.isActive).toBe(false);
  });
});

describe("updateUserByAdmin", () => {
  test("updates name / department / phone", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "adm-1", role: "admin" });
    const sup = await seedUser(t, { clerkId: "sup-1", role: "supervisor" });

    await t.withIdentity({ subject: "adm-1" }).mutation(
      api.users.admin.updateUserByAdmin,
      { userId: sup, name: "د. سامي", department: "هندسة", phone: "0790000000" },
    );

    const updated = await t.run((ctx) => ctx.db.get(sup));
    expect(updated?.name).toBe("د. سامي");
    expect(updated?.department).toBe("هندسة");
    expect(updated?.phone).toBe("0790000000");
  });

  test("non-admins cannot update users", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "sup-1", role: "supervisor" });
    const stu = await seedUser(t, { clerkId: "stu-1", role: "student" });

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(
        api.users.admin.updateUserByAdmin,
        { userId: stu, name: "x" },
      ),
    ).rejects.toThrow();
  });
});

describe("deleteUserCascade", () => {
  test("deleting a student removes their applications and reviews", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedUser(t, { clerkId: "stu-1", role: "student" });
    const sup = await seedUser(t, { clerkId: "sup-1", role: "supervisor" });

    const appId = await t.run((ctx) =>
      ctx.db.insert("applications", {
        type: "entrepreneurial_idea",
        projectName: "مشروع",
        description: "وصف",
        problemStatement: "مشكلة",
        targetAudience: "جمهور",
        studentId: stu,
        status: "under_review",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    await t.run((ctx) =>
      ctx.db.insert("applicationReviews", {
        applicationId: appId,
        reviewerId: sup,
        fromStatus: "under_review",
        toStatus: "accepted",
        createdAt: Date.now(),
      }),
    );
    await t.run((ctx) =>
      ctx.db.insert("notifications", {
        userId: stu,
        title: "t",
        message: "m",
        type: "status_change",
        read: false,
        createdAt: Date.now(),
      }),
    );

    await t.mutation(internal.users.admin.deleteUserCascade, { userId: stu });

    expect(await t.run((ctx) => ctx.db.get(stu))).toBeNull();
    expect(await t.run((ctx) => ctx.db.get(appId))).toBeNull();
    const reviews = await t.run((ctx) =>
      ctx.db.query("applicationReviews").collect(),
    );
    expect(reviews).toHaveLength(0);
    const notifs = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifs).toHaveLength(0);
  });

  test("deleting a supervisor detaches their reviewer pointer but keeps the application", async () => {
    const t = convexTest(schema, modules);
    const stu = await seedUser(t, { clerkId: "stu-1", role: "student" });
    const sup = await seedUser(t, { clerkId: "sup-1", role: "supervisor" });

    const appId = await t.run((ctx) =>
      ctx.db.insert("applications", {
        type: "entrepreneurial_idea",
        projectName: "مشروع",
        description: "وصف",
        problemStatement: "مشكلة",
        targetAudience: "جمهور",
        studentId: stu,
        status: "under_review",
        reviewerId: sup,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );

    await t.mutation(internal.users.admin.deleteUserCascade, { userId: sup });

    const app = await t.run((ctx) => ctx.db.get(appId));
    expect(app).not.toBeNull();
    expect(app?.reviewerId).toBeUndefined();
    expect(await t.run((ctx) => ctx.db.get(sup))).toBeNull();
  });
});
