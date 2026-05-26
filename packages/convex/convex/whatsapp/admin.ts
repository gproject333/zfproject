import { query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "../lib/auth";

const STATUS_VALIDATOR = v.union(
  v.literal("queued"),
  v.literal("sent"),
  v.literal("failed"),
);

function maskPhone(phone: string): string {
  return phone.replace(/^(\+\d{3})\d+(\d{4})$/, "$1***$2");
}

export const listOutbox = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(STATUS_VALIDATOR),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const baseQuery = args.status
      ? ctx.db
          .query("whatsappOutbox")
          .withIndex("by_status_created", (q) => q.eq("status", args.status!))
          .order("desc")
      : ctx.db.query("whatsappOutbox").order("desc");

    const result = await baseQuery.paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (row) => {
        const user = await ctx.db.get(row.userId);
        return {
          _id: row._id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          userName: user?.name ?? "(محذوف)",
          maskedPhone: maskPhone(row.phone),
          kind: row.kind,
          status: row.status,
          attempts: row.attempts,
          errorMessage: row.errorMessage,
        };
      }),
    );

    return { ...result, page };
  },
});
