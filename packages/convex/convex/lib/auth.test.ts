import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "../schema";
import {
  requireUser,
  requireSupervisor,
  requireAdmin,
  requireStudent,
  getOptionalUser,
  getOptionalSupervisor,
  getOptionalAdmin,
} from "./auth";

const modules = import.meta.glob("../**/*.*s");

type Role = "student" | "supervisor" | "admin" | "sponsor";

/** Seeds a users row with the given role/clerkId and returns the doc id. */
async function seedUser(
  t: ReturnType<typeof convexTest>,
  opts: { clerkId: string; role?: Role; isActive?: boolean },
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkId: opts.clerkId,
      email: `${opts.clerkId}@test.local`,
      name: opts.clerkId,
      role: opts.role,
      isActive: opts.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
}

describe("requireUser", () => {
  test("throws when no identity is attached to the call", async () => {
    const t = convexTest(schema, modules);
    await expect(t.run((ctx) => requireUser(ctx))).rejects.toThrow();
  });

  test("returns the user when the identity matches an existing row", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student" });
    const asUser = t.withIdentity({ subject: "stu-1" });

    const result = await asUser.run((ctx) => requireUser(ctx));
    expect(result.clerkId).toBe("stu-1");
  });
});

describe("frozen accounts (isActive === false)", () => {
  test("requireUser rejects a frozen account", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student", isActive: false });
    const asUser = t.withIdentity({ subject: "stu-1" });

    await expect(asUser.run((ctx) => requireUser(ctx))).rejects.toThrow();
  });

  test("getOptionalSupervisor / getOptionalAdmin return null when frozen", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "sup-1", role: "supervisor", isActive: false });
    await seedUser(t, { clerkId: "adm-1", role: "admin", isActive: false });

    expect(await t.withIdentity({ subject: "sup-1" }).run((ctx) => getOptionalSupervisor(ctx))).toBeNull();
    expect(await t.withIdentity({ subject: "adm-1" }).run((ctx) => getOptionalAdmin(ctx))).toBeNull();
  });

  test("getOptionalUser still returns the frozen doc (so the UI can show a block screen)", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student", isActive: false });

    const result = await t.withIdentity({ subject: "stu-1" }).run((ctx) => getOptionalUser(ctx));
    expect(result?.isActive).toBe(false);
  });
});

describe("requireAdmin", () => {
  test("throws when the caller is signed in but not an admin", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student" });
    const asStudent = t.withIdentity({ subject: "stu-1" });

    await expect(asStudent.run((ctx) => requireAdmin(ctx))).rejects.toThrow();
  });

  test("passes for admins", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "adm-1", role: "admin" });
    const asAdmin = t.withIdentity({ subject: "adm-1" });

    const result = await asAdmin.run((ctx) => requireAdmin(ctx));
    expect(result.role).toBe("admin");
  });

  test("rejects a supervisor (admin-only — not the looser supervisor gate)", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "sup-1", role: "supervisor" });
    const asSupervisor = t.withIdentity({ subject: "sup-1" });

    await expect(asSupervisor.run((ctx) => requireAdmin(ctx))).rejects.toThrow();
  });
});

describe("requireSupervisor", () => {
  test("passes for both supervisors and admins", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "sup-1", role: "supervisor" });
    await seedUser(t, { clerkId: "adm-1", role: "admin" });

    const asSupervisor = t.withIdentity({ subject: "sup-1" });
    const asAdmin = t.withIdentity({ subject: "adm-1" });

    expect((await asSupervisor.run((ctx) => requireSupervisor(ctx))).role).toBe("supervisor");
    expect((await asAdmin.run((ctx) => requireSupervisor(ctx))).role).toBe("admin");
  });

  test("rejects students and sponsors", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student" });
    await seedUser(t, { clerkId: "spo-1", role: "sponsor" });

    await expect(t.withIdentity({ subject: "stu-1" }).run((ctx) => requireSupervisor(ctx))).rejects.toThrow();
    await expect(t.withIdentity({ subject: "spo-1" }).run((ctx) => requireSupervisor(ctx))).rejects.toThrow();
  });
});

describe("requireStudent", () => {
  test("passes only for students", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student" });
    await seedUser(t, { clerkId: "sup-1", role: "supervisor" });

    expect((await t.withIdentity({ subject: "stu-1" }).run((ctx) => requireStudent(ctx))).role).toBe("student");
    await expect(t.withIdentity({ subject: "sup-1" }).run((ctx) => requireStudent(ctx))).rejects.toThrow();
  });
});

describe("getOptionalUser", () => {
  test("returns null without an identity instead of throwing", async () => {
    const t = convexTest(schema, modules);
    const result = await t.run((ctx) => getOptionalUser(ctx));
    expect(result).toBeNull();
  });

  test("returns null if the identity has no user row yet (webhook lag)", async () => {
    const t = convexTest(schema, modules);
    const ghost = t.withIdentity({ subject: "unknown-clerk-id" });
    const result = await ghost.run((ctx) => getOptionalUser(ctx));
    expect(result).toBeNull();
  });
});

describe("getOptionalSupervisor", () => {
  test("returns null for signed-out callers", async () => {
    const t = convexTest(schema, modules);
    expect(await t.run((ctx) => getOptionalSupervisor(ctx))).toBeNull();
  });

  test("returns null for the wrong role rather than throwing", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student" });
    const asStudent = t.withIdentity({ subject: "stu-1" });

    expect(await asStudent.run((ctx) => getOptionalSupervisor(ctx))).toBeNull();
  });

  test("returns the user for supervisors and admins", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "sup-1", role: "supervisor" });
    await seedUser(t, { clerkId: "adm-1", role: "admin" });

    expect((await t.withIdentity({ subject: "sup-1" }).run((ctx) => getOptionalSupervisor(ctx)))?.role).toBe("supervisor");
    expect((await t.withIdentity({ subject: "adm-1" }).run((ctx) => getOptionalSupervisor(ctx)))?.role).toBe("admin");
  });
});

describe("getOptionalAdmin", () => {
  test("returns null for everyone except admins", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, { clerkId: "stu-1", role: "student" });
    await seedUser(t, { clerkId: "sup-1", role: "supervisor" });
    await seedUser(t, { clerkId: "spo-1", role: "sponsor" });
    await seedUser(t, { clerkId: "adm-1", role: "admin" });

    expect(await t.run((ctx) => getOptionalAdmin(ctx))).toBeNull();
    expect(await t.withIdentity({ subject: "stu-1" }).run((ctx) => getOptionalAdmin(ctx))).toBeNull();
    expect(await t.withIdentity({ subject: "sup-1" }).run((ctx) => getOptionalAdmin(ctx))).toBeNull();
    expect(await t.withIdentity({ subject: "spo-1" }).run((ctx) => getOptionalAdmin(ctx))).toBeNull();
    expect((await t.withIdentity({ subject: "adm-1" }).run((ctx) => getOptionalAdmin(ctx)))?.role).toBe("admin");
  });
});
