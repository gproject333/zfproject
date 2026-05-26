# WhatsApp Notifications for Students — Design

**Date:** 2026-05-26
**Status:** Approved, ready for implementation plan
**Owner:** Yazeed

## Goal

Let students link a verified WhatsApp number to their smart-zuj account and receive WhatsApp messages for two real-world events:

1. A meeting was scheduled for them (with a supervisor or sponsor).
2. The status of one of their applications changed (approved, rejected, needs revision, etc.).

Verification uses a 6-digit OTP delivered over WhatsApp itself, so the system only sends to numbers that actually receive WhatsApp.

In-app notifications (the bell) stay as the source of truth and always work; WhatsApp is a best-effort side channel.

## Non-goals

- Two-way WhatsApp conversations. Students cannot reply meaningfully — messages are one-way.
- WhatsApp messages for supervisors, sponsors, or admins.
- WhatsApp delivery for `announcement`, `new_application`, `assignment`, or `upgrade_request` notification types.
- Editable message templates stored in the database. Templates live in n8n.
- Media (images, files) — text only.
- Languages other than Arabic.

## Architecture

```
┌─────────────────────────┐
│  smart-zuj (Next.js)    │
│  /student/profile       │ ← Student adds number → "Send code"
└──────────┬──────────────┘
           │ mutation
           ▼
┌─────────────────────────┐
│  Convex                 │
│  - users.phone          │
│  - whatsappVerifications│  (new) — pending OTPs
│  - whatsappOutbox       │  (new) — durable send log
│  - actions/n8n.ts       │  (new) — fetch() to n8n
└──────────┬──────────────┘
           │ HTTPS POST + HMAC-SHA256(body, secret)
           ▼
┌─────────────────────────┐
│  n8n (3 workflows)      │
│  /webhook/wa-otp        │
│  /webhook/wa-meeting    │
│  /webhook/wa-status     │
└──────────┬──────────────┘
           │ POST /message/sendText/<instance>
           ▼
┌─────────────────────────┐
│  Evolution API          │ → WhatsApp
└─────────────────────────┘
```

### Component responsibilities

- **Convex** owns identity, phone state, OTP issuance/verification, and the send log. It triggers n8n but never talks to Evolution directly. Convex never knows the Evolution API key.
- **n8n** owns message *content* (Arabic copy, formatting, emoji, structure) and the call to Evolution. Editing a message body never requires a Convex deploy.
- **Evolution API** is treated as a dumb send transport. n8n is the only client.

### Why Convex → n8n → Evolution (and not direct)

The user chose this layering explicitly. Trade-off: one extra network hop and one extra service to keep alive, in exchange for editing message copy without touching Convex code, easier visibility into individual sends in n8n's execution log, and the ability to add future channels (email, SMS) by adding workflows rather than backend code.

### Why scheduler-dispatched actions (not direct fetch from mutations)

Convex mutations cannot `fetch`. Actions can, but actions cannot use `ctx.db` directly. The flow is therefore:

1. Mutation writes to `whatsappOutbox` with `status="queued"`.
2. Mutation calls `ctx.scheduler.runAfter(0, internal.whatsapp.actions.send*, { outboxId })`.
3. Action loads the outbox row, POSTs to n8n, patches the row to `sent` or `failed`.

Decoupling this way means a failed WhatsApp send never rolls back the originating mutation (the meeting still got created, the application status still changed, the in-app notification still landed in the bell).

## Schema changes

### `users` (additions only)

```ts
users: defineTable({
  // ... all existing fields ...
  phone: v.optional(v.string()),                 // existing
  phoneVerificationTime: v.optional(v.number()), // existing (currently unused under Clerk auth) — we reuse it for WA verification timestamp

  // new:
  whatsappVerified: v.optional(v.boolean()),
  whatsappOptOut: v.optional(v.boolean()),
})
```

Existing `phone` index stays. No data migration needed — fields are optional.

### `whatsappVerifications` (new)

```ts
whatsappVerifications: defineTable({
  userId: v.id("users"),
  phone: v.string(),         // E.164 normalized, e.g. "+962795551234"
  codeHash: v.string(),      // SHA-256 of the 6-digit code (we never store the code)
  expiresAt: v.number(),     // Date.now() + 10 minutes
  attempts: v.number(),      // increments on wrong-code submission, max 5
  consumed: v.boolean(),     // true after successful verify
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "consumed"]),
```

Hashing the code (rather than storing plaintext) means a DB leak doesn't expose live OTPs. The 10-minute TTL also bounds the window, but hashing is cheap and defensive.

### `whatsappOutbox` (new)

```ts
whatsappOutbox: defineTable({
  userId: v.id("users"),
  phone: v.string(),
  kind: v.union(
    v.literal("otp"),
    v.literal("meeting"),
    v.literal("status_change"),
  ),
  payload: v.any(),              // structured data sent to n8n (no raw message text)
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

The outbox is the durable send log: every send attempt creates exactly one row. Retries update the row, they don't create a new one. This is what the admin views, and what the daily retry cron scans.

## Code layout

```
packages/convex/convex/
├── whatsapp.ts              # public: requestWhatsappOtp, verifyWhatsappOtp, optOut
├── whatsapp/
│   ├── actions.ts           # "use node"; internal actions that POST to n8n
│   ├── helpers.ts           # phone normalization, code generation, hashing
│   └── helpers.test.ts      # unit tests for helpers
├── whatsapp.test.ts         # mutation/query tests
└── lib/notifications.ts     # add maybeSendWhatsapp() helper; existing functions unchanged
```

n8n workflows live in n8n itself; their JSON exports go in `docs/n8n/` for version control.

## Flow A — OTP request and verify

1. Student opens `/student/profile`, enters `+962795551234`, clicks "أرسل رمز".
2. Client calls mutation `whatsapp.requestWhatsappOtp({ phone })`.
3. Mutation:
   - Normalizes phone to E.164. Rejects if invalid.
   - Looks up the user's most recent `whatsappVerifications` row (consumed=false). If `createdAt > Date.now() - 60_000` → throw "wait 60 seconds".
   - Marks any active OTP for this user as consumed (so old codes can't be used).
   - Generates a 6-digit code (`crypto.randomInt(100000, 1000000)`).
   - Inserts `whatsappVerifications` with `codeHash = sha256(code)`, `expiresAt = now + 10min`, `attempts = 0`, `consumed = false`.
   - Inserts `whatsappOutbox` with `kind="otp", status="queued", payload={ phone }`.
   - `ctx.scheduler.runAfter(0, internal.whatsapp.actions.sendOtp, { outboxId, code })` — the plaintext code is passed as a scheduler argument (held only until the action runs) and is never written to `whatsappOutbox`.
4. Action `sendOtp`:
   - Loads outbox row.
   - Computes `signature = HMAC-SHA256(body, N8N_WEBHOOK_SECRET)`.
   - POST `${N8N_BASE_URL}/webhook/wa-otp` with `{ phone, code, expiresInMinutes: 10 }` and header `X-Signature: <hex>`.
   - On 2xx → patch outbox `status="sent", updatedAt=now, attempts=1`.
   - On non-2xx or thrown → patch outbox `status="failed", errorMessage, attempts=1`.
5. n8n `wa-otp` workflow:
   - Webhook node receives the request.
   - Function node verifies HMAC signature against `N8N_WEBHOOK_SECRET` env. Throws on mismatch.
   - Builds Arabic message body: `رمز التحقق: {{code}}\nصالح لمدة 10 دقائق`.
   - HTTP Request node POSTs to Evolution `/message/sendText/<instance>` with the configured `apikey` header.
   - Returns 200 (or 5xx if Evolution failed) to Convex.
6. Student receives WhatsApp message, enters code in UI.
7. Client calls mutation `whatsapp.verifyWhatsappOtp({ code })`.
8. Mutation:
   - Finds the user's active (consumed=false) `whatsappVerifications` row.
   - If none, or `expiresAt < now`, or `attempts >= 5` → throw appropriate error.
   - Compares `sha256(code)` to stored `codeHash`. Mismatch → `attempts++`, throw "wrong code, X attempts left".
   - Match → patch verification: `consumed=true`. Patch user: `phone=<verified phone>, whatsappVerified=true, phoneVerificationTime=now`.

### Limits

| Limit | Value | Rationale |
|---|---|---|
| OTP length | 6 digits | Standard, easy to type |
| OTP TTL | 10 minutes | Tight enough to limit replay window |
| Max verify attempts per code | 5 | Stops brute-force |
| Min seconds between OTP requests per user | 60 | Stops spam, gives WhatsApp time to deliver |

## Flow B — Meeting notification

`packages/convex/convex/meetings.ts` already calls `ctx.db.insert("notifications", { type: "meeting", userId: studentId, ... })` in two places. Immediately after each insert, call:

```ts
await maybeSendWhatsapp(ctx, {
  userId: studentId,
  kind: "meeting",
  data: {
    meetingDate,
    meetingTime,
    location,
    supervisorName,
    applicationName,
  },
});
```

`maybeSendWhatsapp` lives in `lib/notifications.ts`. It:

1. Loads the user.
2. Returns early (no-op, no error) if any of: `role !== "student"`, `!whatsappVerified`, `whatsappOptOut === true`, `!phone`.
3. Inserts an outbox row with `kind`, the structured `data` as `payload`, and `status="queued"`.
4. Schedules the matching action (`internal.whatsapp.actions.sendMeeting`).

The n8n `wa-meeting` workflow shapes the data into:
```
📅 تم جدولة لقاء جديد
الموعد: {{meetingDate}} الساعة {{meetingTime}}
المكان: {{location}}
مع: {{supervisorName}}
بخصوص: {{applicationName}}
```

## Flow C — Application status change

Same pattern as Flow B. Trigger sites are in `applications/supervisor.ts` (lines 299 and 373) where status_change notifications are already inserted.

```ts
await maybeSendWhatsapp(ctx, {
  userId: application.studentId,
  kind: "status_change",
  data: {
    applicationName: application.projectName,
    newStatus,            // "approved" | "rejected" | "needs_revision" | ...
    supervisorNotes,
  },
});
```

n8n `wa-status` workflow branches on `newStatus` to pick an Arabic template per status. Sample bodies:

- `approved` → `🎉 تمت الموافقة على طلبك "{{applicationName}}". ستصلك تفاصيل الخطوات التالية قريباً.`
- `rejected` → `📝 طلبك "{{applicationName}}" لم يُقبل. الملاحظات: {{supervisorNotes}}`
- `needs_revision` → `✏️ طلبك "{{applicationName}}" يحتاج إلى تعديل. الملاحظات: {{supervisorNotes}}`

## Security

### HMAC between Convex and n8n

Every outbound call from Convex to n8n carries `X-Signature: hex(HMAC-SHA256(rawBody, N8N_WEBHOOK_SECRET))`. Every n8n workflow's first node verifies it. Webhook URLs are not secret; the signature is. This prevents anyone who learns a webhook URL from sending arbitrary WhatsApp messages.

### Evolution API key

Stays in n8n's env only. Convex doesn't know it. If Convex is compromised, the attacker can still send via n8n — but rotating `N8N_WEBHOOK_SECRET` cuts them off immediately without rotating the Evolution key (which would invalidate any working WhatsApp instance and require re-pairing).

### Phone storage

`users.phone` is only written after successful OTP verification. A phone entered but never verified is held in `whatsappVerifications.phone` and disappears when that row is consumed or expires (cleanup cron).

### What we don't log

- Plaintext OTP codes are never stored (only hashes).
- Outbox `payload` carries structured fields (names, dates, status) but not the final composed Arabic message text. The text is built in n8n and only visible in n8n's execution history.

## Error handling

| Where | Failure | Behavior |
|---|---|---|
| `requestWhatsappOtp` | Invalid phone format | Throw → UI shows Arabic error |
| `requestWhatsappOtp` | Rate-limit (<60s since last) | Throw → "انتظر دقيقة قبل طلب رمز جديد" |
| `verifyWhatsappOtp` | Wrong code | `attempts++`; throw with remaining-attempts count |
| `verifyWhatsappOtp` | Expired or already-consumed | Throw → "الرمز منتهي، اطلب رمز جديد" |
| Action `sendOtp` | n8n 5xx or network error | `outbox.status="failed"`; do not throw out of the action |
| Action `sendOtp` | n8n 4xx (e.g., bad HMAC) | `outbox.status="failed"`; insert a system notification for admins |
| `maybeSendWhatsapp` | User not student, not verified, or opted-out | Silent no-op (logged via Convex console only) |
| n8n → Evolution | Evolution returns error | n8n returns 5xx to Convex → outbox failed |

**Invariant:** A WhatsApp failure never rolls back the originating mutation. Meeting creation and status change always succeed even if every downstream channel is down.

## Retry strategy

- In-action: **no retry**. One attempt per dispatch.
- Daily cron `whatsappOutboxRetry` (added to `crons.ts`): scans `whatsappOutbox` for rows with `status="failed"` and `createdAt > now - 24h` and `attempts < 3`. Re-schedules the matching action for each. This catches transient n8n/Evolution outages without complicating the synchronous path.

Rows older than 24h with `status="failed"` are left alone — the event is no longer fresh enough to surface to the student.

## Admin visibility

Add a new page `packages/web/src/app/admin/(dashboard)/whatsapp-log/page.tsx` that lists `whatsappOutbox` rows (paginated, descending, last 100 by default) with columns:

- Created at
- User (link to user profile)
- Phone (masked: `+962***1234`)
- Kind
- Status
- Error message (truncated)
- Attempts

Filter: status (`all` | `queued` | `sent` | `failed`).

No action buttons — read-only. Admin retries happen by waiting for the daily cron or manually re-triggering the source event.

## Environment variables

### Convex deployment

```
N8N_BASE_URL=https://n8n.yazeid.site
N8N_WEBHOOK_SECRET=<random 32 bytes hex>
```

### n8n

```
N8N_WEBHOOK_SECRET=<same as Convex>
EVOLUTION_BASE_URL=https://evolution.yazeid.site
EVOLUTION_API_KEY=<from Evolution>
EVOLUTION_INSTANCE_NAME=<the connected instance name>
```

## Testing

### Unit tests (Vitest, `whatsapp.test.ts` and `whatsapp/helpers.test.ts`)

1. `normalizePhone` accepts `+962795551234`, `00962795551234`, `0795551234` (with default country JO) and produces the same E.164 string.
2. `normalizePhone` rejects empty, letters, or non-mobile lengths.
3. `generateCode` returns 6-character numeric string in range `100000..999999`.
4. `hashCode` is deterministic and matches `sha256(code)` hex.
5. `requestWhatsappOtp` rejects invalid phone.
6. `requestWhatsappOtp` rejects when last request < 60s ago.
7. `requestWhatsappOtp` consumes previous active OTP before creating a new one.
8. `requestWhatsappOtp` writes outbox row with `status="queued"`.
9. `verifyWhatsappOtp` accepts correct code → marks user `whatsappVerified=true`, sets `phone` and `phoneVerificationTime`.
10. `verifyWhatsappOtp` increments `attempts` on wrong code and throws.
11. `verifyWhatsappOtp` rejects after 5 attempts.
12. `verifyWhatsappOtp` rejects expired code.
13. `verifyWhatsappOtp` rejects already-consumed code.
14. `maybeSendWhatsapp` is a no-op when `whatsappVerified !== true`.
15. `maybeSendWhatsapp` is a no-op when `whatsappOptOut === true`.
16. `maybeSendWhatsapp` is a no-op when user is supervisor/admin/sponsor.
17. `maybeSendWhatsapp` writes an outbox row and schedules the action when the student is eligible.

### Integration tests

Actions that call `fetch` are not unit-tested. Instead, a hidden admin-only page `/admin/whatsapp-test` provides:

- Input: phone, message kind
- Button: "send"
- Output: the outbox row's current status (live via Convex subscription)

Manual end-to-end checklist before shipping each phase:

- [ ] Phase 2: link a real number via OTP, see WhatsApp message arrive.
- [ ] Phase 3: schedule a meeting for the linked student, see WhatsApp message arrive.
- [ ] Phase 3: change application status for the linked student, see WhatsApp message arrive.
- [ ] Negative: link a number, send to it, then opt out, schedule meeting — no WhatsApp message arrives, but bell notification still appears.

## Rollout plan

### Phase 1 — schema + helpers (no behavior change)
- Add tables and user fields to `schema.ts`.
- Write `whatsapp/helpers.ts` (normalize, generate, hash).
- Unit tests for helpers.
- Ship — no UI, no actions yet.

### Phase 2 — OTP flow end-to-end
- `whatsapp.ts`: `requestWhatsappOtp`, `verifyWhatsappOtp`, `optOut` mutations.
- `whatsapp/actions.ts`: `sendOtp` action with HMAC.
- `/student/profile` UI section "ربط واتساب" (input phone → input code → verified state).
- n8n workflow `wa-otp`.
- Configure env vars on Convex and n8n.
- Manual e2e test with one real number.
- Ship.

### Phase 3 — event notifications
- `maybeSendWhatsapp` in `lib/notifications.ts`.
- Action functions `sendMeeting`, `sendStatusChange` in `whatsapp/actions.ts`.
- Wire trigger sites in `meetings.ts` and `applications/supervisor.ts`.
- n8n workflows `wa-meeting` and `wa-status`.
- Manual e2e: schedule meeting → message; change status → message.
- Ship.

### Phase 4 — admin tools + retry
- `/admin/whatsapp-log` page.
- `crons.ts`: daily `whatsappOutboxRetry`.
- `/student/profile`: opt-out toggle.
- Ship.

Each phase is independently mergeable and adds value on its own.

## Open questions deferred (not blocking)

- Whether to mask phone numbers in the admin log or show full numbers (current design: mask). Admins can still join to the user record for the full number.
- Whether to localize message templates for English-speaking students later. Out of scope today.
- Whether to surface "WhatsApp delivery failed" inline in the bell notification UI. Current design: no — the bell stays clean.
