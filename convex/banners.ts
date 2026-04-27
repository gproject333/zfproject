import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSupervisor, getOptionalUser } from "./lib/auth";
import { notifyAllStudents } from "./lib/notifications";

const VARIANT = v.union(v.literal("info"), v.literal("success"), v.literal("warning"));
const AUDIENCE = v.union(v.literal("student"), v.literal("supervisor"), v.literal("landing"), v.literal("all"));
const BANNER_TYPE = v.union(v.literal("text"), v.literal("scrolling"), v.literal("hero"));
const MEDIA_TYPE = v.union(v.literal("image"), v.literal("video"), v.literal("youtube"));

export const listActive = query({
  args: {
    audience: v.union(v.literal("student"), v.literal("supervisor"), v.literal("landing")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const [forAudience, forAll] = await Promise.all([
      ctx.db
        .query("banners")
        .withIndex("by_audience_active", (q) =>
          q.eq("audience", args.audience).eq("isActive", true),
        )
        .collect(),
      ctx.db
        .query("banners")
        .withIndex("by_audience_active", (q) =>
          q.eq("audience", "all").eq("isActive", true),
        )
        .collect(),
    ]);
    const filtered = [...forAudience, ...forAll]
      .filter((b) => b.bannerType !== "scrolling" && (b.expiresAt === undefined || b.expiresAt > now))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return Promise.all(
      filtered.map(async (b) => ({
        ...b,
        resolvedMediaUrl: b.storageId ? ((await ctx.storage.getUrl(b.storageId)) ?? undefined) : undefined,
      })),
    );
  },
});

export const listActiveScrolling = query({
  args: {
    audience: v.union(v.literal("student"), v.literal("supervisor"), v.literal("landing")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const [forAudience, forAll] = await Promise.all([
      ctx.db
        .query("banners")
        .withIndex("by_audience_active", (q) =>
          q.eq("audience", args.audience).eq("isActive", true),
        )
        .collect(),
      ctx.db
        .query("banners")
        .withIndex("by_audience_active", (q) =>
          q.eq("audience", "all").eq("isActive", true),
        )
        .collect(),
    ]);
    return [...forAudience, ...forAll]
      .filter((b) => b.bannerType === "scrolling" && (b.expiresAt === undefined || b.expiresAt > now))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || (user.role !== "supervisor" && user.role !== "admin")) return [];
    const banners = await ctx.db.query("banners").order("desc").collect();
    return Promise.all(
      banners.map(async (b) => ({
        ...b,
        resolvedMediaUrl: b.storageId ? ((await ctx.storage.getUrl(b.storageId)) ?? undefined) : undefined,
      })),
    );
  },
});

export const generateBannerUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireSupervisor(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const createBanner = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    variant: VARIANT,
    audience: AUDIENCE,
    isActive: v.boolean(),
    linkHref: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bannerType: v.optional(BANNER_TYPE),
    expiresAt: v.optional(v.number()),
    mediaType: v.optional(MEDIA_TYPE),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("banners", {
      ...args,
      createdAt: now,
      updatedAt: now,
      createdBy: supervisor._id,
    });

    if (args.bannerType === "scrolling" && args.isActive && (args.audience === "student" || args.audience === "all")) {
      await notifyAllStudents(ctx, {
        title: "إعلان جديد",
        message: args.message.slice(0, 200),
        type: "announcement",
        excludeUserId: supervisor._id,
      });
    }

    return id;
  },
});

export const updateBanner = mutation({
  args: {
    id: v.id("banners"),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    variant: v.optional(VARIANT),
    audience: v.optional(AUDIENCE),
    isActive: v.optional(v.boolean()),
    linkHref: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bannerType: v.optional(BANNER_TYPE),
    expiresAt: v.optional(v.number()),
    mediaType: v.optional(MEDIA_TYPE),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    const { id, ...updates } = args;

    if (updates.storageId !== undefined) {
      const existing = await ctx.db.get(id);
      if (existing?.storageId && existing.storageId !== updates.storageId) {
        await ctx.storage.delete(existing.storageId);
      }
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("banners"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    await ctx.db.patch(args.id, { isActive: args.isActive, updatedAt: Date.now() });
  },
});

export const deleteBanner = mutation({
  args: { id: v.id("banners") },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    const banner = await ctx.db.get(args.id);
    if (banner?.storageId) await ctx.storage.delete(banner.storageId);
    await ctx.db.delete(args.id);
  },
});
