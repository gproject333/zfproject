import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../schema";

const modules = import.meta.glob("../**/*.*s");

async function seedUser(
  t: ReturnType<typeof convexTest>,
  role: "student" | "supervisor" | "admin" | "sponsor",
  overrides: {
    whatsappVerified?: boolean;
    whatsappOptOut?: boolean;
    phone?: string;
  } = {},
) {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId: `${role}-1`,
      email: `${role}@zuj.edu.jo`,
      name: role,
      role,
      isActive: true,
      phone: overrides.phone,
      whatsappVerified: overrides.whatsappVerified,
      whatsappOptOut: overrides.whatsappOptOut,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

describe("maybeSendWhatsapp", () => {
  test("creates outbox row for verified, opted-in student", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: true,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: { meetingDate: "2026-06-01", supervisorName: "د. أحمد" },
      });
    });

    await t.run(async (ctx) => {
      const outbox = await ctx.db.query("whatsappOutbox").collect();
      expect(outbox).toHaveLength(1);
      expect(outbox[0].kind).toBe("meeting");
      expect(outbox[0].status).toBe("queued");
      expect(outbox[0].userId).toBe(studentId);
      expect(outbox[0].phone).toBe("+962795551234");
    });
  });

  test("no-op when user is not verified", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: false,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });

  test("no-op when user opted out", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: true,
      whatsappOptOut: true,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });

  test("no-op for supervisor role", async () => {
    const t = convexTest(schema, modules);
    const supervisorId = await seedUser(t, "supervisor", {
      whatsappVerified: true,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: supervisorId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });

  test("no-op when phone is missing (defensive)", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: true,
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });

  test("routes status_change to sendStatusChange action", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: true,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "status_change",
        data: { applicationName: "مشروع", newStatus: "accepted" },
      });
    });

    await t.run(async (ctx) => {
      const outbox = await ctx.db.query("whatsappOutbox").collect();
      expect(outbox).toHaveLength(1);
      expect(outbox[0].kind).toBe("status_change");
    });
  });
});
