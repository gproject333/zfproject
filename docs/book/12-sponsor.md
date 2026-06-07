# الفصل الثاني عشر: الرعاة — applications/sponsor.ts

> **قبل هذا الفصل يجب أن تعرف:** [الفصل الحادي عشر — الأجزاء المشتركة](./11-shared-applications.md)

## ما الذي سنتعلمه في هذا الفصل؟

سنفهم كيف يتصفح الراعي المشاريع المقبولة، كيف يُعرب عن اهتمامه، وكيف تعمل العلاقة Many-to-Many بين الرعاة والمشاريع.

---

## Many-to-Many: راعي ↔ مشروع

```
جدول sponsorAssignments
┌──────────────┬─────────────────┬──────────────┐
│ sponsorId    │ applicationId   │ isInterested │
├──────────────┼─────────────────┼──────────────┤
│ sponsor_A    │ app_1           │ true         │
│ sponsor_A    │ app_2           │ false        │
│ sponsor_B    │ app_1           │ true         │
└──────────────┴─────────────────┴──────────────┘

→ راعي واحد يمكنه الاهتمام بعدة مشاريع
→ مشروع واحد يمكن أن يهتم به عدة رعاة
```

---

## mySponsoredApplications — تغذية المشاريع

الراعي يرى المشاريع المقبولة كـ "feed" مشابه لـ Instagram Reels:

```typescript
export const mySponsoredApplications = query({
  args: {},
  handler: async (ctx) => {
    const sponsor = await requireUser(ctx);
    if (sponsor.role !== "sponsor") return [];

    // جلب كل المشاريع المقبولة
    const accepted = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .collect();

    // جلب اهتمامات هذا الراعي تحديداً
    const assignments = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor", (q) => q.eq("sponsorId", sponsor._id))
      .collect();

    // بناء Map سريع: applicationId → هل أبدى اهتماماً؟
    const interestMap = new Map(
      assignments.map((a) => [a.applicationId, a.isInterested ?? false])
    );

    // فقط المشاريع التي لها فيديو (هذه هي الـ "reels")
    const withVideo = accepted.filter((app) => app.videoFileId);

    // إثراء كل مشروع ببيانات إضافية
    const enriched = await Promise.all(
      withVideo.map(async (app) => {
        const videoUrl = await ctx.storage.getUrl(app.videoFileId!);
        const pdfUrl = app.pdfFileId ? await ctx.storage.getUrl(app.pdfFileId) : null;

        // جلب صورة الطالب
        const student = await ctx.db.get(app.studentId);
        const avatarUrl = student?.avatar
          ? await ctx.storage.getUrl(student.avatar)
          : null;

        return {
          ...app,
          videoUrl,
          pdfUrl,
          studentAvatarUrl: avatarUrl,
          isInterested: interestMap.get(app._id) ?? false,
        };
      })
    );

    return enriched.sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0));
  },
});
```

**`Promise.all`:** بدلاً من انتظار كل URL واحداً بعد الآخر، نطلبهم جميعاً في نفس الوقت (parallel). هذا أسرع بكثير.

---

## toggleSponsorInterest — قلب الاهتمام

```typescript
export const toggleSponsorInterest = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const sponsor = await requireUser(ctx);
    if (sponsor.role !== "sponsor") throw new Error("غير مصرح");

    // هل يوجد assignment سابق؟
    const existing = await ctx.db
      .query("sponsorAssignments")
      .withIndex("by_sponsor_application", (q) =>
        q.eq("sponsorId", sponsor._id).eq("applicationId", args.applicationId)
      )
      .unique();

    if (existing) {
      // موجود → قلب الاهتمام
      const newInterest = !existing.isInterested;
      await ctx.db.patch(existing._id, {
        isInterested: newInterest,
        // إذا أصبح مهتماً: امسح "تم التواصل" (تريد التواصل من جديد)
        ...(newInterest && { adminContactedAt: undefined }),
      });

      // إشعار فقط عند التفعيل (لا نُزعج عند الإلغاء)
      if (newInterest) {
        await notifyInterest(ctx, sponsor, args.applicationId);
      }
    } else {
      // لا يوجد → أنشئ assignment جديد بـ isInterested: true
      await ctx.db.insert("sponsorAssignments", {
        sponsorId: sponsor._id,
        applicationId: args.applicationId,
        assignedBy: sponsor._id,
        isInterested: true,
        createdAt: Date.now(),
      });

      await notifyInterest(ctx, sponsor, args.applicationId);
    }
  },
});
```

---

## notifyInterest — إشعار الاهتمام

```typescript
// دالة مساعدة داخلية
async function notifyInterest(ctx, sponsor, applicationId) {
  const app = await ctx.db.get(applicationId);
  if (!app) return;

  // 1. أشعر الطالب: "راعي اهتم بمشروعك!"
  await ctx.db.insert("notifications", {
    userId: app.studentId,
    title: "اهتمام راعٍ بمشروعك",
    message: `${sponsor.name ?? "راعٍ"} اهتم بمشروع "${app.projectName}"`,
    type: "assignment",
    applicationId,
    read: false,
    requireAck: false,  // FYI فقط — لا يحتاج تأكيداً
    createdAt: Date.now(),
  });

  // 2. أشعر كل المشرفين: "فرصة للتواصل مع الراعي"
  await notifyAllSupervisors(ctx, {
    title: "راعٍ أعرب عن اهتمامه",
    message: `${sponsor.name ?? "راعٍ"} مهتم بمشروع "${app.projectName}"`,
    type: "assignment",
    applicationId,
  });
}
```

**حدث واحد يولّد إشعارات متعددة:**
- الطالب يعرف أن شخصاً اهتم بمشروعه
- المشرفون يعلمون بالفرصة ليتابعوها

---

## markSponsorContacted — تتبع التواصل

```typescript
export const markSponsorContacted = mutation({
  args: { assignmentId: v.id("sponsorAssignments") },
  handler: async (ctx, args) => {
    await requireSupervisor(ctx);

    await ctx.db.patch(args.assignmentId, {
      adminContactedAt: Date.now(),
    });
  },
});
```

بسيطة جداً — لكنها مهمة لتتبع حالة "هل تواصلنا مع هذا الراعي؟"

في الواجهة يظهر:
- `adminContactedAt = undefined` → "بانتظار التواصل" 🟡
- `adminContactedAt = تاريخ` → "تم التواصل" 🟢

---

## getStudentForAcceptedApplication — إخفاء الخصوصية

```typescript
export const getStudentForAcceptedApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const sponsor = await requireUser(ctx);
    if (sponsor.role !== "sponsor") return null;

    const app = await ctx.db.get(args.applicationId);
    if (!app) return null;

    // الراعي يرى بيانات الطالب فقط إذا قُبل الطلب
    if (app.status !== "accepted") return null;

    const student = await ctx.db.get(app.studentId);
    if (!student) return null;

    // إعادة فقط المعلومات العامة (ليس كل شيء)
    return {
      name: student.name,
      email: student.email,
      phone: student.phone,
      linkedinUrl: student.linkedinUrl,
      avatarUrl: student.avatar ? await ctx.storage.getUrl(student.avatar) : null,
    };
  },
});
```

**مبدأ "Minimum Exposure":** الراعي لا يحتاج معرفة `clerkId` أو `isActive` أو غيرها من الحقول الحساسة — نُعيد فقط ما يحتاجه.

---

## ملخص الفصل الثاني عشر

- `sponsorAssignments` يُطبّق علاقة Many-to-Many بين الرعاة والمشاريع
- `mySponsoredApplications` يجلب المشاريع المقبولة مع URLs الملفات وبيانات الاهتمام
- `Promise.all` يُوازي جلب URLات متعددة بدلاً من الانتظار الواحدة بعد الأخرى
- `toggleSponsorInterest` يُنشئ assignment أو يقلب `isInterested`
- الإشعار يصل للطالب **وللمشرفين** عند كل اهتمام
- `getStudentForAcceptedApplication` يُطبّق Minimum Exposure — يُعيد فقط البيانات الضرورية

---

**السابق:** [الفصل الحادي عشر — الأجزاء المشتركة](./11-shared-applications.md)  
**التالي:** [الفصل الثالث عشر — نظام الإشعارات](./13-notifications.md)
