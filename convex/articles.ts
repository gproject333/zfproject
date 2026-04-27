import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSupervisor, getOptionalUser } from "./lib/auth";
import type { Doc, Id } from "./_generated/dataModel";

const AUDIENCE = v.union(
  v.literal("student"),
  v.literal("supervisor"),
  v.literal("all"),
);

type Article = Doc<"articles">;

async function enrichArticle(
  ctx: { db: { get: (id: Id<"users">) => Promise<Doc<"users"> | null> }; storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  article: Article,
) {
  const [author, coverUrl] = await Promise.all([
    ctx.db.get(article.createdBy),
    article.coverStorageId
      ? ctx.storage.getUrl(article.coverStorageId)
      : Promise.resolve(null),
  ]);
  return {
    ...article,
    authorName: author?.name ?? "مشرف",
    coverUrl: coverUrl ?? undefined,
  };
}

export const listPublished = query({
  args: {
    audience: v.union(v.literal("student"), v.literal("supervisor")),
  },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];
    const [forAudience, forAll] = await Promise.all([
      ctx.db
        .query("articles")
        .withIndex("by_audience_published", (q) =>
          q.eq("audience", args.audience).eq("isPublished", true),
        )
        .collect(),
      ctx.db
        .query("articles")
        .withIndex("by_audience_published", (q) =>
          q.eq("audience", "all").eq("isPublished", true),
        )
        .collect(),
    ]);
    const sorted = [...forAudience, ...forAll].sort((a, b) => b.updatedAt - a.updatedAt);
    return Promise.all(sorted.map((a) => enrichArticle(ctx, a)));
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user || (user.role !== "supervisor" && user.role !== "admin")) return [];
    const articles = await ctx.db.query("articles").order("desc").collect();
    return Promise.all(articles.map((a) => enrichArticle(ctx, a)));
  },
});

export const getById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx);
    if (!user) return null;
    const article = await ctx.db.get(args.id);
    if (!article) return null;
    if (user.role === "student") {
      if (!article.isPublished) return null;
      if (article.audience !== "student" && article.audience !== "all") return null;
    }
    return await enrichArticle(ctx, article);
  },
});

export const generateArticleCoverUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireSupervisor(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const createArticle = mutation({
  args: {
    title: v.string(),
    summary: v.optional(v.string()),
    body: v.string(),
    coverStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    audience: AUDIENCE,
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const supervisor = await requireSupervisor(ctx);
    const now = Date.now();
    return await ctx.db.insert("articles", {
      ...args,
      createdBy: supervisor._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateArticle = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    body: v.optional(v.string()),
    coverStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    audience: v.optional(AUDIENCE),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    const { id, ...updates } = args;

    if (updates.coverStorageId !== undefined) {
      const existing = await ctx.db.get(id);
      if (existing?.coverStorageId && existing.coverStorageId !== updates.coverStorageId) {
        await ctx.storage.delete(existing.coverStorageId);
      }
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

export const togglePublished = mutation({
  args: { id: v.id("articles"), isPublished: v.boolean() },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    await ctx.db.patch(args.id, { isPublished: args.isPublished, updatedAt: Date.now() });
  },
});

export const deleteArticle = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);
    const article = await ctx.db.get(args.id);
    if (article?.coverStorageId) await ctx.storage.delete(article.coverStorageId);
    await ctx.db.delete(args.id);
  },
});
