# شرح الباك اند — منصة Smart-ZUJ
### عرض تقديمي شامل (Convex Backend)

---

## السلايد 1 — نظرة عامة على المعمارية

- المشروع **Monorepo** بنظام pnpm workspaces مكوّن من 3 حزم:
  - `packages/web` → الواجهة (Next.js 16 App Router)
  - `packages/convex` → **الباك اند كاملاً** (Convex)
  - `packages/core` → كود TypeScript مشترك بين الواجهة والباك اند
- التقنيات الأساسية: **Next.js + Convex + Clerk**
  - Convex = قاعدة البيانات + الدوال الخلفية + الملفات + الجدولة (كلها في مكان واحد)
  - Clerk = إدارة الهوية وتسجيل الدخول (JWT)

---

## السلايد 2 — ما هو Convex ولماذا؟

- Convex هو **Backend-as-a-Service** بنمط reactive:
  - **Query** → قراءة من قاعدة البيانات، **تتحدّث تلقائياً (real-time)** عند تغيّر البيانات — لا حاجة لـ polling أو refresh
  - **Mutation** → كتابة على قاعدة البيانات (transactional)
  - **Action** → استدعاءات خارجية (HTTP لخدمات خارجية مثل n8n) — لا تلمس قاعدة البيانات مباشرة
- **التوجيه ملفّي (file-based routing):**
  - `convex/applications/student.ts` → يُستدعى من الواجهة كـ `api.applications.student.*`
  - الدوال الداخلية `internalMutation/internalQuery/internalAction` → غير قابلة للاستدعاء من المتصفح إطلاقاً (`internal.*`)
- كل دالة لها **مدقّقات معاملات** (`v.string()`, `v.id("users")`, ...) إجبارية

---

## السلايد 3 — تدفق المصادقة (Auth Flow)

```
المتصفح ──Clerk JWT──▶ ConvexProviderWithClerk ──▶ Convex
                                                    │
                              auth.config.ts يتحقق من التوكن
                                                    │
                          ctx.auth.getUserIdentity() داخل كل دالة
```

1. المستخدم يسجل دخوله عبر **Clerk** في الواجهة
2. كل طلب لـ Convex يحمل JWT يتم التحقق منه ضد `auth.config.ts` (المُصدر: `CLERK_JWT_ISSUER_DOMAIN`)
3. عند إنشاء/تعديل/حذف حساب في Clerk → **Webhook** يصل إلى `http.ts` على المسار `/clerk-user-webhook`:
   - يتحقق من التوقيع عبر مكتبة **svix**
   - يستدعي `internal.users.webhook.handleClerkWebhook` لمزامنة جدول `users`

---

## السلايد 4 — طبقة الصلاحيات (lib/auth.ts)

نقطة فرض مركزية واحدة لكل الأدوار — كل دالة محمية تبدأ بأحد هذه المساعدات:

| الدالة | السلوك |
|---|---|
| `requireUser` | يرمي خطأ إن لم يسجل دخول **أو إن كان الحساب مجمّداً** (`isActive === false`) |
| `requireStudent` | طالب فقط |
| `requireSupervisor` | مشرف **أو** أدمن |
| `requireAdmin` | أدمن فقط |
| `getOptionalUser / Supervisor / Admin` | ترجع `null` بدلاً من الخطأ — للاستعلامات التي يجب أن تعود فارغة بهدوء |

- **قاعدة ذهبية:** لا يُمرَّر `userId` من العميل أبداً — الهوية تُشتق من التوكن على الخادم
- تجميد الحساب من الأدمن يقطع كل الدوال المحمية من نقطة واحدة

---

## السلايد 5 — مخطط قاعدة البيانات (schema.ts)

ملف واحد هو مصدر الحقيقة لكل الجداول (~16 جدولاً):

| المجموعة | الجداول |
|---|---|
| المستخدمون | `users`, `colleges`, `departments` |
| الطلبات | `applications`, `applicationReviews`, `sponsorAssignments` |
| التواصل | `notifications`, `meetings`, `whatsappVerifications`, `whatsappOutbox` |
| المحتوى | `articles`, `banners`, `entrepreneurialGuide`, `socialLinks` |
| أخرى | `studentNotes`, `supervisorUpgradeRequests`, `activityLogs` |

- كل علاقة بين جدولين تستخدم `v.id("tableName")` (وليس string) → الـ type system يكشف الأخطاء وقت الترجمة
- كل استعلام يمر عبر **index** مسمّى بأعمدته (مثل `by_student_status`) — ممنوع `.filter()`

---

## السلايد 6 — جدول المستخدمين (users) والأدوار

- صف واحد لكل هوية Clerk (`clerkId` هو مفتاح الربط)
- **4 أدوار** تحدد الصلاحيات ولوحة التحكم التي يوجَّه إليها المستخدم:
  - `student` (طالب) — `supervisor` (مشرف) — `admin` (مدير) — `sponsor` (راعٍ/ممول)
- حقول خاصة بالطالب: `studentId`, `collegeId`, `departmentId` (مراجع FK منظمة لجداول الكليات/الأقسام)
- أعلام نظامية: `isActive` (التجميد), `whatsappVerified`, `whatsappOptOut`
- فهارس: `by_clerkId`, `email`, `phone`, `by_role`, `by_studentId`

---

## السلايد 7 — الطلبات (applications): قلب النظام

طلبات الاحتضان/المشاريع — **3 مسارات**:
1. `entrepreneurial_idea` — فكرة ريادية
2. `it_graduation` — مشروع تخرج IT
3. `university_entrepreneurial` — مشروع ريادي للجامعة

**آلة الحالات (State Machine):**

```
draft ──تقديم──▶ under_review ──قرار المشرف──▶ accepted ✅ (نهائية)
                      ▲                    ├──▶ rejected ❌ (نهائية)
                      │                    └──▶ needs_modification
                      └────الطالب يعدّل ويعيد التقديم────┘
```

- `draft` لا يراه المشرف أبداً
- كل تغيير حالة **يجب** أن يُسجَّل أيضاً في `applicationReviews` (سجل تدقيق غير قابل للتعديل: من قرّر، ماذا، متى، التقييم، الملاحظات)
- المرفقات: `pdfFileId` و `videoFileId` (تخزين Convex `_storage`)

---

## السلايد 8 — دوال الطلبات حسب الدور (applications/)

**`student.ts`** (للطالب):
- `myApplications`, `createApplication`, `updateApplication`, `submitApplication`, `deleteApplication`

**`supervisor.ts`** (للمشرف):
- `listApplicationsWithStudent` (قائمة المراجعة مع بيانات الطالب)، `nextPendingApplication`
- `updateApplicationStatus` و `bulkUpdateStatus` → تغيّر الحالة + تكتب صف مراجعة + ترسل إشعاراً للطالب
- `getReviewHistory`, `applicationsByStatus`, `recentActivity`, `filterFacets`

**`sponsor.ts`** (للراعي):
- `assignSponsor` / `removeSponsorAssignment` (ربط راعٍ بمشروع — many-to-many عبر `sponsorAssignments`)
- `toggleSponsorInterest` (الراعي يسجل اهتمامه) → `markSponsorContacted` (الإدارة تواصلت معه)

**`shared.ts`**: `getApplication`, `applicationStats`

---

## السلايد 9 — الإشعارات (notifications.ts)

- صندوق وارد لكل مستخدم (جرس الإشعارات في الواجهة)
- 8 أنواع تحدد الأيقونة ووجهة الرابط: `status_change`, `new_note`, `new_application`, `assignment`, `announcement`, `system`, `upgrade_request`, `meeting`
- بعض الإشعارات تتطلب **تأكيداً صريحاً** من المستخدم: `requireAck` + `ackedAt`
- الدوال: `myNotifications`, `unreadCount`, `markAsRead`, `markAllAsRead`, `acknowledgeNotification`
- `cleanupOld` (داخلية) → تعمل عبر **cron يومي** لحذف الإشعارات القديمة
- الإنشاء يتم عبر مساعد مشترك في `lib/notifications.ts` تستدعيه باقي الدوال

---

## السلايد 10 — تكامل واتساب (whatsapp/)

**التحقق برمز OTP** (`otp.ts` — عام):
1. `requestWhatsappOtp` → يولّد رمزاً، يخزّن **SHA-256 hash فقط** في `whatsappVerifications`، ويجدول action للإرسال
2. الإرسال الفعلي عبر **n8n** (خدمة خارجية) من `actions.ts` → `sendOtp`
3. `verifyWhatsappOtp` → يقارن الـ hash، مع عدّاد محاولات وصلاحية زمنية، ثم يضع `whatsappVerified = true`
4. `setWhatsappOptOut` → إيقاف الإشعارات

**نمط Outbox المتين** (`whatsappOutbox`):
- كل إرسال = صف بحالة `queued` → الـ action يحدّثه إلى `sent` أو `failed`
- cron يومي `retryFailed` يعيد محاولة الفاشلة
- أنواع الرسائل: `otp`, `meeting`, `status_change`
- صفحة سجل للأدمن: `admin.ts → listOutbox`

---

## السلايد 11 — إدارة المستخدمين (users/)

- **`shared.ts`** (الجميع): `currentUser`, `updateProfile`, الصورة الشخصية (رفع/جلب/حذف), `myAcademicNames`
- **`admin.ts`** (الأدمن): `getAllUsers`, `toggleUserActive` (تجميد/تفعيل), `updateUserByAdmin`, `deleteUserCascade` (حذف متسلسل لكل بيانات المستخدم), إحصائيات لوحة الأدمن (`getAdminStats`, توزيع الطلاب على الكليات, إحصائيات التسجيل الشهرية...)
- **`adminActions.ts`** (actions): إنشاء حسابات مشرف/راعٍ/أدمن **عبر Clerk API** ثم إدراجها بقاعدة البيانات, `deleteUserByAdmin` (يحذف من Clerk + Convex)
- **`webhook.ts`**: `handleClerkWebhook` — مزامنة إنشاء/تحديث/حذف المستخدمين من Clerk
- **`dev.ts`**: دوال تطوير فقط (`makeMeAdmin`...)

---

## السلايد 12 — المحتوى والإدارة

- **`articles.ts`** — مقالات بمحرر Markdown يكتبها المشرفون: صورة غلاف، وسوم، جمهور (`student`/`supervisor`/`all`)، ونشر/مسودة (`isPublished`)
- **`banners.ts`** — إعلانات بثلاثة أشكال: بطاقة نصية / شريط متحرك (scrolling) / كاروسيل Hero (صورة/فيديو/يوتيوب)، مع جمهور مستهدف وانتهاء صلاحية تلقائي (`expiresAt`)
- **`entrepreneurialGuide.ts`** — موارد تعليمية للطلاب (فيديو/كورس/رابط)
- **`socialLinks.ts`** — روابط التواصل في الفوتر (يديرها الأدمن، بترتيب يدوي)
- **`colleges.ts`** — الكليات والأقسام (CRUD للأدمن + seed أولي)

---

## السلايد 13 — ميزات مساندة

- **`meetings.ts`** — جدولة خفيفة: المشرف يسجل اجتماعاً مع طالب (موعد + مكان + ملاحظات + ربط اختياري بمشروع) → يصل إشعار وواتساب للطالب
- **`studentNotes.ts`** — مفكرة خاصة للطالب (`saveNote` / `getMyNote`)
- **`supervisorUpgradeRequests.ts`** — طلب ترقية طالب → مشرف: `submitRequest` (مع مبرر) → يراجعه الأدمن عبر `reviewRequest` (موافقة/رفض) → تتغير صلاحية المستخدم
- **`activityLogs.ts`** — سجل نشاط append-only لكل الأفعال المهمة، يظهر للأدمن للتتبع (`log` داخلية تستدعيها باقي الدوال)
- **`files.ts`** — رفع الملفات: `generateUploadUrl` (رابط رفع مؤقت لتخزين Convex) + `getFileUrl`

---

## السلايد 14 — HTTP والمهام المجدولة

**`http.ts`** — نقطة HTTP وحيدة:
- `POST /clerk-user-webhook` → تحقق توقيع svix → مزامنة المستخدمين

**`crons.ts`** — مهمتان يوميتان (3:00 و 4:00 UTC ≈ ساعة هادئة بتوقيت عمّان):
1. `cleanup-old-notifications` → حذف الإشعارات القديمة
2. `whatsapp-retry-failed` → إعادة محاولة رسائل الواتساب الفاشلة

**`seed/`** — بذور بيانات تجريبية تُشغَّل يدوياً: `npx convex run seed/content:bootstrap`

---

## السلايد 15 — المكتبة المشتركة (lib/)

| الملف | الدور |
|---|---|
| `auth.ts` | كل مساعدات الصلاحيات (`require*` / `getOptional*`) |
| `notifications.ts` | إنشاء الإشعارات بشكل موحّد |
| `activity.ts` | تسجيل النشاط في `activityLogs` |
| `statuses.ts` | ثوابت وأسماء الحالات (آلة الحالات) |
| `uploads.ts` | مساعدات رفع الملفات |
| `users.ts` | مساعدات قراءة المستخدمين |
| `validation.ts` | تحققات مشتركة (هاتف، روابط...) |

- الاختبارات **vitest** بجوار الملفات (`*.test.ts`)
- `_generated/` — يولَّد تلقائياً، لا يُعدَّل يدوياً

---

## السلايد 16 — النشر (Deployment)

بيئتا إنتاج **يجب تحديثهما معاً** بعد أي تغيير في السكيمة أو الدوال:

| البيئة | الرابط |
|---|---|
| ☁️ Convex Cloud | `trustworthy-sheep-722.eu-west-1.convex.cloud` |
| 🏠 Self-Hosted (Coolify) | `convex.yazeid.site` |
| 🖥️ تطوير محلي | `127.0.0.1:3210` |

```bash
cd packages/convex && bash deploy.sh   # ينشر للسحابة أولاً ثم Self-Hosted
```

- أسرار Self-Hosted في `.env.selfhosted` (غير مرفوعة على git)
- لوحة Self-Hosted: `convex-dash.yazeid.site`

---

## السلايد 17 — القواعد الذهبية للباك اند

1. ✅ مدقّق معاملات (`v.*`) على **كل** دالة بلا استثناء
2. 🚫 ممنوع `.filter()` في الاستعلامات — استخدم `.withIndex()` دائماً
3. 🚫 ممنوع `.collect()` على جداول غير محدودة — `.take(n)` أو pagination
4. 🚫 لا تمرر `userId` كمعامل للتفويض — اشتقه من `ctx.auth.getUserIdentity()`
5. 🔒 أي دالة لا يجب أن يستدعيها العميل = `internal*`
6. 📝 كل تغيير حالة طلب = صف جديد في `applicationReviews` (سجل التدقيق)
7. 📦 الـ Actions لا تستخدم `ctx.db` — وكود Node.js في ملفات منفصلة بـ `"use node";`
8. 🚀 بعد أي تغيير: انشر على **البيئتين** معاً

---

## السلايد 18 — الخلاصة: رحلة طلب من البداية للنهاية

1. الطالب يسجل عبر Clerk → webhook ينشئ صفه في `users`
2. ينشئ طلباً (`draft`) ويرفع PDF/فيديو → `submitApplication` → `under_review`
3. المشرف يراجع → `updateApplicationStatus`:
   - صف تدقيق في `applicationReviews`
   - إشعار داخل المنصة + رسالة واتساب (عبر outbox → n8n)
4. عند القبول: الأدمن يربط راعياً (`assignSponsor`) → الراعي يسجل اهتمامه → الإدارة تتواصل
5. المشرف يجدول اجتماعاً مع الطالب → إشعار + واتساب
6. كل خطوة مسجلة في `activityLogs` ومرئية للأدمن

> باك اند واحد متماسك: قاعدة بيانات + صلاحيات + إشعارات real-time + تكاملات خارجية — كله TypeScript داخل `packages/convex/convex/`
