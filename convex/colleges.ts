import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";

// بيانات الكليات والتخصصات الافتراضية
const SEED_DATA: { college: string; departments: string[] }[] = [
  {
    college: "كلية تكنولوجيا المعلومات",
    departments: [
      "علم الحاسوب",
      "هندسة البرمجيات",
      "نظم المعلومات الحاسوبية",
      "الأمن السيبراني",
      "علم البيانات والذكاء الاصطناعي",
    ],
  },
  {
    college: "كلية الهندسة",
    departments: [
      "الهندسة الكهربائية",
      "الهندسة المدنية",
      "الهندسة الميكانيكية",
      "هندسة الاتصالات",
      "الهندسة المعمارية",
    ],
  },
  {
    college: "كلية العلوم",
    departments: ["الرياضيات", "الفيزياء", "الكيمياء", "العلوم الحياتية"],
  },
  {
    college: "كلية الآداب",
    departments: ["اللغة العربية", "اللغة الإنجليزية", "الترجمة", "العلوم السياسية"],
  },
  {
    college: "كلية الاقتصاد والعلوم الإدارية",
    departments: [
      "المحاسبة",
      "إدارة الأعمال",
      "التسويق",
      "التمويل والمصارف",
      "نظم المعلومات الإدارية",
    ],
  },
  { college: "كلية الحقوق", departments: ["القانون"] },
  { college: "كلية الصيدلة", departments: ["الصيدلة"] },
  { college: "كلية التمريض", departments: ["التمريض"] },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("colleges").collect();
  },
});

export const listWithDepartments = query({
  args: {},
  handler: async (ctx) => {
    const colleges = await ctx.db.query("colleges").collect();
    const result = await Promise.all(
      colleges.map(async (college) => {
        const deps = await ctx.db
          .query("departments")
          .withIndex("by_college", (q) => q.eq("collegeId", college._id))
          .collect();
        return { ...college, departments: deps };
      }),
    );
    return result;
  },
});

export const getDepartmentsByCollege = query({
  args: { collegeId: v.id("colleges") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("departments")
      .withIndex("by_college", (q) => q.eq("collegeId", args.collegeId))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("colleges", {
      name: args.name.trim(),
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("colleges"), name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { name: args.name.trim() });
  },
});

export const remove = mutation({
  args: { id: v.id("colleges") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // حذف التخصصات التابعة أولاً
    const deps = await ctx.db
      .query("departments")
      .withIndex("by_college", (q) => q.eq("collegeId", args.id))
      .collect();
    for (const dep of deps) {
      await ctx.db.delete(dep._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const addDepartment = mutation({
  args: { collegeId: v.id("colleges"), name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("departments", {
      name: args.name.trim(),
      collegeId: args.collegeId,
      createdAt: Date.now(),
    });
  },
});

export const updateDepartment = mutation({
  args: { id: v.id("departments"), name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { name: args.name.trim() });
  },
});

export const removeDepartment = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("colleges").take(1);
    if (existing.length > 0) throw new Error("الكليات موجودة مسبقاً");

    const now = Date.now();
    for (const item of SEED_DATA) {
      const collegeId = await ctx.db.insert("colleges", {
        name: item.college,
        createdAt: now,
      });
      for (const dep of item.departments) {
        await ctx.db.insert("departments", {
          name: dep,
          collegeId,
          createdAt: now,
        });
      }
    }
  },
});
