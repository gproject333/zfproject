"use node";

import { internalAction, type ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { createHmac } from "node:crypto";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

async function postToN8n(path: string, payload: unknown): Promise<void> {
  const baseUrl = requireEnv("N8N_BASE_URL").replace(/\/$/, "");
  const secret = requireEnv("N8N_WEBHOOK_SECRET");
  const body = JSON.stringify(payload);
  const signature = sign(body, secret);

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": signature,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`n8n returned ${res.status}: ${text.slice(0, 500)}`);
  }
}

async function patchSuccess(
  ctx: ActionCtx,
  outboxId: Id<"whatsappOutbox">,
): Promise<void> {
  await ctx.runMutation(internal.whatsapp.internal._patchOutbox, {
    id: outboxId,
    status: "sent",
  });
}

async function patchFailure(
  ctx: ActionCtx,
  outboxId: Id<"whatsappOutbox">,
  err: unknown,
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  await ctx.runMutation(internal.whatsapp.internal._patchOutbox, {
    id: outboxId,
    status: "failed",
    errorMessage: message,
  });
}

export const sendOtp = internalAction({
  args: {
    outboxId: v.id("whatsappOutbox"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const outbox = await ctx.runQuery(internal.whatsapp.internal._getOutbox, {
      id: args.outboxId,
    });
    if (!outbox) return;

    try {
      await postToN8n("/webhook/wa-otp", {
        phone: outbox.phone,
        code: args.code,
        expiresInMinutes: 10,
      });
      await patchSuccess(ctx, args.outboxId);
    } catch (err) {
      await patchFailure(ctx, args.outboxId, err);
    }
  },
});

async function deliverFromOutbox(
  ctx: ActionCtx,
  outboxId: Id<"whatsappOutbox">,
  webhookPath: string,
): Promise<void> {
  const outbox = await ctx.runQuery(internal.whatsapp.internal._getOutbox, {
    id: outboxId,
  });
  if (!outbox) return;

  try {
    await postToN8n(webhookPath, {
      phone: outbox.phone,
      data: outbox.payload,
    });
    await patchSuccess(ctx, outboxId);
  } catch (err) {
    await patchFailure(ctx, outboxId, err);
  }
}

export const sendMeeting = internalAction({
  args: { outboxId: v.id("whatsappOutbox") },
  handler: async (ctx, args) => {
    await deliverFromOutbox(ctx, args.outboxId, "/webhook/wa-meeting");
  },
});

export const sendStatusChange = internalAction({
  args: { outboxId: v.id("whatsappOutbox") },
  handler: async (ctx, args) => {
    await deliverFromOutbox(ctx, args.outboxId, "/webhook/wa-status");
  },
});
