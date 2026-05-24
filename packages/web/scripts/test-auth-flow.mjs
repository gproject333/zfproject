#!/usr/bin/env node
/**
 * Triggers a Clerk user.created event by creating a test user via the
 * Clerk Backend API. After it runs, check the Convex production Logs
 * for a `clerk-user-webhook` entry with status `success`.
 *
 * Usage:
 *   node scripts/test-auth-flow.mjs            # create user, keep it
 *   node scripts/test-auth-flow.mjs --cleanup  # also delete the user
 *                                              # after 15s
 */

import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().split(" #")[0]];
    }),
);

const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error("Missing CLERK_SECRET_KEY in .env.local");
  process.exit(1);
}

const cleanup = process.argv.includes("--cleanup");

async function clerk(p, init = {}) {
  const res = await fetch(`https://api.clerk.com/v1${p}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

const rnd = Math.random().toString(36).slice(2, 8);
const testEmail = `auth-test-${rnd}@smart-zuj-test.dev`;
const testPassword = `Test_${rnd}_${Math.random().toString(36).slice(2, 10)}!Z`;

console.log("=== Clerk webhook -> Convex production test ===");
console.log("Test email:", testEmail);
console.log();

// 1. Create user
console.log("[1/3] Creating Clerk user (this will fire user.created)...");
const create = await clerk("/users", {
  method: "POST",
  body: JSON.stringify({
    email_address: [testEmail],
    password: testPassword,
    first_name: "AuthTest",
    last_name: "User",
    skip_password_checks: true,
  }),
});
if (!create.ok) {
  console.error("Failed to create user:", create.status);
  console.error(JSON.stringify(create.body, null, 2));
  process.exit(1);
}
const userId = create.body.id;
console.log("    Clerk user id:", userId);
console.log("    Created at:   ", new Date().toISOString());

// 2. Wait for webhook
console.log();
console.log("[2/3] Waiting 8 seconds for webhook to fire...");
await new Promise((r) => setTimeout(r, 8000));

// 3. Verify - by fetching the user back
console.log();
console.log("[3/3] Confirming user exists in Clerk...");
const fetched = await clerk(`/users/${userId}`);
console.log("    Clerk user fetched:", fetched.ok ? "yes" : "no");

if (cleanup) {
  console.log();
  console.log("Cleaning up - deleting Clerk user...");
  const del = await clerk(`/users/${userId}`, { method: "DELETE" });
  console.log(del.ok ? "Deleted." : `Manual cleanup needed: ${userId}`);
}

console.log();
console.log("====================================================");
console.log("Test user created. Now verify the webhook landed:");
console.log();
console.log("  1. Open Convex dashboard -> Production trustworthy-sheep-722");
console.log("  2. Click 'Logs' in the sidebar");
console.log("  3. Look for a recent entry like:");
console.log("       POST /clerk-user-webhook   status: success");
console.log("     (timestamp should be within the last minute)");
console.log();
console.log("Then check Data -> users table for:");
console.log("       email = " + testEmail);
console.log();
if (!cleanup) {
  console.log("To delete the test user afterwards:");
  console.log("  node scripts/test-auth-flow.mjs --cleanup-id " + userId);
}
console.log("====================================================");
