import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

function webhookPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "user_test_1",
    email_addresses: [{ email_address: "20230001@std.zuj.edu.jo" }],
    phone_numbers: [],
    first_name: "أحمد",
    last_name: "محمد",
    unsafe_metadata: {},
    ...overrides,
  };
}

// ─── user.created ────────────────────────────────────────────────────────────

describe("handleClerkWebhook — user.created", () => {
  test("طالب @std.zuj.edu.jo يُضاف برقمه الجامعي", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: webhookPayload({
        id: "clerk-stu-1",
        email_addresses: [{ email_address: "20230001@std.zuj.edu.jo" }],
      }),
    });

    const user = await t.run((ctx) =>
      ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk-stu-1")).unique(),
    );

    expect(user).not.toBeNull();
    expect(user?.role).toBe("student");
    expect(user?.studentId).toBe("20230001");
    expect(user?.isActive).toBe(true);
  });

  test("طالب @std-zuj.edu.jo (النطاق القديم) يُضاف أيضاً", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: webhookPayload({
        id: "clerk-stu-2",
        email_addresses: [{ email_address: "20199999@std-zuj.edu.jo" }],
      }),
    });

    const user = await t.run((ctx) =>
      ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk-stu-2")).unique(),
    );

    expect(user?.studentId).toBe("20199999");
    expect(user?.role).toBe("student");
  });

  test("عضو هيئة تدريس @zuj.edu.jo يُضاف بدون رقم جامعي", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: webhookPayload({
        id: "clerk-staff-1",
        email_addresses: [{ email_address: "dr.khalid@zuj.edu.jo" }],
      }),
    });

    const user = await t.run((ctx) =>
      ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk-staff-1")).unique(),
    );

    expect(user).not.toBeNull();
    expect(user?.role).toBe("student");
    expect(user?.studentId).toBeUndefined();
  });

  test("إيميل خارجي (gmail) يُتجاهل ولا يُضاف", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: webhookPayload({
        id: "clerk-external-1",
        email_addresses: [{ email_address: "outsider@gmail.com" }],
      }),
    });

    const user = await t.run((ctx) =>
      ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk-external-1")).unique(),
    );

    expect(user).toBeNull();
  });

  test("الاسم يُبنى من first_name + last_name", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: webhookPayload({
        id: "clerk-named",
        first_name: "سارة",
        last_name: "العمري",
        email_addresses: [{ email_address: "20230002@std.zuj.edu.jo" }],
      }),
    });

    const user = await t.run((ctx) =>
      ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk-named")).unique(),
    );

    expect(user?.name).toBe("سارة العمري");
  });
});

// ─── user.updated ────────────────────────────────────────────────────────────

describe("handleClerkWebhook — user.updated", () => {
  test("يُحدّث بيانات مستخدم موجود", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: webhookPayload({
        id: "clerk-upd-1",
        first_name: "قديم",
        last_name: "",
        email_addresses: [{ email_address: "20230003@std.zuj.edu.jo" }],
      }),
    });

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.updated",
      data: webhookPayload({
        id: "clerk-upd-1",
        first_name: "جديد",
        last_name: "اسم",
        email_addresses: [{ email_address: "20230003@std.zuj.edu.jo" }],
        phone_numbers: [{ phone_number: "+962790000001" }],
      }),
    });

    const user = await t.run((ctx) =>
      ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk-upd-1")).unique(),
    );

    expect(user?.name).toBe("جديد اسم");
    expect(user?.phone).toBe("+962790000001");
  });

  test("user.updated لإيميل خارجي لا يُنشئ سجلاً جديداً", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.updated",
      data: webhookPayload({
        id: "clerk-ext-upd",
        email_addresses: [{ email_address: "outsider@gmail.com" }],
      }),
    });

    const count = await t.run((ctx) => ctx.db.query("users").collect());
    expect(count).toHaveLength(0);
  });
});

// ─── user.deleted ────────────────────────────────────────────────────────────

describe("handleClerkWebhook — user.deleted", () => {
  test("يضع isActive=false بدلاً من الحذف (soft delete)", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: webhookPayload({
        id: "clerk-del-1",
        email_addresses: [{ email_address: "20230004@std.zuj.edu.jo" }],
      }),
    });

    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.deleted",
      data: { id: "clerk-del-1" },
    });

    const user = await t.run((ctx) =>
      ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk-del-1")).unique(),
    );

    expect(user).not.toBeNull();
    expect(user?.isActive).toBe(false);
  });

  test("حذف مستخدم غير موجود لا يُسبّب خطأ", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(internal.users.handleClerkWebhook, {
        type: "user.deleted",
        data: { id: "clerk-nonexistent" },
      }),
    ).resolves.not.toThrow();
  });
});
