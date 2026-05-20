import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

async function seedSupervisor(t: ReturnType<typeof convexTest>, clerkId = "sup-1") {
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

describe("banners.listActive", () => {
  test("filters out inactive banners", async () => {
    const t = convexTest(schema, modules);
    const sup = await seedSupervisor(t);

    await t.run(async (ctx) => {
      await ctx.db.insert("banners", {
        title: "نشط",
        message: "active",
        variant: "info",
        audience: "student",
        isActive: true,
        bannerType: "text",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: sup,
      });
      await ctx.db.insert("banners", {
        title: "متوقف",
        message: "inactive",
        variant: "info",
        audience: "student",
        isActive: false,
        bannerType: "text",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: sup,
      });
    });

    const result = await t.query(api.banners.listActive, { audience: "student" });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("نشط");
  });

  test("filters out expired banners", async () => {
    const t = convexTest(schema, modules);
    const sup = await seedSupervisor(t);
    const now = Date.now();

    await t.run(async (ctx) => {
      await ctx.db.insert("banners", {
        title: "ساري",
        message: "fresh",
        variant: "info",
        audience: "student",
        isActive: true,
        bannerType: "text",
        expiresAt: now + 60_000,
        createdAt: now,
        updatedAt: now,
        createdBy: sup,
      });
      await ctx.db.insert("banners", {
        title: "منتهي",
        message: "stale",
        variant: "info",
        audience: "student",
        isActive: true,
        bannerType: "text",
        expiresAt: now - 60_000,
        createdAt: now - 120_000,
        updatedAt: now - 120_000,
        createdBy: sup,
      });
    });

    const result = await t.query(api.banners.listActive, { audience: "student" });
    expect(result.map((b) => b.title)).toEqual(["ساري"]);
  });

  test("audience=student also pulls in audience=all banners", async () => {
    const t = convexTest(schema, modules);
    const sup = await seedSupervisor(t);

    await t.run(async (ctx) => {
      await ctx.db.insert("banners", {
        title: "للطلاب",
        message: "students-only",
        variant: "info",
        audience: "student",
        isActive: true,
        bannerType: "text",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: sup,
      });
      await ctx.db.insert("banners", {
        title: "للجميع",
        message: "everyone",
        variant: "info",
        audience: "all",
        isActive: true,
        bannerType: "text",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: sup,
      });
      await ctx.db.insert("banners", {
        title: "للمشرفين",
        message: "supervisors-only",
        variant: "info",
        audience: "supervisor",
        isActive: true,
        bannerType: "text",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: sup,
      });
    });

    const result = await t.query(api.banners.listActive, { audience: "student" });
    const titles = result.map((b) => b.title).sort();
    expect(titles).toEqual(["للجميع", "للطلاب"]);
  });

  test("excludes scrolling banners — those are exposed through listActiveScrolling", async () => {
    const t = convexTest(schema, modules);
    const sup = await seedSupervisor(t);

    await t.run(async (ctx) => {
      await ctx.db.insert("banners", {
        title: "تمرير",
        message: "scrolling",
        variant: "info",
        audience: "student",
        isActive: true,
        bannerType: "scrolling",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: sup,
      });
      await ctx.db.insert("banners", {
        title: "ثابت",
        message: "text",
        variant: "info",
        audience: "student",
        isActive: true,
        bannerType: "text",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: sup,
      });
    });

    const inline = await t.query(api.banners.listActive, { audience: "student" });
    const marquee = await t.query(api.banners.listActiveScrolling, { audience: "student" });

    expect(inline.map((b) => b.title)).toEqual(["ثابت"]);
    expect(marquee.map((b) => b.title)).toEqual(["تمرير"]);
  });
});

describe("banners.createBanner", () => {
  test("requires supervisor — students get rejected", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("users", {
        clerkId: "stu-1",
        email: "s@test.local",
        role: "student",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );

    await expect(
      t.withIdentity({ subject: "stu-1" }).mutation(api.banners.createBanner, {
        title: "x",
        message: "y",
        variant: "info",
        audience: "all",
        isActive: true,
      }),
    ).rejects.toThrow();
  });

  test("supervisors create banners with the right metadata", async () => {
    const t = convexTest(schema, modules);
    await seedSupervisor(t);

    const id = await t.withIdentity({ subject: "sup-1" }).mutation(api.banners.createBanner, {
      title: "إعلان مهم",
      message: "تفاصيل.",
      variant: "warning",
      audience: "student",
      isActive: true,
      bannerType: "text",
    });

    const created = await t.run((ctx) => ctx.db.get(id));
    expect(created?.title).toBe("إعلان مهم");
    expect(created?.variant).toBe("warning");
    expect(created?.isActive).toBe(true);
  });

  test("rejects oversize title (FIELD_LIMITS.bannerTitle=200)", async () => {
    const t = convexTest(schema, modules);
    await seedSupervisor(t);

    await expect(
      t.withIdentity({ subject: "sup-1" }).mutation(api.banners.createBanner, {
        title: "x".repeat(201),
        message: "y",
        variant: "info",
        audience: "all",
        isActive: true,
      }),
    ).rejects.toThrow();
  });
});
