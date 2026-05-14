# ZUJ Incubator (حاضنة الزيتونة) — Software Test Plan & Report

*This document defines the testing strategy for ZUJ Incubator and reports the results of the automated backend test suite, including a code-coverage report. It complements the SRS (`docs/ZUJIncubatorSRS.md`); every test case traces to one or more functional requirements.*

---

# 1. Introduction

## 1.1 Purpose

To define what is tested, how it is tested, and with what result; and to give the academic reviewer a concrete, reproducible picture of backend quality assurance.

## 1.2 Scope of Testing

| In scope | Method |
|---|---|
| Convex backend functions — RBAC, the application state machine, the immutable audit log, the upload-size guard, the university-email guard | Automated (Vitest + `convex-test`) |
| TypeScript type correctness across front and back end | `tsc --noEmit` (root + `convex/tsconfig.json`) |
| Lint / Convex rule compliance | ESLint with `@convex-dev/eslint-plugin` |
| Critical UI flows per role | Manual functional testing / UAT |
| End-to-end browser flows | **Not yet automated** — see §7 |

## 1.3 Items Under Test

The Convex functions in `convex/` — with the automated suite focused on the security-critical core: `convex/lib/auth.ts`, `convex/lib/statuses.ts`, `convex/lib/validation.ts`, `convex/users.ts` (Clerk webhook), `convex/applications/student.ts`, `convex/applications/supervisor.ts`.

---

# 2. Test Approach & Strategy

## 2.1 Automated Backend Testing

- **Runner:** Vitest 4.1 (`pnpm test` → `vitest run`).
- **Harness:** `convex-test` 0.0.52 — an in-memory mock of the Convex backend that runs real query/mutation/action code against an isolated in-memory database per test.
- **Environment:** `edge-runtime` (`@edge-runtime/vm`), configured in `vitest.config.ts`, mirroring the Convex function runtime.
- **Test file:** `convex/incubator.test.ts` — 11 test cases across 4 suites.
- **Identity simulation:** `t.withIdentity({ subject })` sets the Clerk identity; the function-under-test resolves the user by matching `identity.subject` to `users.clerkId`, exactly as in production.

## 2.2 Static Verification

- `tsc --noEmit` on the root `tsconfig.json` and on `convex/tsconfig.json` — both must pass with zero errors.
- ESLint (`pnpm lint`) with the `@convex-dev/eslint-plugin` ruleset on all changed files.

## 2.3 Manual Testing

Per-role functional walkthroughs and User Acceptance Testing with the incubator office, covering the UI flows that are not yet automated (see the User Manuals document for the scripts).

## 2.4 Entry / Exit Criteria

- **Entry:** the feature compiles (`tsc` clean) and lints clean.
- **Exit:** 100 % of automated test cases pass; `tsc` and ESLint (changed files) are clean; manual UAT scenarios for the affected role pass.

---

# 3. Test Environment

| Item | Value |
|---|---|
| OS | Linux |
| Node.js | LTS (≥ 20) |
| Package manager | pnpm |
| Test command | `pnpm test` / `pnpm test:coverage` |
| Vitest | 4.1.6 |
| convex-test | 0.0.52 |
| Coverage provider | `@vitest/coverage-v8` |
| Vitest environment | `edge-runtime` |

---

# 4. Test Cases

All eleven cases are implemented in `convex/incubator.test.ts`. **Actual result** and **Status** below reflect the latest run (`pnpm test` — 11 passed / 11).

### Suite A — RBAC enforcement

| ID | Requirement | Description | Input | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-01 | FR-RBAC-2, FR-APP-1 | `createApplication` rejects an unauthenticated caller | No identity; valid application args | Mutation throws; no `applications` row written | Threw as expected | ✅ Pass |
| TC-02 | FR-RBAC-3, FR-APP-1 | `createApplication` rejects a non-student caller | Identity = a `supervisor`; valid args | Mutation throws | Threw as expected | ✅ Pass |
| TC-03 | FR-RBAC-4, FR-REV-2 | `updateApplicationStatus` rejects a student caller | Identity = a `student`; `{id, status: "accepted"}` on an `under_review` app | Mutation throws | Threw as expected | ✅ Pass |
| TC-04 | FR-RBAC-5, FR-ADMIN-2 | An admin-only query rejects a supervisor caller | Identity = a `supervisor`; call `users.admin.getAllUsers` | Query throws | Threw as expected | ✅ Pass |

### Suite B — Application lifecycle state machine

| ID | Requirement | Description | Input | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-05 | FR-REV-1, FR-REV-3 | An `accepted` application cannot be moved back to `under_review` | Supervisor caller; app in `accepted`; `status: "under_review"` | Mutation throws (illegal transition); no write | Threw as expected | ✅ Pass |
| TC-06 | FR-REV-4, FR-REV-6, NFR-REL-3 | A legal transition is applied and recorded immutably | Supervisor caller; app in `under_review`; `status: "accepted", rating: "excellent"` | App status becomes `accepted`; exactly one `applicationReviews` row with `fromStatus=under_review`, `toStatus=accepted` | Status updated; 1 review row with correct from/to | ✅ Pass |

### Suite C — Server-side upload size limit

| ID | Requirement | Description | Input | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-07 | FR-FILE-2 | `createApplication` rejects a PDF over the 10 MB cap | Student caller; `pdfFileId` of a stored blob of 10 MB + 1 byte | Mutation throws with a PDF size error; no `applications` row | Threw with `/PDF/` message | ✅ Pass |
| TC-08 | FR-FILE-2, FR-APP-1 | `createApplication` accepts a PDF within the cap | Student caller; `pdfFileId` of a 1 KB stored blob | Mutation succeeds; returns an application id | Returned a defined id | ✅ Pass |

### Suite D — University-email guard on user provisioning

| ID | Requirement | Description | Input | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-09 | FR-AUTH-2, FR-AUTH-5 | `isUniversityEmail` accepts ZUJ domains and rejects others | `ahmad@std-zuj.edu.jo`, `ahmad@std.zuj.edu.jo`, `DR.OMAR@zuj.edu.jo`, `investor@gmail.com`, `attacker@zuj.edu.jo.evil.com` | `true, true, true, false, false` | Matched expected | ✅ Pass |
| TC-10 | FR-AUTH-5 | The Clerk webhook ignores a non-university signup | `handleClerkWebhook` with `user.created`, email `investor@gmail.com` | No `users` row created | `users` table empty | ✅ Pass |
| TC-11 | FR-AUTH-5 | The Clerk webhook provisions a student for a university signup | `handleClerkWebhook` with `user.created`, email `ahmad@std-zuj.edu.jo` | One `users` row, `role = "student"`, correct `clerkId` | Row created with `role="student"` | ✅ Pass |

**Summary:** Test Files 1 passed (1) · Tests **11 passed (11)** · 0 failed.

---

# 5. Code Coverage Report

Generated with `pnpm test:coverage` (`@vitest/coverage-v8`), scoped to `convex/**` excluding `convex/_generated/**` and test files.

| File | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| **All files (`convex/**`)** | **11.93** | **7.02** | **7.23** | **12.71** |
| `convex/lib/auth.ts` | **90.90** | 91.66 | 85.71 | 90.00 |
| `convex/lib/statuses.ts` | **83.33** | 0.00 | 50.00 | 83.33 |
| `convex/lib/validation.ts` | **76.92** | 71.42 | 83.33 | 80.00 |
| `convex/users.ts` | **62.06** | 50.00 | 40.00 | 62.96 |
| `convex/applications/student.ts` | 28.57 | 8.33 | 16.66 | 31.57 |
| `convex/applications/supervisor.ts` | 15.60 | 5.20 | 3.44 | 17.21 |
| `convex/users/admin.ts` | 11.36 | 0.00 | 2.70 | 12.71 |
| Other `convex/` modules (articles, banners, colleges, presence, notifications, sponsor, …) | 0.00 | 0.00 | 0.00 | 0.00 |

## 5.1 Interpretation

The automated suite is **risk-prioritised, not breadth-first**. It deliberately concentrates on the modules where a defect is most damaging — the authorisation core, the state machine, the input/upload/identity guards — and those modules show high coverage (`auth.ts` 90.9 %, `statuses.ts` 83.3 %, `validation.ts` 76.9 %, `users.ts` webhook 62.1 %). The lower aggregate percentage reflects the large breadth of straightforward CRUD modules (articles, banners, colleges, social links, presence, notifications) that are currently verified through manual UAT rather than automated tests.

The uncovered branch in `statuses.ts` is the terminal-state path (line 31); `auth.ts` uncovered lines are two of the four role-guard throw branches not exercised by the current cases.

---

# 6. Defects & Known Gaps

| ID | Description | Severity | Status |
|---|---|---|---|
| D-01 | Pre-existing ESLint errors in `src/hooks/useInView.ts` and `src/features/supervisor/hooks/useSupervisorListFilters.ts` (`react-hooks/set-state-in-effect`) — present on `main`, unrelated to backend changes | Low | Open (pre-existing) |
| D-02 | CRUD modules (articles, banners, colleges, social links, presence, notifications, sponsor) have no automated coverage | Medium | Open — see §7 |
| D-03 | No end-to-end browser test automation | Medium | Open — see §7 |

No defects were found in the modules under automated test; all 11 cases pass.

---

# 7. Future Test Work

1. **Extend `convex-test` coverage** to the remaining CRUD modules (articles, banners, colleges, social links, presence, notifications, sponsor assignments) and to `bulkUpdateStatus`, raising aggregate `convex/**` statement coverage toward a 70 % target.
2. **Add end-to-end tests** (Playwright/Cypress) for the core cross-role journey: student registers → drafts → submits → supervisor reviews → student is notified → sponsor sees the reel.
3. **Wire `pnpm test` into CI** so the suite runs on every push, alongside `tsc` and `pnpm lint`.

---

# Appendix — Reproducing the Results

```bash
pnpm install
pnpm test            # runs convex/incubator.test.ts — expect 11 passed
pnpm test:coverage   # same, plus the coverage table in §5
npx tsc --noEmit                       # root typecheck — expect 0 errors
npx tsc -p convex/tsconfig.json --noEmit  # convex typecheck — expect 0 errors
```
