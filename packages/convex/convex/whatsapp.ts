import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";
import { generateOtpCode, hashOtpCode, normalizePhone } from "./whatsapp/helpers";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

/**
 * Start the OTP flow: generate a 6-digit code, hash and store it,
 * queue a WhatsApp send via n8n. The plaintext code is never persisted
 * to the DB — it lives only in the scheduler argument until the action
 * runs.
 *
 * Rate-limited to one request per user per 60 seconds.
 */
export const requestWhatsappOtp = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const phone = normalizePhone(args.phone);

    const recent = await ctx.db
      .query("whatsappVerifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(1);
    if (recent.length > 0 && Date.now() - recent[0].createdAt < RESEND_COOLDOWN_MS) {
      throw new Error("انتظر دقيقة قبل طلب رمز جديد");
    }

    const active = await ctx.db
      .query("whatsappVerifications")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("consumed", false),
      )
      .collect();
    for (const row of active) {
      await ctx.db.patch(row._id, { consumed: true });
    }

    const code = generateOtpCode();
    const codeHash = await hashOtpCode(code);
    const now = Date.now();

    await ctx.db.insert("whatsappVerifications", {
      userId: user._id,
      phone,
      codeHash,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      consumed: false,
      createdAt: now,
    });

    const outboxId = await ctx.db.insert("whatsappOutbox", {
      userId: user._id,
      phone,
      kind: "otp",
      payload: { phone },
      status: "queued",
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.whatsapp.actions.sendOtp, {
      outboxId,
      code,
    });

    return { ok: true };
  },
});

export const verifyWhatsappOtp = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const active = await ctx.db
      .query("whatsappVerifications")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("consumed", false),
      )
      .order("desc")
      .take(1);

    if (active.length === 0) {
      throw new Error("لا يوجد رمز نشط، اطلب رمز جديد");
    }
    const verif = active[0];

    if (verif.expiresAt < Date.now()) {
      await ctx.db.patch(verif._id, { consumed: true });
      throw new Error("الرمز منتهي، اطلب رمز جديد");
    }
    if (verif.attempts >= MAX_ATTEMPTS) {
      await ctx.db.patch(verif._id, { consumed: true });
      throw new Error("تم تجاوز عدد المحاولات، اطلب رمز جديد");
    }

    const submittedHash = await hashOtpCode(args.code);
    if (submittedHash !== verif.codeHash) {
      // Convex mutations are transactional: throwing would roll back the
      // attempts patch. Return a structured failure so the increment
      // commits and the UI can surface the message.
      const attempts = verif.attempts + 1;
      await ctx.db.patch(verif._id, { attempts });
      const remaining = MAX_ATTEMPTS - attempts;
      return {
        ok: false as const,
        error:
          remaining > 0
            ? `رمز غير صحيح، تبقى ${remaining} محاولات`
            : "تم تجاوز عدد المحاولات، اطلب رمز جديد",
        attemptsLeft: Math.max(0, remaining),
      };
    }

    const now = Date.now();
    await ctx.db.patch(verif._id, { consumed: true });
    await ctx.db.patch(user._id, {
      phone: verif.phone,
      whatsappVerified: true,
      phoneVerificationTime: now,
      updatedAt: now,
    });

    return { ok: true as const };
  },
});
