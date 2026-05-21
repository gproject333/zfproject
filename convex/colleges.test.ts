import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

test("colleges.list returns empty array when no colleges exist", async () => {
  const t = convexTest(schema, modules);
  const result = await t.query(api.colleges.list);
  expect(result).toEqual([]);
});

test("colleges.list returns inserted colleges", async () => {
  const t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    await ctx.db.insert("colleges", {
      name: "كلية الهندسة",
      createdAt: Date.now(),
    });
  });
  const result = await t.query(api.colleges.list);
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("كلية الهندسة");
});
