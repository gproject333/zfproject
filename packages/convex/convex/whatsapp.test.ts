import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { hashOtpCode } from "./whatsapp/helpers";
import type { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.*s");

async function seedStudent(t: ReturnType<typeof convexTest>, clerkId = "stu-1") {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      email: `${clerkId}@zuj.edu.jo`,
      name: clerkId,
      role: "student",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

describe("whatsapp.requestWhatsappOtp", () => {
  test("rejects invalid phone format", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await expect(
      asStudent.mutation(api.whatsapp.otp.requestWhatsappOtp, { phone: "not-a-phone" }),
    ).rejects.toThrow();
  });

  test("creates verification row and queues outbox on success", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    await asStudent.mutation(api.whatsapp.otp.requestWhatsappOtp, {
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const verifs = await ctx.db.query("whatsappVerifications").collect();
      expect(verifs).toHaveLength(1);
      expect(verifs[0].userId).toBe(studentId);
      expect(verifs[0].phone).toBe("+962795551234");
      expect(verifs[0].consumed).toBe(false);
      expect(verifs[0].attempts).toBe(0);
      expect(verifs[0].codeHash).toMatch(/^[0-9a-f]{64}$/);

      const outbox = await ctx.db.query("whatsappOutbox").collect();
      expect(outbox).toHaveLength(1);
      expect(outbox[0].kind).toBe("otp");
      expect(outbox[0].status).toBe("queued");
    });
  });

  test("rejects when last request was < 60s ago", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    await asStudent.mutation(api.whatsapp.otp.requestWhatsappOtp, {
      phone: "+962795551234",
    });

    await expect(
      asStudent.mutation(api.whatsapp.otp.requestWhatsappOtp, { phone: "+962795551234" }),
    ).rejects.toThrow(/انتظر/);
  });

  test("consumes previous active OTP before creating a new one", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    // Seed an old non-consumed verification (>60s old) so rate-limit lets us through
    await t.run(async (ctx) => {
      await ctx.db.insert("whatsappVerifications", {
        userId: studentId,
        phone: "+962795550000",
        codeHash: "old".padStart(64, "0"),
        expiresAt: Date.now() + 600_000,
        attempts: 0,
        consumed: false,
        createdAt: Date.now() - 120_000,
      });
    });

    await asStudent.mutation(api.whatsapp.otp.requestWhatsappOtp, {
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const active = await ctx.db
        .query("whatsappVerifications")
        .withIndex("by_user_active", (q) => q.eq("userId", studentId).eq("consumed", false))
        .collect();
      expect(active).toHaveLength(1);
      expect(active[0].phone).toBe("+962795551234");
    });
  });

  test("rejects unauthenticated caller", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.whatsapp.otp.requestWhatsappOtp, { phone: "+962795551234" }),
    ).rejects.toThrow();
  });
});

describe("whatsapp.verifyWhatsappOtp", () => {
  async function seedActiveOtp(
    t: ReturnType<typeof convexTest>,
    studentId: Id<"users">,
    code: string,
    overrides: { expiresAt?: number; attempts?: number; consumed?: boolean } = {},
  ) {
    const codeHash = await hashOtpCode(code);
    return await t.run(async (ctx) =>
      ctx.db.insert("whatsappVerifications", {
        userId: studentId,
        phone: "+962795551234",
        codeHash,
        expiresAt: overrides.expiresAt ?? Date.now() + 600_000,
        attempts: overrides.attempts ?? 0,
        consumed: overrides.consumed ?? false,
        createdAt: Date.now(),
      }),
    );
  }

  test("accepts correct code and marks user verified", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456");

    await asStudent.mutation(api.whatsapp.otp.verifyWhatsappOtp, { code: "123456" });

    await t.run(async (ctx) => {
      const user = await ctx.db.get(studentId);
      expect(user?.whatsappVerified).toBe(true);
      expect(user?.phone).toBe("+962795551234");
      expect(user?.phoneVerificationTime).toBeGreaterThan(0);

      const verif = (await ctx.db.query("whatsappVerifications").collect())[0];
      expect(verif.consumed).toBe(true);
    });
  });

  test("returns failure on wrong code and increments attempts", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456");

    const result = await asStudent.mutation(api.whatsapp.otp.verifyWhatsappOtp, {
      code: "999999",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.attemptsLeft).toBe(4);
      expect(result.error).toMatch(/تبقى/);
    }

    await t.run(async (ctx) => {
      const verif = (await ctx.db.query("whatsappVerifications").collect())[0];
      expect(verif.attempts).toBe(1);
      expect(verif.consumed).toBe(false);
    });
  });

  test("rejects after 5 attempts", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456", { attempts: 5 });

    await expect(
      asStudent.mutation(api.whatsapp.otp.verifyWhatsappOtp, { code: "123456" }),
    ).rejects.toThrow();
  });

  test("rejects expired code", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456", { expiresAt: Date.now() - 1 });

    await expect(
      asStudent.mutation(api.whatsapp.otp.verifyWhatsappOtp, { code: "123456" }),
    ).rejects.toThrow(/منتهي/);
  });

  test("rejects already-consumed code", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456", { consumed: true });

    await expect(
      asStudent.mutation(api.whatsapp.otp.verifyWhatsappOtp, { code: "123456" }),
    ).rejects.toThrow();
  });
});

describe("whatsapp.setWhatsappOptOut", () => {
  test("toggles opt-out flag on caller user", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    await asStudent.mutation(api.whatsapp.otp.setWhatsappOptOut, { optOut: true });
    await t.run(async (ctx) => {
      expect((await ctx.db.get(studentId))?.whatsappOptOut).toBe(true);
    });

    await asStudent.mutation(api.whatsapp.otp.setWhatsappOptOut, { optOut: false });
    await t.run(async (ctx) => {
      expect((await ctx.db.get(studentId))?.whatsappOptOut).toBe(false);
    });
  });

  test("rejects unauthenticated caller", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.whatsapp.otp.setWhatsappOptOut, { optOut: true }),
    ).rejects.toThrow();
  });
});
