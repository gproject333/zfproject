import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSupervisor, getOptionalUser } from "./lib/auth";
import { assertMaxLength } from "./lib/validation";
import { logActivity } from "./lib/activity";

const RESOURCE_TYPE = v.union(
  v.literal("video"),
  v.literal("course"),
  v.literal("link"),
);

const TYPE_LABELS: Record<string, string> = {
  video: "فيديو",
  course: "دورة",
  link: "رابط",
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("entrepreneurialGuide")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    type: RESOURCE_TYPE,
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);
    assertMaxLength("guideTitle", args.title);
    assertMaxLength("guideUrl", args.url);
    const now = Date.now();
    const id = await ctx.db.insert("entrepreneurialGuide", {
      ...args,
      createdBy: supervisor._id,
      createdAt: now,
      updatedAt: now,
    });
    await logActivity(ctx, supervisor, {
      action: `أضاف ${TYPE_LABELS[args.type] ?? args.type} جديداً لدليل الريادة: "${args.title}"`,
      entityType: "guide",
      entityId: id,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("entrepreneurialGuide"),
    title: v.optional(v.string()),
    type: v.optional(RESOURCE_TYPE),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);
    assertMaxLength("guideTitle", args.title);
    assertMaxLength("guideUrl", args.url);
    const { id, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    await ctx.db.patch(id, patch);
    await logActivity(ctx, supervisor, {
      action: `عدّل عنصراً في دليل الريادة`,
      entityType: "guide",
      entityId: id,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("entrepreneurialGuide") },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);
    const item = await ctx.db.get(args.id);
    await ctx.db.delete(args.id);
    await logActivity(ctx, supervisor, {
      action: `حذف "${item?.title ?? ""}" من دليل الريادة`,
      entityType: "guide",
      entityId: args.id,
    });
  },
});
