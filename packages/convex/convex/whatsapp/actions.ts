"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * Task-2.4 placeholder: stub action so the scheduler reference in
 * whatsapp.ts type-checks. The real HMAC + n8n fetch logic will be added
 * in Task 2.4. This stub is intentionally empty — it does nothing.
 */
export const sendOtp = internalAction({
  args: {
    outboxId: v.id("whatsappOutbox"),
    code: v.string(),
  },
  handler: async (_ctx, _args) => {
    // TODO(2.4): implement HMAC signing + n8n fetch, update outbox row to sent/failed
  },
});
