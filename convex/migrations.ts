import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// One-shot backfill for the `submitted` denormalized field on applications.
// Reads one page (100 rows) per call to stay within transaction limits and
// returns the next cursor. Call repeatedly from the Convex dashboard until
// `isDone === true`:
//   internal.migrations.backfillApplicationSubmitted({ cursor: null })
//   internal.migrations.backfillApplicationSubmitted({ cursor: "<continueCursor>" })
export const backfillApplicationSubmitted = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("applications")
      .paginate({ numItems: 100, cursor: args.cursor });

    let updated = 0;
    for (const app of page.page) {
      const shouldBeSubmitted = app.status !== "draft";
      if (app.submitted !== shouldBeSubmitted) {
        await ctx.db.patch(app._id, { submitted: shouldBeSubmitted });
        updated++;
      }
    }

    return {
      updated,
      isDone: page.isDone,
      continueCursor: page.continueCursor,
    };
  },
});
