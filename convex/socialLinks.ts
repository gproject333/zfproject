import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) throw new Error("الرابط مطلوب");
  if (trimmed.length > 500) throw new Error("الرابط طويل جداً (الحد الأقصى 500 محرف)");
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`;
  throw new Error("الرابط يجب أن يبدأ بـ http:// أو https:// أو mailto: أو tel:");
}

function normalizePlatform(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.length === 0) throw new Error("المنصة مطلوبة");
  if (trimmed.length > 40) throw new Error("اسم المنصة طويل جداً");
  return trimmed;
}

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("socialLinks")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return rows.sort((a, b) => a.order !== b.order ? a.order - b.order : b.updatedAt - a.updatedAt);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("socialLinks").collect();
    return rows.sort((a, b) => a.order !== b.order ? a.order - b.order : b.updatedAt - a.updatedAt);
  },
});

export const createLink = mutation({
  args: {
    platform: v.string(),
    url: v.string(),
    label: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const platform = normalizePlatform(args.platform);
    const url = normalizeUrl(args.url);
    const label = args.label?.trim() || undefined;
    if (label && label.length > 60) throw new Error("التسمية طويلة جداً");
    const now = Date.now();
    return await ctx.db.insert("socialLinks", {
      platform,
      url,
      label,
      isActive: args.isActive ?? true,
      order: args.order ?? 0,
      updatedAt: now,
      updatedBy: admin._id,
    });
  },
});

export const updateLink = mutation({
  args: {
    id: v.id("socialLinks"),
    platform: v.optional(v.string()),
    url: v.optional(v.string()),
    label: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("الرابط غير موجود");

    const patch: Record<string, unknown> = { updatedAt: Date.now(), updatedBy: admin._id };
    if (args.platform !== undefined) patch.platform = normalizePlatform(args.platform);
    if (args.url !== undefined) patch.url = normalizeUrl(args.url);
    if (args.label !== undefined) {
      const trimmed = args.label.trim();
      if (trimmed.length > 60) throw new Error("التسمية طويلة جداً");
      patch.label = trimmed.length > 0 ? trimmed : undefined;
    }
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.order !== undefined) patch.order = args.order;

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteLink = mutation({
  args: { id: v.id("socialLinks") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) return;
    await ctx.db.delete(args.id);
  },
});

export const setActive = mutation({
  args: { id: v.id("socialLinks"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("الرابط غير موجود");
    await ctx.db.patch(args.id, { isActive: args.isActive, updatedAt: Date.now(), updatedBy: admin._id });
  },
});
