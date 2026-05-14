import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";
import { isUniversityEmail } from "./lib/validation";

// `import.meta.glob` is a Vite/Vitest build feature; declare it for `tsc`.
declare global {
  interface ImportMeta {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
}

// convex-test discovers the function modules via this glob.
const modules = import.meta.glob("./**/*.*s");

type Role = "student" | "supervisor" | "admin" | "sponsor";

async function seedUser(t: TestConvex<typeof schema>, clerkId: string, role: Role) {
  return t.run((ctx) =>
    ctx.db.insert("users", {
      clerkId,
      email: `${clerkId}@std-zuj.edu.jo`,
      name: clerkId,
      role,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

const NEW_APPLICATION = {
  type: "entrepreneurial_idea",
  projectName: "مشروع تجريبي",
  description: "وصف المشروع",
  problemStatement: "المشكلة التي يحلها",
  targetAudience: "الجمهور المستهدف",
} as const;

describe("RBAC is enforced at the Convex function boundary", () => {
  test("createApplication rejects an unauthenticated caller", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.applications.student.createApplication, NEW_APPLICATION),
    ).rejects.toThrow();
  });

  test("createApplication rejects a non-student caller", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "sup1", "supervisor");
    await expect(
      t
        .withIdentity({ subject: "sup1" })
        .mutation(api.applications.student.createApplication, NEW_APPLICATION),
    ).rejects.toThrow();
  });

  test("updateApplicationStatus rejects a student caller", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "stud1", "student");
    const appId = await t.run((ctx) =>
      ctx.db.insert("applications", {
        studentId,
        ...NEW_APPLICATION,
        status: "under_review",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    await expect(
      t
        .withIdentity({ subject: "stud1" })
        .mutation(api.applications.supervisor.updateApplicationStatus, {
          id: appId,
          status: "accepted",
        }),
    ).rejects.toThrow();
  });

  test("an admin-only query rejects a supervisor caller", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "sup1", "supervisor");
    await expect(
      t.withIdentity({ subject: "sup1" }).query(api.users.admin.getAllUsers, {}),
    ).rejects.toThrow();
  });
});

describe("application lifecycle state machine", () => {
  test("an accepted application cannot be moved back to under_review", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "stud1", "student");
    await seedUser(t, "sup1", "supervisor");
    const appId = await t.run((ctx) =>
      ctx.db.insert("applications", {
        studentId,
        ...NEW_APPLICATION,
        status: "accepted",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    await expect(
      t
        .withIdentity({ subject: "sup1" })
        .mutation(api.applications.supervisor.updateApplicationStatus, {
          id: appId,
          status: "under_review",
        }),
    ).rejects.toThrow();
  });

  test("a legal transition is applied and recorded immutably in applicationReviews", async () => {
    const t = convexTest(schema, modules);
    const studentId = await seedUser(t, "stud1", "student");
    await seedUser(t, "sup1", "supervisor");
    const appId = await t.run((ctx) =>
      ctx.db.insert("applications", {
        studentId,
        ...NEW_APPLICATION,
        status: "under_review",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );

    await t
      .withIdentity({ subject: "sup1" })
      .mutation(api.applications.supervisor.updateApplicationStatus, {
        id: appId,
        status: "accepted",
        supervisorRating: "excellent",
      });

    const app = await t.run((ctx) => ctx.db.get(appId));
    expect(app?.status).toBe("accepted");

    const reviews = await t.run((ctx) =>
      ctx.db
        .query("applicationReviews")
        .withIndex("by_application", (q) => q.eq("applicationId", appId))
        .collect(),
    );
    expect(reviews).toHaveLength(1);
    expect(reviews[0].fromStatus).toBe("under_review");
    expect(reviews[0].toStatus).toBe("accepted");
  });
});

describe("server-side upload size limit", () => {
  test("createApplication rejects a PDF that exceeds the 10MB cap", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "stud1", "student");
    const oversizedPdf = await t.run((ctx) =>
      ctx.storage.store(
        new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], {
          type: "application/pdf",
        }),
      ),
    );
    await expect(
      t
        .withIdentity({ subject: "stud1" })
        .mutation(api.applications.student.createApplication, {
          ...NEW_APPLICATION,
          pdfFileId: oversizedPdf,
        }),
    ).rejects.toThrow(/PDF/);
  });

  test("createApplication accepts a PDF within the cap", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "stud1", "student");
    const smallPdf = await t.run((ctx) =>
      ctx.storage.store(
        new Blob([new Uint8Array(1024)], { type: "application/pdf" }),
      ),
    );
    const appId = await t
      .withIdentity({ subject: "stud1" })
      .mutation(api.applications.student.createApplication, {
        ...NEW_APPLICATION,
        pdfFileId: smallPdf,
      });
    expect(appId).toBeDefined();
  });
});

describe("university email guard on user provisioning", () => {
  test("isUniversityEmail accepts ZUJ domains and rejects external ones", () => {
    expect(isUniversityEmail("ahmad@std-zuj.edu.jo")).toBe(true);
    expect(isUniversityEmail("ahmad@std.zuj.edu.jo")).toBe(true);
    expect(isUniversityEmail("DR.OMAR@zuj.edu.jo")).toBe(true);
    expect(isUniversityEmail("investor@gmail.com")).toBe(false);
    expect(isUniversityEmail("attacker@zuj.edu.jo.evil.com")).toBe(false);
  });

  test("the Clerk webhook ignores a non-university signup", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: {
        id: "clerk-ext",
        email_addresses: [{ email_address: "investor@gmail.com" }],
      },
    });
    const users = await t.run((ctx) => ctx.db.query("users").collect());
    expect(users).toHaveLength(0);
  });

  test("the Clerk webhook provisions a student for a university signup", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.users.handleClerkWebhook, {
      type: "user.created",
      data: {
        id: "clerk-stud",
        email_addresses: [{ email_address: "ahmad@std-zuj.edu.jo" }],
      },
    });
    const users = await t.run((ctx) => ctx.db.query("users").collect());
    expect(users).toHaveLength(1);
    expect(users[0].role).toBe("student");
    expect(users[0].clerkId).toBe("clerk-stud");
  });
});
