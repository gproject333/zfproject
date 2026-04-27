import { mutation } from "../_generated/server";
import { requireUser } from "../lib/auth";

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("هذه الوظائف متاحة فقط في بيئة التطوير");
  }
}

export const makeMeSupervisor = mutation({
  args: {},
  handler: async (ctx) => {
    assertNotProduction();
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, { role: "supervisor" });
    return "تم ترقيتك إلى مشرف بنجاح!";
  },
});

export const makeMeStudent = mutation({
  args: {},
  handler: async (ctx) => {
    assertNotProduction();
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, { role: "student" });
    return "تم تغيير دورك إلى طالب بنجاح!";
  },
});

export const makeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    assertNotProduction();
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, { role: "admin" });
    return "تم ترقيتك إلى Admin بنجاح!";
  },
});
