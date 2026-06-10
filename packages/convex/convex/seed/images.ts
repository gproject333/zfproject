import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";

/**
 * Attaches cover images to the demo articles created by seed/content.ts.
 *
 * Convex stores covers as a file in `_storage` (articles.coverStorageId);
 * the app resolves them via ctx.storage.getUrl(). So we fetch a real photo,
 * store the blob, and patch the article. Images come from Lorem Picsum
 * (deterministic per seed, always a valid JPEG) so a production run can't
 * fail on a dead external URL.
 *
 * Run:  npx convex run seed/images:attachCovers --env-file .env.selfhosted
 * Idempotent — only touches the known demo articles that lack a cover.
 */

const SEED_TITLES = [
  "كيف تحوّل فكرتك إلى مشروع ريادي قابل للتنفيذ",
  "كتابة دراسة الجدوى: دليل عملي للطلبة",
  "بناء نموذج العمل التجاري Business Model Canvas",
  "أساسيات التمويل والاستثمار للمشاريع الناشئة",
  "حماية الملكية الفكرية لمشروعك",
  "دليل المشرف: معايير تقييم مشاريع الحاضنة",
  "من الجامعة إلى السوق: قصص نجاح ملهمة",
];

export const pendingCovers = internalQuery({
  args: {},
  handler: async (ctx): Promise<{ id: Id<"articles">; title: string }[]> => {
    const all = await ctx.db.query("articles").withIndex("by_createdAt").take(300);
    return all
      .filter((a) => SEED_TITLES.includes(a.title) && !a.coverStorageId)
      .map((a) => ({ id: a._id, title: a.title }));
  },
});

export const setCover = internalMutation({
  args: { articleId: v.id("articles"), storageId: v.id("_storage") },
  handler: async (ctx, { articleId, storageId }) => {
    await ctx.db.patch(articleId, { coverStorageId: storageId, updatedAt: Date.now() });
  },
});

export const attachCovers = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ pending: number; attached: number; failed: string[] }> => {
    const arts = await ctx.runQuery(internal.seed.images.pendingCovers, {});
    let attached = 0;
    const failed: string[] = [];
    for (let i = 0; i < arts.length; i++) {
      const art = arts[i];
      const url = `https://picsum.photos/seed/zuj-article-${i + 1}/1200/630`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          failed.push(`${art.title} (HTTP ${res.status})`);
          continue;
        }
        const blob = await res.blob();
        const storageId = await ctx.storage.store(blob);
        await ctx.runMutation(internal.seed.images.setCover, {
          articleId: art.id,
          storageId,
        });
        attached++;
      } catch (e) {
        failed.push(`${art.title} (${String(e)})`);
      }
    }
    return { pending: arts.length, attached, failed };
  },
});
