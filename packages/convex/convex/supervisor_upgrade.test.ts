import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

const VALID_REASON = "أنا عضو هيئة تدريس في قسم الحاسوب وأرغب في الإشراف على مشاريع الطلاب";

async function seedUser(
  t: ReturnType<typeof convexTest>,
  clerkId: string,
  role: "student" | "supervisor" | "admin",
  email?: string,
) {
  return await t.run((ctx) =>
    ctx.db.insert("users", {
      clerkId,
      email: email ?? `${clerkId}@test.local`,
      name: clerkId,
      role,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

// ─── submitRequest ────────────────────────────────────────────────────────────

describe("supervisorUpgradeRequests.submitRequest", () => {
  test("طالب @zuj.edu.jo يستطيع تقديم طلب ترقية", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "staff-1", "student", "dr.khalid@zuj.edu.jo");
    await seedUser(t, "adm-1", "admin");

    const reqId = await t
      .withIdentity({ subject: "staff-1" })
      .mutation(api.supervisorUpgradeRequests.submitRequest, { reason: VALID_REASON });

    const req = await t.run((ctx) => ctx.db.get(reqId));
    expect(req?.status).toBe("pending");
    expect(req?.reason).toBe(VALID_REASON);
  });

  test("طالب @std.zuj.edu.jo لا يستطيع تقديم طلب ترقية", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "stu-1", "student", "20230001@std.zuj.edu.jo");

    await expect(
      t.withIdentity({ subject: "stu-1" }).mutation(api.supervisorUpgradeRequests.submitRequest, {
        reason: VALID_REASON,
      }),
    ).rejects.toThrow();
  });

  test("سبب قصير (أقل من 20 حرف) يُرفض", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "staff-1", "student", "dr.khalid@zuj.edu.jo");

    await expect(
      t.withIdentity({ subject: "staff-1" }).mutation(api.supervisorUpgradeRequests.submitRequest, {
        reason: "سبب قصير",
      }),
    ).rejects.toThrow();
  });

  test("لا يُسمح بطلبين معلقَين في آنٍ واحد", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "staff-1", "student", "dr.khalid@zuj.edu.jo");
    await seedUser(t, "adm-1", "admin");

    await t
      .withIdentity({ subject: "staff-1" })
      .mutation(api.supervisorUpgradeRequests.submitRequest, { reason: VALID_REASON });

    await expect(
      t.withIdentity({ subject: "staff-1" }).mutation(api.supervisorUpgradeRequests.submitRequest, {
        reason: VALID_REASON,
      }),
    ).rejects.toThrow();
  });

  test("مشرف موجود لا يستطيع تقديم طلب ترقية", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "sup-1", "supervisor", "sup@zuj.edu.jo");

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(api.supervisorUpgradeRequests.submitRequest, {
        reason: VALID_REASON,
      }),
    ).rejects.toThrow();
  });
});

// ─── reviewRequest ────────────────────────────────────────────────────────────

describe("supervisorUpgradeRequests.reviewRequest", () => {
  async function seedPendingRequest(t: ReturnType<typeof convexTest>) {
    const staffId = await seedUser(t, "staff-1", "student", "dr.staff@zuj.edu.jo");
    await seedUser(t, "adm-1", "admin");

    const reqId = await t
      .withIdentity({ subject: "staff-1" })
      .mutation(api.supervisorUpgradeRequests.submitRequest, { reason: VALID_REASON });

    return { staffId, reqId };
  }

  test("الموافقة ترقّي دور المستخدم لـ supervisor", async () => {
    const t = convexTest(schema, modules);
    const { staffId, reqId } = await seedPendingRequest(t);

    await t.withIdentity({ subject: "adm-1" }).mutation(api.supervisorUpgradeRequests.reviewRequest, {
      requestId: reqId,
      decision: "approved",
    });

    const user = await t.run((ctx) => ctx.db.get(staffId));
    expect(user?.role).toBe("supervisor");

    const req = await t.run((ctx) => ctx.db.get(reqId));
    expect(req?.status).toBe("approved");
  });

  test("الرفض يبقي الدور student", async () => {
    const t = convexTest(schema, modules);
    const { staffId, reqId } = await seedPendingRequest(t);

    await t.withIdentity({ subject: "adm-1" }).mutation(api.supervisorUpgradeRequests.reviewRequest, {
      requestId: reqId,
      decision: "rejected",
    });

    const user = await t.run((ctx) => ctx.db.get(staffId));
    expect(user?.role).toBe("student");

    const req = await t.run((ctx) => ctx.db.get(reqId));
    expect(req?.status).toBe("rejected");
  });

  test("لا يمكن مراجعة طلب تم البت فيه مسبقاً", async () => {
    const t = convexTest(schema, modules);
    const { reqId } = await seedPendingRequest(t);

    await t.withIdentity({ subject: "adm-1" }).mutation(api.supervisorUpgradeRequests.reviewRequest, {
      requestId: reqId,
      decision: "approved",
    });

    await expect(
      t.withIdentity({ subject: "adm-1" }).mutation(api.supervisorUpgradeRequests.reviewRequest, {
        requestId: reqId,
        decision: "rejected",
      }),
    ).rejects.toThrow();
  });

  test("غير الأدمن لا يستطيع مراجعة الطلبات", async () => {
    const t = convexTest(schema, modules);
    const { reqId } = await seedPendingRequest(t);
    await seedUser(t, "sup-1", "supervisor");

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(api.supervisorUpgradeRequests.reviewRequest, {
        requestId: reqId,
        decision: "approved",
      }),
    ).rejects.toThrow();
  });
});

// ─── getMyRequest ─────────────────────────────────────────────────────────────

describe("supervisorUpgradeRequests.getMyRequest", () => {
  test("يُعيد الطلب الأخير للمستخدم الحالي", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "staff-1", "student", "dr.staff@zuj.edu.jo");
    await seedUser(t, "adm-1", "admin");

    await t
      .withIdentity({ subject: "staff-1" })
      .mutation(api.supervisorUpgradeRequests.submitRequest, { reason: VALID_REASON });

    const req = await t
      .withIdentity({ subject: "staff-1" })
      .query(api.supervisorUpgradeRequests.getMyRequest, {});

    expect(req?.status).toBe("pending");
  });

  test("يُعيد null إذا لم يقدّم المستخدم أي طلب", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "staff-1", "student", "dr.staff@zuj.edu.jo");

    const req = await t
      .withIdentity({ subject: "staff-1" })
      .query(api.supervisorUpgradeRequests.getMyRequest, {});

    expect(req).toBeNull();
  });
});

// ─── listRequests ─────────────────────────────────────────────────────────────

describe("supervisorUpgradeRequests.listRequests", () => {
  test("الأدمن يرى جميع الطلبات", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "staff-1", "student", "a@zuj.edu.jo");
    await seedUser(t, "staff-2", "student", "b@zuj.edu.jo");
    await seedUser(t, "adm-1", "admin");

    await t
      .withIdentity({ subject: "staff-1" })
      .mutation(api.supervisorUpgradeRequests.submitRequest, { reason: VALID_REASON });
    await t
      .withIdentity({ subject: "staff-2" })
      .mutation(api.supervisorUpgradeRequests.submitRequest, { reason: VALID_REASON });

    const list = await t
      .withIdentity({ subject: "adm-1" })
      .query(api.supervisorUpgradeRequests.listRequests, {});

    expect(list).toHaveLength(2);
  });

  test("المشرف لا يستطيع رؤية قائمة الطلبات", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "sup-1", "supervisor");

    await expect(
      t.withIdentity({ subject: "sup-1" }).query(api.supervisorUpgradeRequests.listRequests, {}),
    ).rejects.toThrow();
  });

  test("الفلترة بالحالة تعمل", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "staff-1", "student", "a@zuj.edu.jo");
    await seedUser(t, "adm-1", "admin");

    const reqId = await t
      .withIdentity({ subject: "staff-1" })
      .mutation(api.supervisorUpgradeRequests.submitRequest, { reason: VALID_REASON });

    await t.withIdentity({ subject: "adm-1" }).mutation(api.supervisorUpgradeRequests.reviewRequest, {
      requestId: reqId,
      decision: "approved",
    });

    const pending = await t
      .withIdentity({ subject: "adm-1" })
      .query(api.supervisorUpgradeRequests.listRequests, { status: "pending" });
    const approved = await t
      .withIdentity({ subject: "adm-1" })
      .query(api.supervisorUpgradeRequests.listRequests, { status: "approved" });

    expect(pending).toHaveLength(0);
    expect(approved).toHaveLength(1);
  });
});
