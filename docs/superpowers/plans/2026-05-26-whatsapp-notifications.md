# WhatsApp Notifications for Students — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let verified students receive WhatsApp messages for meeting scheduling and application status changes, via Convex → n8n → Evolution API.

**Architecture:** Mutations write to a durable `whatsappOutbox`, then `ctx.scheduler.runAfter` dispatches a Node action that POSTs (HMAC-signed) to n8n. n8n owns message copy and calls Evolution. WhatsApp failures never roll back the originating mutation; in-app bell notifications always succeed.

**Tech Stack:** Convex (mutations + Node actions + scheduler + crons), Next.js 16 App Router (student profile UI + admin log), Vitest + convex-test (unit tests), n8n (webhook workflows), Evolution API v2 (WhatsApp transport).

**Spec:** `docs/superpowers/specs/2026-05-26-whatsapp-notifications-design.md`

---

## Phase 1 — Schema + Helpers

Foundation phase. No user-visible behavior change. Pure additive schema + pure functions with tests.

### Task 1.1: Add schema for verifications + outbox + user flags

**Files:**
- Modify: `packages/convex/convex/schema.ts`

- [ ] **Step 1: Add new user fields**

Open `packages/convex/convex/schema.ts`. In the `users` table definition, locate the `isAnonymous` line (around line 56) and add the two new fields just above it:

```ts
    // WhatsApp notification preferences (set only after OTP verification)
    whatsappVerified: v.optional(v.boolean()),
    whatsappOptOut: v.optional(v.boolean()),

    isAnonymous: v.optional(v.boolean()),
```

- [ ] **Step 2: Add `whatsappVerifications` table**

In the same file, after the `users` table definition (after its `.index("by_studentId", ["studentId"])` line), add:

```ts
  // ============================================
  // WhatsApp OTP verifications
  // ============================================
  // Pending OTPs for phone-number verification. Codes are stored as
  // SHA-256 hashes; the plaintext code lives only in the scheduler
  // argument that triggers the n8n send action. Rows stay around after
  // `consumed=true` so we can audit "when did this user verify?". An
  // expiry cleanup cron drops old consumed rows.
  whatsappVerifications: defineTable({
    userId: v.id("users"),
    phone: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    consumed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "consumed"]),
```

- [ ] **Step 3: Add `whatsappOutbox` table**

Immediately after the `whatsappVerifications` table, add:

```ts
  // ============================================
  // WhatsApp send log (durable outbox)
  // ============================================
  // One row per send attempt. The mutation creates a `queued` row and
  // schedules the matching action; the action patches it to `sent` or
  // `failed`. Admin log page reads this table.
  whatsappOutbox: defineTable({
    userId: v.id("users"),
    phone: v.string(),
    kind: v.union(
      v.literal("otp"),
      v.literal("meeting"),
      v.literal("status_change"),
    ),
    payload: v.any(),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
    n8nRequestId: v.optional(v.string()),
    attempts: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status_created", ["status", "createdAt"]),
```

- [ ] **Step 4: Verify codegen + typecheck**

Run from repo root:
```bash
pnpm --filter @smart-zuj/convex dev --once 2>&1 | tail -20
```
Expected: no errors. `_generated/dataModel.d.ts` now contains `whatsappVerifications` and `whatsappOutbox`.

Then:
```bash
pnpm --filter @smart-zuj/convex exec tsc --noEmit
```
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/schema.ts packages/convex/convex/_generated
git commit -m "feat(convex): add whatsapp verification and outbox tables"
```

---

### Task 1.2: Phone normalization helper

**Files:**
- Create: `packages/convex/convex/whatsapp/helpers.ts`
- Create: `packages/convex/convex/whatsapp/helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/convex/convex/whatsapp/helpers.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { normalizePhone } from "./helpers";

describe("normalizePhone", () => {
  test("accepts E.164 format", () => {
    expect(normalizePhone("+962795551234")).toBe("+962795551234");
  });

  test("converts 00 prefix to +", () => {
    expect(normalizePhone("00962795551234")).toBe("+962795551234");
  });

  test("converts Jordanian local format (079...) to E.164", () => {
    expect(normalizePhone("0795551234")).toBe("+962795551234");
  });

  test("strips whitespace, dashes, parentheses", () => {
    expect(normalizePhone("+962 (79) 555-1234")).toBe("+962795551234");
  });

  test("rejects empty string", () => {
    expect(() => normalizePhone("")).toThrow();
  });

  test("rejects letters", () => {
    expect(() => normalizePhone("+96279ABCD234")).toThrow();
  });

  test("rejects too short", () => {
    expect(() => normalizePhone("+12345")).toThrow();
  });

  test("rejects too long", () => {
    expect(() => normalizePhone("+1234567890123456789")).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @smart-zuj/convex test helpers.test.ts
```
Expected: FAIL — "Cannot find module './helpers'".

- [ ] **Step 3: Implement `normalizePhone`**

Create `packages/convex/convex/whatsapp/helpers.ts`:

```ts
const JORDAN_COUNTRY_CODE = "962";

/**
 * Normalize a user-entered phone to E.164 (e.g. "+962795551234").
 * Handles:
 *   - Already-E.164:           "+962795551234"
 *   - International "00" prefix: "00962795551234"
 *   - Jordanian local (default): "0795551234" -> "+962795551234"
 *   - Stray whitespace/dashes/parens
 *
 * Throws on any input that can't be coerced to a plausible E.164.
 */
export function normalizePhone(raw: string): string {
  if (!raw || typeof raw !== "string") {
    throw new Error("رقم الهاتف مطلوب");
  }

  // Strip everything except digits and a leading "+"
  const stripped = raw.replace(/[^\d+]/g, "");
  if (stripped === "" || /[A-Za-z]/.test(raw)) {
    throw new Error("رقم الهاتف غير صالح");
  }

  let digits: string;
  if (stripped.startsWith("+")) {
    digits = stripped.slice(1);
  } else if (stripped.startsWith("00")) {
    digits = stripped.slice(2);
  } else if (stripped.startsWith("0")) {
    // Treat as Jordanian local number
    digits = JORDAN_COUNTRY_CODE + stripped.slice(1);
  } else {
    digits = stripped;
  }

  if (!/^\d+$/.test(digits)) {
    throw new Error("رقم الهاتف غير صالح");
  }
  if (digits.length < 8 || digits.length > 15) {
    throw new Error("طول رقم الهاتف غير صالح");
  }

  return "+" + digits;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @smart-zuj/convex test helpers.test.ts
```
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/whatsapp
git commit -m "feat(convex): add phone normalization helper"
```

---

### Task 1.3: OTP code generation + hashing

**Files:**
- Modify: `packages/convex/convex/whatsapp/helpers.ts`
- Modify: `packages/convex/convex/whatsapp/helpers.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `helpers.test.ts`:

```ts
import { generateOtpCode, hashOtpCode } from "./helpers";

describe("generateOtpCode", () => {
  test("returns 6-digit numeric string", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      const n = Number(code);
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });

  test("produces varied output (not the same code twice in a row)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) seen.add(generateOtpCode());
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("hashOtpCode", () => {
  test("is deterministic", async () => {
    expect(await hashOtpCode("123456")).toBe(await hashOtpCode("123456"));
  });

  test("differs for different inputs", async () => {
    expect(await hashOtpCode("123456")).not.toBe(await hashOtpCode("123457"));
  });

  test("returns 64-character hex string", async () => {
    expect(await hashOtpCode("123456")).toMatch(/^[0-9a-f]{64}$/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @smart-zuj/convex test helpers.test.ts
```
Expected: FAIL — "generateOtpCode is not exported" or similar.

- [ ] **Step 3: Implement code + hash helpers**

Append to `packages/convex/convex/whatsapp/helpers.ts`:

```ts
/**
 * Generate a 6-digit OTP. Uses the Web Crypto API (available in the
 * Convex V8 runtime). Returns a zero-padded string so leading zeros
 * are preserved.
 */
export function generateOtpCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // Map [0, 2^32) -> [0, 1_000_000)
  const n = buf[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

/**
 * SHA-256 the OTP code so we never store plaintext in the DB.
 * Returns a lowercase hex string.
 */
export async function hashOtpCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @smart-zuj/convex test helpers.test.ts
```
Expected: PASS, all 13 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/whatsapp
git commit -m "feat(convex): add OTP generation and hashing"
```

---

## Phase 2 — OTP flow end-to-end

Student can enter a phone number, receive a WhatsApp OTP, and verify it. Phase 2 ships when the e2e manual test passes.

### Task 2.1: Configure environment variables

**Files:**
- Modify (no commit): Convex deployment env vars (via `npx convex env set`)
- Modify (no commit): n8n env vars (via n8n UI)

- [ ] **Step 1: Generate a shared HMAC secret**

```bash
openssl rand -hex 32
```
Copy the output. This becomes `N8N_WEBHOOK_SECRET` on both sides.

- [ ] **Step 2: Set Convex env vars (dev deployment)**

```bash
cd packages/convex
npx convex env set N8N_BASE_URL https://n8n.yazeid.site
npx convex env set N8N_WEBHOOK_SECRET <secret-from-step-1>
cd ../..
```

- [ ] **Step 3: Set Convex env vars (prod deployment)**

```bash
cd packages/convex
npx convex env set N8N_BASE_URL https://n8n.yazeid.site --prod
npx convex env set N8N_WEBHOOK_SECRET <secret-from-step-1> --prod
cd ../..
```

- [ ] **Step 4: Set n8n env vars**

In the n8n UI (`Settings → Variables` if your version supports it, else container env), add:
```
N8N_WEBHOOK_SECRET=<same-as-step-1>
EVOLUTION_BASE_URL=https://evolution.yazeid.site
EVOLUTION_API_KEY=<from Evolution manager>
EVOLUTION_INSTANCE_NAME=<your connected instance name>
```

Restart n8n container after setting them.

- [ ] **Step 5: Verify**

```bash
cd packages/convex
npx convex env list
```
Expected: shows `N8N_BASE_URL` and `N8N_WEBHOOK_SECRET`. **No commit** — these are deployment-side, not source.

---

### Task 2.2: `requestWhatsappOtp` mutation + tests

**Files:**
- Create: `packages/convex/convex/whatsapp.ts`
- Create: `packages/convex/convex/whatsapp.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/convex/convex/whatsapp.test.ts`:

```ts
import { convexTest } from "convex-test";
import { describe, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

async function seedStudent(t: ReturnType<typeof convexTest>, clerkId = "stu-1") {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      email: `${clerkId}@zuj.edu.jo`,
      name: clerkId,
      role: "student",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

describe("whatsapp.requestWhatsappOtp", () => {
  test("rejects invalid phone format", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await expect(
      asStudent.mutation(api.whatsapp.requestWhatsappOtp, { phone: "not-a-phone" }),
    ).rejects.toThrow();
  });

  test("creates verification row and queues outbox on success", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    await asStudent.mutation(api.whatsapp.requestWhatsappOtp, {
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const verifs = await ctx.db.query("whatsappVerifications").collect();
      expect(verifs).toHaveLength(1);
      expect(verifs[0].userId).toBe(studentId);
      expect(verifs[0].phone).toBe("+962795551234");
      expect(verifs[0].consumed).toBe(false);
      expect(verifs[0].attempts).toBe(0);
      expect(verifs[0].codeHash).toMatch(/^[0-9a-f]{64}$/);

      const outbox = await ctx.db.query("whatsappOutbox").collect();
      expect(outbox).toHaveLength(1);
      expect(outbox[0].kind).toBe("otp");
      expect(outbox[0].status).toBe("queued");
    });
  });

  test("rejects when last request was < 60s ago", async () => {
    const t = convexTest(schema, modules);
    await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    await asStudent.mutation(api.whatsapp.requestWhatsappOtp, {
      phone: "+962795551234",
    });

    await expect(
      asStudent.mutation(api.whatsapp.requestWhatsappOtp, { phone: "+962795551234" }),
    ).rejects.toThrow(/انتظر/);
  });

  test("consumes previous active OTP before creating a new one", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    // Seed an old non-consumed verification (>60s old) so rate-limit lets us through
    await t.run(async (ctx) => {
      await ctx.db.insert("whatsappVerifications", {
        userId: studentId,
        phone: "+962795550000",
        codeHash: "old".padStart(64, "0"),
        expiresAt: Date.now() + 600_000,
        attempts: 0,
        consumed: false,
        createdAt: Date.now() - 120_000,
      });
    });

    await asStudent.mutation(api.whatsapp.requestWhatsappOtp, {
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const active = await ctx.db
        .query("whatsappVerifications")
        .withIndex("by_user_active", (q) => q.eq("userId", studentId).eq("consumed", false))
        .collect();
      expect(active).toHaveLength(1);
      expect(active[0].phone).toBe("+962795551234");
    });
  });

  test("rejects unauthenticated caller", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.whatsapp.requestWhatsappOtp, { phone: "+962795551234" }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @smart-zuj/convex test whatsapp.test.ts
```
Expected: FAIL — `api.whatsapp.requestWhatsappOtp` doesn't exist.

- [ ] **Step 3: Implement `requestWhatsappOtp`**

Create `packages/convex/convex/whatsapp.ts`:

```ts
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";
import { generateOtpCode, hashOtpCode, normalizePhone } from "./whatsapp/helpers";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

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

    // Validate + normalize phone (throws on bad input)
    const phone = normalizePhone(args.phone);

    // Rate limit: reject if a request was made in the last 60s
    const recent = await ctx.db
      .query("whatsappVerifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(1);
    if (recent.length > 0 && Date.now() - recent[0].createdAt < RESEND_COOLDOWN_MS) {
      throw new Error("انتظر دقيقة قبل طلب رمز جديد");
    }

    // Mark any active (unconsumed) verification as consumed so old codes
    // can't be used after a re-request.
    const active = await ctx.db
      .query("whatsappVerifications")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("consumed", false),
      )
      .collect();
    for (const row of active) {
      await ctx.db.patch(row._id, { consumed: true });
    }

    // Generate + hash code
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

    // Schedule the n8n call. The plaintext code travels here and never
    // touches DB beyond the hash.
    await ctx.scheduler.runAfter(0, internal.whatsapp.actions.sendOtp, {
      outboxId,
      code,
    });

    return { ok: true };
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @smart-zuj/convex test whatsapp.test.ts
```
Expected: PASS, 5 tests.

(Note: the scheduler will try to run an action that doesn't exist yet. `convex-test` doesn't actually execute scheduled functions, so this is fine.)

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/whatsapp.ts packages/convex/convex/whatsapp.test.ts
git commit -m "feat(convex): add requestWhatsappOtp mutation"
```

---

### Task 2.3: `verifyWhatsappOtp` mutation + tests

**Files:**
- Modify: `packages/convex/convex/whatsapp.ts`
- Modify: `packages/convex/convex/whatsapp.test.ts`

- [ ] **Step 1: Append failing tests**

Append to `packages/convex/convex/whatsapp.test.ts`:

```ts
import { hashOtpCode } from "./whatsapp/helpers";

describe("whatsapp.verifyWhatsappOtp", () => {
  async function seedActiveOtp(
    t: ReturnType<typeof convexTest>,
    studentId: string,
    code: string,
    overrides: { expiresAt?: number; attempts?: number; consumed?: boolean } = {},
  ) {
    const codeHash = await hashOtpCode(code);
    return await t.run(async (ctx) =>
      ctx.db.insert("whatsappVerifications", {
        userId: studentId as any,
        phone: "+962795551234",
        codeHash,
        expiresAt: overrides.expiresAt ?? Date.now() + 600_000,
        attempts: overrides.attempts ?? 0,
        consumed: overrides.consumed ?? false,
        createdAt: Date.now(),
      }),
    );
  }

  test("accepts correct code and marks user verified", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456");

    await asStudent.mutation(api.whatsapp.verifyWhatsappOtp, { code: "123456" });

    await t.run(async (ctx) => {
      const user = await ctx.db.get(studentId);
      expect(user?.whatsappVerified).toBe(true);
      expect(user?.phone).toBe("+962795551234");
      expect(user?.phoneVerificationTime).toBeGreaterThan(0);

      const verif = (await ctx.db.query("whatsappVerifications").collect())[0];
      expect(verif.consumed).toBe(true);
    });
  });

  test("rejects wrong code and increments attempts", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456");

    await expect(
      asStudent.mutation(api.whatsapp.verifyWhatsappOtp, { code: "999999" }),
    ).rejects.toThrow();

    await t.run(async (ctx) => {
      const verif = (await ctx.db.query("whatsappVerifications").collect())[0];
      expect(verif.attempts).toBe(1);
      expect(verif.consumed).toBe(false);
    });
  });

  test("rejects after 5 attempts", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456", { attempts: 5 });

    await expect(
      asStudent.mutation(api.whatsapp.verifyWhatsappOtp, { code: "123456" }),
    ).rejects.toThrow();
  });

  test("rejects expired code", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456", { expiresAt: Date.now() - 1 });

    await expect(
      asStudent.mutation(api.whatsapp.verifyWhatsappOtp, { code: "123456" }),
    ).rejects.toThrow(/منتهي/);
  });

  test("rejects already-consumed code", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });
    await seedActiveOtp(t, studentId, "123456", { consumed: true });

    await expect(
      asStudent.mutation(api.whatsapp.verifyWhatsappOtp, { code: "123456" }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @smart-zuj/convex test whatsapp.test.ts -t verifyWhatsappOtp
```
Expected: FAIL — `verifyWhatsappOtp` does not exist.

- [ ] **Step 3: Implement `verifyWhatsappOtp`**

Append to `packages/convex/convex/whatsapp.ts`:

```ts
const MAX_ATTEMPTS = 5;

/**
 * Verify a previously-requested OTP. On success, write the phone to
 * `users.phone`, set `whatsappVerified=true`, and stamp
 * `phoneVerificationTime`. The verification row is marked consumed so
 * it can't be re-used.
 */
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
      const attempts = verif.attempts + 1;
      await ctx.db.patch(verif._id, { attempts });
      const remaining = MAX_ATTEMPTS - attempts;
      throw new Error(
        remaining > 0
          ? `رمز غير صحيح، تبقى ${remaining} محاولات`
          : "تم تجاوز عدد المحاولات، اطلب رمز جديد",
      );
    }

    // Success
    const now = Date.now();
    await ctx.db.patch(verif._id, { consumed: true });
    await ctx.db.patch(user._id, {
      phone: verif.phone,
      whatsappVerified: true,
      phoneVerificationTime: now,
      updatedAt: now,
    });

    return { ok: true };
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @smart-zuj/convex test whatsapp.test.ts
```
Expected: PASS, 10 tests total in this file.

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/whatsapp.ts packages/convex/convex/whatsapp.test.ts
git commit -m "feat(convex): add verifyWhatsappOtp mutation"
```

---

### Task 2.4: `sendOtp` action with HMAC

**Files:**
- Create: `packages/convex/convex/whatsapp/internal.ts` (V8 runtime DB helpers)
- Create: `packages/convex/convex/whatsapp/actions.ts` (Node runtime, fetch + HMAC)

Convex actions can't call `ctx.db` directly and Node-runtime files can't be imported from V8-runtime ones, so the DB helpers live in a separate V8 file and the action calls them via `ctx.runQuery` / `ctx.runMutation`.

- [ ] **Step 1: Create the V8 internal helpers**

Create `packages/convex/convex/whatsapp/internal.ts`:

```ts
import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const _getOutbox = internalQuery({
  args: { id: v.id("whatsappOutbox") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const _patchOutbox = internalMutation({
  args: {
    id: v.id("whatsappOutbox"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.get(args.id);
    if (!existing) return;
    await ctx.db.patch(args.id, {
      status: args.status,
      errorMessage: args.errorMessage,
      attempts: existing.attempts + 1,
      updatedAt: now,
    });
  },
});
```

- [ ] **Step 2: Run convex dev once so codegen picks up the new file**

```bash
pnpm --filter @smart-zuj/convex dev --once 2>&1 | tail -10
```
Expected: clean. `_generated/api.d.ts` now references `whatsapp.internal._getOutbox` and `whatsapp.internal._patchOutbox`.

- [ ] **Step 3: Create the Node action file**

Create `packages/convex/convex/whatsapp/actions.ts`:

```ts
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

/**
 * Deliver an OTP via the n8n `wa-otp` workflow. Patches the outbox
 * row to `sent` or `failed`. Never throws out of the function — a
 * thrown error would crash the scheduler invocation and we'd lose
 * the outbox status update.
 */
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
```

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter @smart-zuj/convex exec tsc --noEmit
```
Expected: exits 0. If you see "internal.whatsapp.internal is not assignable", run `pnpm --filter @smart-zuj/convex dev --once` to refresh codegen first.

- [ ] **Step 5: Run all tests**

```bash
pnpm --filter @smart-zuj/convex test
```
Expected: all tests pass (10 from `whatsapp.test.ts` + 13 from `whatsapp/helpers.test.ts`).

- [ ] **Step 6: Commit**

```bash
git add packages/convex/convex/whatsapp packages/convex/convex/_generated
git commit -m "feat(convex): add sendOtp action with HMAC-signed n8n call"
```

---

### Task 2.5: n8n workflow `wa-otp`

**Files:**
- Create: `docs/n8n/wa-otp.json` (exported workflow, for version control)
- n8n UI changes (no source commit beyond the JSON)

- [ ] **Step 1: Build the workflow in n8n UI**

Open your n8n instance. Create a new workflow named `wa-otp`. Add nodes in this order:

1. **Webhook** node
   - HTTP Method: POST
   - Path: `wa-otp`
   - Response Mode: "Respond immediately" (with code 200)

2. **Function** node (name it "Verify HMAC")
   - Code:
     ```js
     const crypto = require('crypto');
     const sig = $input.first().json.headers?.['x-signature']
       ?? $input.first().json['x-signature'];
     const rawBody = $input.first().json.body
       ?? JSON.stringify($input.first().json);
     const secret = $env.N8N_WEBHOOK_SECRET;
     const expected = crypto
       .createHmac('sha256', secret)
       .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
       .digest('hex');
     if (sig !== expected) {
       throw new Error('invalid signature');
     }
     const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
     return [{ json: body }];
     ```
   - **Note:** the Webhook node's "Raw Body" must be enabled in node options so the HMAC is computed over the exact bytes Convex signed. If your n8n version exposes raw body under a different field (`$input.first().binary.data` etc.), adapt the function accordingly.

3. **Set** node (name it "Build message")
   - Add field `to` of type Expression: `={{ $json.phone.startsWith('+') ? $json.phone.slice(1) : $json.phone }}@s.whatsapp.net`
   - Add field `text` of type Expression: `=رمز التحقق: {{ $json.code }}\nصالح لمدة {{ $json.expiresInMinutes }} دقائق.`

4. **HTTP Request** node (name it "Send via Evolution")
   - Method: POST
   - URL: `={{$env.EVOLUTION_BASE_URL}}/message/sendText/{{$env.EVOLUTION_INSTANCE_NAME}}`
   - Authentication: Header → `apikey: {{$env.EVOLUTION_API_KEY}}`
   - Body (JSON):
     ```json
     {
       "number": "{{ $json.to }}",
       "text": "{{ $json.text }}"
     }
     ```

5. Activate the workflow.

- [ ] **Step 2: Export the workflow JSON**

In n8n UI: workflow menu → "Download" → save the JSON.

- [ ] **Step 3: Commit the JSON for version control**

```bash
mkdir -p docs/n8n
mv ~/Downloads/wa-otp.json docs/n8n/wa-otp.json
git add docs/n8n/wa-otp.json
git commit -m "docs(n8n): version-control wa-otp workflow export"
```

---

### Task 2.6: Student profile UI — link WhatsApp

**Files:**
- Create: `packages/web/src/features/student/components/WhatsappLink.tsx`
- Modify: `packages/web/src/app/student/profile/page.tsx`

- [ ] **Step 1: Inspect the existing profile page**

```bash
sed -n '1,80p' packages/web/src/app/student/profile/page.tsx
```
Note the existing layout, what `useMutation`/`useQuery` patterns it uses, and whether it already has a "phone" section that needs replacing or augmenting.

- [ ] **Step 2: Create the `WhatsappLink` component**

Create `packages/web/src/features/student/components/WhatsappLink.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@smart-zuj/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Step = "enter-phone" | "enter-code" | "verified";

export function WhatsappLink() {
  const me = useQuery(api.users.me);
  const requestOtp = useMutation(api.whatsapp.requestWhatsappOtp);
  const verifyOtp = useMutation(api.whatsapp.verifyWhatsappOtp);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const initialStep: Step = me?.whatsappVerified ? "verified" : "enter-phone";
  const [step, setStep] = useState<Step>(initialStep);

  if (!me) return null;

  if (step === "verified" || me.whatsappVerified) {
    return (
      <div className="rounded-md border p-4 space-y-2">
        <h3 className="font-semibold">ربط الواتساب</h3>
        <p className="text-sm text-muted-foreground">
          رقمك مرتبط: <span dir="ltr">{me.phone}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          ستصلك إشعارات المواعيد ونتائج الطلبات على هذا الرقم.
        </p>
      </div>
    );
  }

  async function onRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp({ phone });
      toast.success("تم إرسال الرمز إلى واتساب");
      setStep("enter-code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إرسال الرمز");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp({ code });
      toast.success("تم التحقق من رقمك");
      setStep("verified");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر التحقق");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
      <div>
        <h3 className="font-semibold">ربط الواتساب</h3>
        <p className="text-sm text-muted-foreground">
          سنرسل لك رمزاً مكوناً من 6 أرقام عبر واتساب لتأكيد رقمك.
        </p>
      </div>

      {step === "enter-phone" && (
        <form onSubmit={onRequestOtp} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="wa-phone">رقم الواتساب</Label>
            <Input
              id="wa-phone"
              dir="ltr"
              placeholder="+962795551234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading || !phone}>
            {loading ? "جارٍ الإرسال..." : "أرسل الرمز"}
          </Button>
        </form>
      )}

      {step === "enter-code" && (
        <form onSubmit={onVerifyOtp} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="wa-code">الرمز المرسل</Label>
            <Input
              id="wa-code"
              dir="ltr"
              inputMode="numeric"
              pattern="\d{6}"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || code.length !== 6}>
              {loading ? "جارٍ التحقق..." : "تحقق"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setStep("enter-phone")}
            >
              تغيير الرقم
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Mount the component on the profile page**

Edit `packages/web/src/app/student/profile/page.tsx`. Import the component at the top of the file:

```tsx
import { WhatsappLink } from "@/features/student/components/WhatsappLink";
```

Find a sensible location in the existing layout (typically alongside other profile sections) and place `<WhatsappLink />` in the JSX tree. If there's an existing "phone" input section, remove it — the new component replaces it.

- [ ] **Step 4: Manual smoke test**

```bash
pnpm dev
```
Open `http://localhost:3000/student/profile`, log in as a student.

Expected: see the "ربط الواتساب" card with phone input.

(Don't submit yet — we still need the n8n workflow live; covered in next step.)

- [ ] **Step 5: End-to-end manual test**

With Convex dev, Next dev, n8n, and Evolution all running, and the `wa-otp` workflow activated:

1. Enter your own real WhatsApp number in the form.
2. Click "أرسل الرمز".
3. Check WhatsApp on your phone — message should arrive within seconds.
4. Enter the 6-digit code.
5. Click "تحقق".
6. UI should switch to the verified state.

Also verify in Convex dashboard:
- `whatsappOutbox` has one row with `status="sent"`.
- `whatsappVerifications` has one row with `consumed=true`.
- `users` row has `phone`, `whatsappVerified=true`, `phoneVerificationTime` set.

- [ ] **Step 6: Commit**

```bash
git add packages/web/src/features/student/components/WhatsappLink.tsx \
        packages/web/src/app/student/profile/page.tsx
git commit -m "feat(web): student WhatsApp link + OTP verification UI"
```

---

## Phase 3 — Event notifications

Wire meeting and status_change events to send WhatsApp messages to verified students.

### Task 3.1: `maybeSendWhatsapp` helper + tests

**Files:**
- Modify: `packages/convex/convex/lib/notifications.ts`
- Create: `packages/convex/convex/lib/whatsapp_dispatch.test.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/convex/convex/lib/whatsapp_dispatch.test.ts`:

```ts
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../schema";

const modules = import.meta.glob("../**/*.*s");

async function seedUser(
  t: ReturnType<typeof convexTest>,
  role: "student" | "supervisor" | "admin" | "sponsor",
  overrides: {
    whatsappVerified?: boolean;
    whatsappOptOut?: boolean;
    phone?: string;
  } = {},
) {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId: `${role}-1`,
      email: `${role}@zuj.edu.jo`,
      name: role,
      role,
      isActive: true,
      phone: overrides.phone,
      whatsappVerified: overrides.whatsappVerified,
      whatsappOptOut: overrides.whatsappOptOut,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

describe("maybeSendWhatsapp", () => {
  test("creates outbox row for verified student", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: true,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: { meetingDate: "2026-06-01", supervisorName: "د. أحمد" },
      });
    });

    await t.run(async (ctx) => {
      const outbox = await ctx.db.query("whatsappOutbox").collect();
      expect(outbox).toHaveLength(1);
      expect(outbox[0].kind).toBe("meeting");
      expect(outbox[0].status).toBe("queued");
      expect(outbox[0].userId).toBe(studentId);
    });
  });

  test("no-op when user is not verified", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", { whatsappVerified: false });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });

  test("no-op when user opted out", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: true,
      whatsappOptOut: true,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });

  test("no-op for supervisor role", async () => {
    const t = convexTest(schema, modules);
    const supervisorId = await seedUser(t, "supervisor", {
      whatsappVerified: true,
      phone: "+962795551234",
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: supervisorId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });

  test("no-op when phone is missing (defensive)", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "student", {
      whatsappVerified: true,
      // phone deliberately omitted
    });

    await t.run(async (ctx) => {
      const { maybeSendWhatsapp } = await import("./notifications");
      await maybeSendWhatsapp(ctx, {
        userId: studentId,
        kind: "meeting",
        data: {},
      });
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("whatsappOutbox").collect()).toHaveLength(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @smart-zuj/convex test whatsapp_dispatch.test.ts
```
Expected: FAIL — `maybeSendWhatsapp is not exported`.

- [ ] **Step 3: Implement `maybeSendWhatsapp`**

Append to `packages/convex/convex/lib/notifications.ts`:

```ts
import { internal } from "../_generated/api";

type WhatsappKind = "meeting" | "status_change";

interface MaybeSendArgs {
  userId: Id<"users">;
  kind: WhatsappKind;
  data: Record<string, unknown>;
}

/**
 * Best-effort WhatsApp dispatch sitting alongside in-app notification
 * inserts. Skips silently if the user is not a verified, opted-in
 * student — the bell-icon notification has already been written by
 * the caller, so we don't need to surface an error.
 *
 * Inserts a `whatsappOutbox` row in status="queued" and schedules the
 * matching internal action to actually POST to n8n.
 */
export async function maybeSendWhatsapp(
  ctx: MutationCtx,
  args: MaybeSendArgs,
): Promise<void> {
  const user = await ctx.db.get(args.userId);
  if (!user) return;
  if (user.role !== "student") return;
  if (user.whatsappVerified !== true) return;
  if (user.whatsappOptOut === true) return;
  if (!user.phone) return;

  const now = Date.now();
  const outboxId = await ctx.db.insert("whatsappOutbox", {
    userId: user._id,
    phone: user.phone,
    kind: args.kind,
    payload: args.data,
    status: "queued",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  });

  const actionRef =
    args.kind === "meeting"
      ? internal.whatsapp.actions.sendMeeting
      : internal.whatsapp.actions.sendStatusChange;

  await ctx.scheduler.runAfter(0, actionRef, { outboxId });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @smart-zuj/convex test whatsapp_dispatch.test.ts
```
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/lib/notifications.ts packages/convex/convex/lib/whatsapp_dispatch.test.ts
git commit -m "feat(convex): add maybeSendWhatsapp dispatch helper"
```

---

### Task 3.2: `sendMeeting` and `sendStatusChange` actions

**Files:**
- Modify: `packages/convex/convex/whatsapp/actions.ts`

- [ ] **Step 1: Extract shared dispatch logic + add the two new actions**

Open `packages/convex/convex/whatsapp/actions.ts` and add (below the existing `sendOtp`):

```ts
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
```

(`ActionCtx`, `Id`, `patchSuccess`, `patchFailure` are already imported / defined in this file from Task 2.4.)

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @smart-zuj/convex dev --once 2>&1 | tail -10
pnpm --filter @smart-zuj/convex exec tsc --noEmit
```
Expected: exits 0 on both.

- [ ] **Step 3: Run all tests**

```bash
pnpm --filter @smart-zuj/convex test
```
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add packages/convex/convex/whatsapp/actions.ts packages/convex/convex/_generated
git commit -m "feat(convex): add sendMeeting and sendStatusChange actions"
```

---

### Task 3.3: Wire trigger sites — meetings

**Files:**
- Modify: `packages/convex/convex/meetings.ts`

- [ ] **Step 1: Inspect both trigger sites**

```bash
grep -n "insert.\"notifications\"" packages/convex/convex/meetings.ts
```
Expected: two matches around lines 49 and 139. Note the surrounding context (variable names: `args.studentId`, `args.scheduledAt`, `supervisorLabel`, etc.).

- [ ] **Step 2: Add import**

At the top of `meetings.ts` near the existing import for `./lib/notifications` (if any) — otherwise add a new import:

```ts
import { maybeSendWhatsapp } from "./lib/notifications";
```

- [ ] **Step 3: Wire the "scheduled" trigger**

Immediately after the first `await ctx.db.insert("notifications", { ... type: "meeting", ... })` call (around line 49), add:

```ts
    await maybeSendWhatsapp(ctx, {
      userId: args.studentId,
      kind: "meeting",
      data: {
        action: "scheduled",
        meetingDate: when,
        supervisorName: supervisorLabel,
        location: args.location?.trim() ?? "",
      },
    });
```

Use the exact variable names that exist at that point in the function (`when`, `supervisorLabel`, etc., are already computed above).

- [ ] **Step 4: Wire the "cancelled" trigger**

Immediately after the second `ctx.db.insert("notifications", ...)` (around line 139, for the cancellation case), add:

```ts
    await maybeSendWhatsapp(ctx, {
      userId: meeting.studentId,
      kind: "meeting",
      data: {
        action: "cancelled",
        meetingDate: new Date(meeting.scheduledAt).toLocaleString("ar-EG", {
          dateStyle: "long",
          timeStyle: "short",
        }),
      },
    });
```

- [ ] **Step 5: Typecheck + run all tests**

```bash
pnpm --filter @smart-zuj/convex exec tsc --noEmit
pnpm --filter @smart-zuj/convex test
```
Expected: exits 0 / all pass.

- [ ] **Step 6: Commit**

```bash
git add packages/convex/convex/meetings.ts
git commit -m "feat(convex): dispatch WhatsApp on meeting schedule/cancel"
```

---

### Task 3.4: Wire trigger sites — application status

**Files:**
- Modify: `packages/convex/convex/applications/supervisor.ts`

- [ ] **Step 1: Find the two status-change notification inserts**

```bash
grep -n "type: \"status_change\"" packages/convex/convex/applications/supervisor.ts
```
Expected: two matches around lines 303 and 377.

- [ ] **Step 2: Add the import (if not present)**

At top of file:
```ts
import { maybeSendWhatsapp } from "../lib/notifications";
```

- [ ] **Step 3: Wire site 1 (single update around line 299)**

Right after the first `await ctx.db.insert("notifications", { ... type: "status_change", ... })`:

```ts
    await maybeSendWhatsapp(ctx, {
      userId: app.studentId,
      kind: "status_change",
      data: {
        applicationName: app.projectName,
        newStatus: args.status,
        supervisorNotes: args.supervisorNotes ?? "",
      },
    });
```

- [ ] **Step 4: Wire site 2 (bulk update around line 373)**

Right after the second `await ctx.db.insert("notifications", { ... type: "status_change", ... })`:

```ts
      await maybeSendWhatsapp(ctx, {
        userId: app.studentId,
        kind: "status_change",
        data: {
          applicationName: app.projectName,
          newStatus: args.status,
          supervisorNotes: "",
        },
      });
```

(The bulk-update path doesn't carry per-app notes; that's fine.)

- [ ] **Step 5: Typecheck + tests**

```bash
pnpm --filter @smart-zuj/convex exec tsc --noEmit
pnpm --filter @smart-zuj/convex test
```
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add packages/convex/convex/applications/supervisor.ts
git commit -m "feat(convex): dispatch WhatsApp on application status change"
```

---

### Task 3.5: n8n workflows `wa-meeting` and `wa-status`

**Files:**
- Create: `docs/n8n/wa-meeting.json`
- Create: `docs/n8n/wa-status.json`

- [ ] **Step 1: Create `wa-meeting` workflow**

Same structure as `wa-otp` (Webhook → HMAC verify → Set → HTTP Request to Evolution). The differences:

- Webhook path: `wa-meeting`
- Set node `text` expression (use `Switch` node before Set to branch on `data.action`):

  - `action === "scheduled"`:
    ```
    📅 تم جدولة لقاء جديد
    الموعد: {{ $json.data.meetingDate }}
    مع: {{ $json.data.supervisorName }}
    {{ $json.data.location ? 'المكان: ' + $json.data.location : '' }}
    ```
  - `action === "cancelled"`:
    ```
    ❌ تم إلغاء اللقاء
    كان مقرراً: {{ $json.data.meetingDate }}
    ```

Activate. Export to `docs/n8n/wa-meeting.json`.

- [ ] **Step 2: Create `wa-status` workflow**

Webhook path: `wa-status`. Add a Switch node on `data.newStatus`. Branches:

- `accepted`:
  ```
  🎉 تمت الموافقة على طلبك "{{ $json.data.applicationName }}".
  ```
- `rejected`:
  ```
  📝 طلبك "{{ $json.data.applicationName }}" لم يُقبل.
  {{ $json.data.supervisorNotes ? 'الملاحظات: ' + $json.data.supervisorNotes : '' }}
  ```
- `needs_modification`:
  ```
  ✏️ طلبك "{{ $json.data.applicationName }}" يحتاج إلى تعديل.
  {{ $json.data.supervisorNotes ? 'الملاحظات: ' + $json.data.supervisorNotes : '' }}
  ```
- `under_review`:
  ```
  📂 طلبك "{{ $json.data.applicationName }}" قيد المراجعة الآن.
  ```
- default (any other status): no message sent.

Activate. Export to `docs/n8n/wa-status.json`.

- [ ] **Step 3: End-to-end manual test**

1. As a verified student (from Phase 2), log in.
2. As a supervisor, schedule a meeting for that student via the existing supervisor UI.
3. Confirm the student receives a WhatsApp message within seconds.
4. As a supervisor, change the status of one of the student's applications to `accepted`.
5. Confirm the student receives the status-change WhatsApp.
6. In Convex dashboard, confirm `whatsappOutbox` has the new rows in `status="sent"`.

- [ ] **Step 4: Commit**

```bash
git add docs/n8n/wa-meeting.json docs/n8n/wa-status.json
git commit -m "docs(n8n): version-control wa-meeting and wa-status workflows"
```

---

## Phase 4 — Admin tools, opt-out, retry

Operational tooling. Ship after Phase 3 has been working for a few days in production.

### Task 4.1: Admin WhatsApp log query

**Files:**
- Create: `packages/convex/convex/whatsapp/admin.ts`

- [ ] **Step 1: Implement the admin query**

Create `packages/convex/convex/whatsapp/admin.ts`:

```ts
import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";

/**
 * Admin-only paginated view of recent WhatsApp send attempts.
 * Filters by status, returns up to 100 rows per page.
 */
export const listOutbox = query({
  args: {
    status: v.optional(
      v.union(v.literal("queued"), v.literal("sent"), v.literal("failed")),
    ),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx);
    if (me.role !== "admin") throw new Error("غير مصرح");

    const baseQuery = args.status
      ? ctx.db
          .query("whatsappOutbox")
          .withIndex("by_status_created", (q) =>
            q.eq("status", args.status!),
          )
          .order("desc")
      : ctx.db.query("whatsappOutbox").order("desc");

    const result = await baseQuery.paginate({
      numItems: 100,
      cursor: args.cursor ?? null,
    });

    // Hydrate with masked phone + user name for display
    const rows = await Promise.all(
      result.page.map(async (row) => {
        const user = await ctx.db.get(row.userId);
        const maskedPhone = row.phone.replace(
          /^(\+\d{3})\d+(\d{4})$/,
          "$1***$2",
        );
        return {
          _id: row._id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          userName: user?.name ?? "(محذوف)",
          maskedPhone,
          kind: row.kind,
          status: row.status,
          attempts: row.attempts,
          errorMessage: row.errorMessage,
        };
      }),
    );

    return { ...result, page: rows };
  },
});
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @smart-zuj/convex dev --once 2>&1 | tail -5
pnpm --filter @smart-zuj/convex exec tsc --noEmit
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add packages/convex/convex/whatsapp/admin.ts packages/convex/convex/_generated
git commit -m "feat(convex): admin query for WhatsApp outbox"
```

---

### Task 4.2: Admin WhatsApp log page

**Files:**
- Create: `packages/web/src/app/admin/(dashboard)/whatsapp-log/page.tsx`

- [ ] **Step 1: Build the page**

Create `packages/web/src/app/admin/(dashboard)/whatsapp-log/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Status = "queued" | "sent" | "failed" | "all";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  queued: "secondary",
  sent: "default",
  failed: "destructive",
};

export default function WhatsappLogPage() {
  const [status, setStatus] = useState<Status>("all");
  const data = useQuery(api.whatsapp.admin.listOutbox, {
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">سجل رسائل الواتساب</h1>
        <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="queued">في الانتظار</SelectItem>
            <SelectItem value="sent">تم الإرسال</SelectItem>
            <SelectItem value="failed">فشل</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {data === undefined ? (
        <p className="text-muted-foreground">جارٍ التحميل...</p>
      ) : data.page.length === 0 ? (
        <p className="text-muted-foreground">لا توجد رسائل.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>الرقم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>المحاولات</TableHead>
              <TableHead>الخطأ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.page.map((row) => (
              <TableRow key={row._id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(row.createdAt).toLocaleString("ar-EG")}
                </TableCell>
                <TableCell>{row.userName}</TableCell>
                <TableCell dir="ltr">{row.maskedPhone}</TableCell>
                <TableCell>{row.kind}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                </TableCell>
                <TableCell>{row.attempts}</TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                  {row.errorMessage ?? ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add nav link in admin sidebar**

```bash
grep -rn "upgrade-requests" packages/web/src/app/admin/ packages/web/src/features/admin/ 2>/dev/null | head -5
```
Find the admin nav file (likely something like `packages/web/src/features/admin/components/AdminNav.tsx`). Add a link to `/admin/whatsapp-log` next to the existing admin links, label: "سجل الواتساب".

- [ ] **Step 3: Smoke test**

```bash
pnpm dev
```
Log in as admin, navigate to `/admin/whatsapp-log`. Expected: page renders, table shows recent outbox rows from Phase 3 testing.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/app/admin/\(dashboard\)/whatsapp-log packages/web/src/features/admin
git commit -m "feat(web): admin WhatsApp log page"
```

---

### Task 4.3: Daily retry cron

**Files:**
- Modify: `packages/convex/convex/crons.ts`
- Modify: `packages/convex/convex/whatsapp/internal.ts`

- [ ] **Step 1: Add the retry internal mutation**

Append to `packages/convex/convex/whatsapp/internal.ts`:

```ts
import { internal as _internal } from "../_generated/api";

/**
 * Daily cron: re-dispatch outbox rows that failed in the last 24h
 * and have fewer than 3 attempts. Catches transient n8n/Evolution
 * outages without coupling the synchronous send path to retry logic.
 */
export const retryFailed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const failed = await ctx.db
      .query("whatsappOutbox")
      .withIndex("by_status_created", (q) =>
        q.eq("status", "failed").gt("createdAt", cutoff),
      )
      .take(200);

    let scheduled = 0;
    for (const row of failed) {
      if (row.attempts >= 3) continue;
      const action =
        row.kind === "otp"
          ? null // OTPs are time-sensitive — don't retry
          : row.kind === "meeting"
            ? _internal.whatsapp.actions.sendMeeting
            : _internal.whatsapp.actions.sendStatusChange;
      if (!action) continue;

      await ctx.db.patch(row._id, { status: "queued", updatedAt: Date.now() });
      await ctx.scheduler.runAfter(0, action, { outboxId: row._id });
      scheduled++;
    }

    console.log(`[whatsappRetry] re-queued ${scheduled} failed messages`);
  },
});
```

- [ ] **Step 2: Register the cron**

Modify `packages/convex/convex/crons.ts`:

```ts
crons.daily(
  "whatsapp-retry-failed",
  { hourUTC: 4, minuteUTC: 0 }, // 1h after the notification cleanup cron
  internal.whatsapp.internal.retryFailed,
);
```

(Add this after the existing `cleanup-old-notifications` line.)

- [ ] **Step 3: Typecheck + test**

```bash
pnpm --filter @smart-zuj/convex dev --once 2>&1 | tail -5
pnpm --filter @smart-zuj/convex exec tsc --noEmit
pnpm --filter @smart-zuj/convex test
```
Expected: clean.

- [ ] **Step 4: Manual test**

In Convex dashboard, manually insert a `whatsappOutbox` row with `status="failed", kind="meeting", attempts=0, createdAt=Date.now()`. Then invoke the cron manually via Convex dashboard ("Run function" on `whatsapp.internal.retryFailed`). Expected: the row's status flips to `queued` then to `sent` (or `failed` again if n8n is still broken).

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/crons.ts packages/convex/convex/whatsapp/internal.ts packages/convex/convex/_generated
git commit -m "feat(convex): daily retry cron for failed WhatsApp sends"
```

---

### Task 4.4: Student opt-out toggle

**Files:**
- Modify: `packages/convex/convex/whatsapp.ts`
- Modify: `packages/web/src/features/student/components/WhatsappLink.tsx`

- [ ] **Step 1: Add opt-out test**

Append to `packages/convex/convex/whatsapp.test.ts`:

```ts
describe("whatsapp.setWhatsappOptOut", () => {
  test("toggles opt-out flag on caller user", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedStudent(t);
    const asStudent = t.withIdentity({ subject: "stu-1", tokenIdentifier: "stu-1" });

    await asStudent.mutation(api.whatsapp.setWhatsappOptOut, { optOut: true });
    await t.run(async (ctx) => {
      expect((await ctx.db.get(studentId))?.whatsappOptOut).toBe(true);
    });

    await asStudent.mutation(api.whatsapp.setWhatsappOptOut, { optOut: false });
    await t.run(async (ctx) => {
      expect((await ctx.db.get(studentId))?.whatsappOptOut).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run to verify fail**

```bash
pnpm --filter @smart-zuj/convex test whatsapp.test.ts -t setWhatsappOptOut
```
Expected: FAIL — function does not exist.

- [ ] **Step 3: Implement the mutation**

Append to `packages/convex/convex/whatsapp.ts`:

```ts
export const setWhatsappOptOut = mutation({
  args: { optOut: v.boolean() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, {
      whatsappOptOut: args.optOut,
      updatedAt: Date.now(),
    });
  },
});
```

- [ ] **Step 4: Add toggle to the UI**

In `WhatsappLink.tsx`, extend the `verified` branch to include a checkbox:

```tsx
import { Checkbox } from "@/components/ui/checkbox";

// ... inside the component:
const setOptOut = useMutation(api.whatsapp.setWhatsappOptOut);

// ... in the verified branch, replace its return with:
return (
  <div className="rounded-md border p-4 space-y-3">
    <h3 className="font-semibold">ربط الواتساب</h3>
    <p className="text-sm text-muted-foreground">
      رقمك مرتبط: <span dir="ltr">{me.phone}</span>
    </p>
    <label className="flex items-center gap-2 text-sm">
      <Checkbox
        checked={me.whatsappOptOut === true}
        onCheckedChange={(checked) => setOptOut({ optOut: checked === true })}
      />
      إيقاف رسائل الواتساب (سأكتفي بإشعارات داخل التطبيق)
    </label>
  </div>
);
```

- [ ] **Step 5: Run tests + smoke**

```bash
pnpm --filter @smart-zuj/convex test
```
Expected: all pass.

Run dev, log in as the verified student from Phase 2 testing. Toggle the checkbox on. Then trigger a meeting/status event. Expected: no WhatsApp message sent (bell notification still appears).

- [ ] **Step 6: Commit**

```bash
git add packages/convex/convex/whatsapp.ts packages/convex/convex/whatsapp.test.ts \
        packages/web/src/features/student/components/WhatsappLink.tsx
git commit -m "feat: student WhatsApp opt-out toggle"
```

---

## Final verification checklist

After Phase 4 ships, walk through this list end-to-end:

- [ ] New student creates account, links phone via OTP, receives WhatsApp confirmation message.
- [ ] Supervisor schedules meeting → student receives WhatsApp.
- [ ] Supervisor cancels meeting → student receives WhatsApp.
- [ ] Supervisor approves application → student receives "approved" WhatsApp.
- [ ] Supervisor rejects application with notes → student receives "rejected" WhatsApp with notes.
- [ ] Student opts out → no further WhatsApp messages on new events; bell still updates.
- [ ] Student opts back in → WhatsApp resumes on new events.
- [ ] Admin can load `/admin/whatsapp-log` and sees all the above.
- [ ] Stop n8n container → schedule a meeting → student gets bell notification (app keeps working), outbox row shows `status="failed"`.
- [ ] Restart n8n → wait for next day's cron OR manually invoke `retryFailed` → outbox row flips to `sent`.
- [ ] Run full test suite: `pnpm test` → all pass.
- [ ] Run lint: `pnpm lint` → clean.

---

## Notes for the implementer

- The Convex `_generated/` directory is regenerated whenever you run `convex dev`. Commit it together with the file that triggered the regeneration; never edit it by hand.
- Convex actions cannot use `ctx.db`. Anything DB-touching must live in a query/mutation reached via `ctx.runQuery`/`ctx.runMutation`. That's why the helpers in `whatsapp/internal.ts` are separate from `whatsapp/actions.ts`.
- When you add a `"use node";` file (only `actions.ts` in this plan), that's a separate runtime — keep it small and free of business logic.
- Existing notification inserts in `meetings.ts`, `applications/supervisor.ts`, `applications/sponsor.ts`, etc. were *not all* wired in this plan. Only `meeting` and `status_change` events for students. If you spot another spot you think should send WhatsApp, **stop and check with the spec author** — non-goals are explicit.
- Phone numbers are stored E.164. Don't store WhatsApp's `…@s.whatsapp.net` form in `users.phone` — that conversion happens in n8n, not Convex.
