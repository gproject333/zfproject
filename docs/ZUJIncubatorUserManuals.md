# ZUJ Incubator (حاضنة الزيتونة) — User Manuals

*Four role-specific manuals for the ZUJ Incubator platform: Student, Supervisor, Sponsor, and Administrator. Each manual is self-contained and describes only the tasks available to that role. The interface is in Arabic (right-to-left); screen names below are given in English for this document with the Arabic context implied.*

**Common notes for every role**
- The platform is web-only; use a recent version of Chrome, Edge, Safari, or Firefox.
- Sign-in, sign-up, email verification, and password reset are handled by Clerk.
- A bell icon in the header shows your unread notification count; open it to read and mark notifications as read.
- A light/dark theme toggle is available in the header.
- If an action is not permitted for your role, the system shows a localised Arabic error and makes no change.

---

# Manual 1 — Student

## 1.1 Who this is for
Undergraduate students of Al-Zaytoonah University submitting an entrepreneurial idea, an IT graduation project, or a university-level entrepreneurial project. `student` is the default role on registration.

## 1.2 Creating your account
1. Open the platform and choose **Register**.
2. Enter your full name and your **university email** — it must end with `@std-zuj.edu.jo`, `@std.zuj.edu.jo`, or `@zuj.edu.jo`. Any other domain is rejected.
3. Enter your **9-digit university number**.
4. Submit; you will receive a **verification code** by email — enter it.
5. Set a password (minimum 8 characters), and for student emails select your **college** and **department**.
6. You are signed in and land on the student dashboard.

## 1.3 Completing your profile
- Go to **Profile** (`/student/profile`).
- Update your name, phone, college, department, university number, LinkedIn URL, and avatar image.
- Changing your avatar replaces the previous image.

## 1.4 Submitting an application
1. From the dashboard choose **New Application** and select one of the three tracks.
2. Fill the form. Required fields depend on the track; common fields include project name, description, the problem statement, and the target audience. Each field has a maximum length — the form tells you if you exceed it.
3. **Attach files (optional but recommended):** a PDF business plan (**max 10 MB**) and a pitch video (**max 100 MB**, formats mp4/mov/avi/webm). Oversized files are rejected by both the form and the server.
4. Choose **Save as draft** to continue later, or **Submit** to send it for review.
5. On submit, the status becomes *Under review* and all supervisors are notified.

## 1.5 Editing, resubmitting, and deleting
- You can **edit** an application only while it is *Draft* or *Needs modification*.
- If a supervisor sets your application to *Needs modification*, edit it and **Submit** again (this is a resubmission).
- You can **delete** an application only while it is *Draft* or *Rejected*.
- *Under review*, *Accepted*, and *Rejected* applications cannot be edited.

## 1.6 Tracking status and feedback
- The dashboard lists your applications with their current state: *Draft → Under review → Needs modification → Accepted / Rejected*.
- Open an application to see the **review history** — every supervisor decision, note, and rating, in order.
- You receive a notification whenever your application's status changes.

## 1.7 Learning content
- **Articles** (`/student/articles`) — markdown articles published by supervisors for students.
- **Entrepreneurial Guide** (`/student/entrepreneurial-guide`) — a curated list of videos, courses, and links.
- **Personal notes** — a private free-text notebook only you can see.

## 1.8 Requesting a supervisor upgrade
If you are a teaching assistant with a `@zuj.edu.jo` email, you may request promotion to *Supervisor* from your dashboard. An administrator reviews the request; you are notified of the decision. You may have only one pending request at a time.

---

# Manual 2 — Supervisor

## 2.1 Who this is for
Faculty members who review applications, mentor students, and publish learning content. Supervisor accounts are created by an administrator, or granted by approving a supervisor-upgrade request.

## 2.2 Signing in
Use the standard login with your `@zuj.edu.jo` credentials. You land on the supervisor dashboard.

## 2.3 The review queue
1. Open the **Applications** list (`/supervisor`). It shows all submitted applications (drafts are never shown).
2. Filter by **status** (Under review / Needs modification / Accepted / Rejected) and/or **track**, and sort by date.
3. Open an application to see the full submission, the attached PDF (previewed in-browser) and pitch video, and the student's details.

## 2.4 Reviewing an application
1. On the application screen, choose the new **status**. The system enforces the legal transitions:
   - *Under review* → *Needs modification*, *Accepted*, or *Rejected*.
   - *Accepted* and *Rejected* are final and cannot be changed.
2. Optionally add a **rating** (Excellent / Good / Average / Poor) and a **note** for the student.
3. Confirm. The system:
   - updates the application,
   - writes a permanent entry to the **review history** (it can never be edited or deleted),
   - sends the student a *status change* notification.
4. An illegal transition (e.g. trying to reopen an *Accepted* application) is rejected with a message.

## 2.5 Bulk review
From the list you can select multiple applications and apply one status change to all of them at once (up to 100). Applications for which the transition is illegal are skipped and reported back to you; the rest are processed normally.

## 2.6 Real-time presence
When you open an application, other supervisors viewing the same application appear as live presence indicators — this avoids two supervisors reviewing the same submission at once.

## 2.7 Publishing content
- **Articles** (`/supervisor/articles`) — write markdown articles, attach an optional cover image, choose the audience (students / supervisors / all), and publish or keep as draft.
- **Banners** (`/supervisor/banners`) — create text, scrolling, or hero banners with a variant (info/success/warning), an audience, an optional expiry, and optional media. Creating an active *scrolling* banner for students sends them an announcement notification.
- **Entrepreneurial Guide** (`/supervisor/entrepreneurial-guide`) — add, edit, or remove videos, courses, and links. Every change is recorded in the activity log.

## 2.8 Profile
Manage your name, phone, department, LinkedIn, and avatar from **Profile** (`/supervisor/profile`).

---

# Manual 3 — Sponsor

## 3.1 Who this is for
External entrepreneurs, investors, or CSR representatives interested in funding student projects. **Sponsor accounts are created by an administrator** — sponsors do not self-register.

## 3.2 Signing in
Use the sponsor login (`/sponsor/login`) with the credentials provided by the incubator office.

## 3.3 The reels feed
- The sponsor dashboard (`/sponsor`) is an **Instagram-style vertical feed**. Scroll (or swipe on mobile) to move between projects.
- Each slide shows one submitted project that has a pitch video — the video plays inline, with the project name, track, and description overlaid.
- The feed shows projects that are *Under review*, *Needs modification*, or *Accepted* (and that have a video). Drafts and rejected projects are never shown.

## 3.4 Expressing interest
- Tap the **heart** on any project to mark it as *Interested*; tap again to remove your interest.
- Your interest is saved per project — the heart shows pre-filled on projects you have already marked.
- You do not need an administrator to assign you a project before expressing interest; the assignment record is created automatically the first time you tap the heart.

## 3.5 Viewing a project
Open a project (`/sponsor/projects/[id]`) to see its full details and your assignment/interest record for that project.

---

# Manual 4 — Administrator

## 4.1 Who this is for
Incubator-office staff with full institutional control. The **first administrator is seeded manually** during onboarding; the system cannot create the first admin on its own.

## 4.2 Signing in
Use the admin login (`/admin/login`). You land on the admin dashboard (`/admin`).

## 4.3 Dashboard & analytics
The dashboard shows portfolio analytics: user counts by role, applications by status, student distribution by college, and monthly registration trends (trailing 12 months), rendered as charts and tables. These views are visible to administrators only.

## 4.4 Managing colleges & departments
At **Colleges** (`/admin/colleges`):
- Create, rename, or delete a college. **Deleting a college also deletes all of its departments.**
- Add, rename, or delete departments under each college.
- A one-time **Seed** action populates a default set of Al-Zaytoonah colleges and departments; it is refused if any college already exists.

## 4.5 Managing users
- **Students** (`/admin/students`) — search and filter students by college/department; see each student's application count; activate or deactivate accounts.
- **Supervisors** (`/admin/supervisors`) — search supervisors; create a new supervisor account (this also creates their Clerk login).
- **Sponsors** (`/admin/sponsors`) — create sponsor accounts (this also creates their Clerk login) and manage sponsor–project assignments.
- Deactivating a user sets their account inactive (a soft action — the record is kept) and is written to the activity log.

## 4.6 Supervisor upgrade requests
At **Upgrade Requests** (`/admin/upgrade-requests`):
- Review pending requests submitted by `@zuj.edu.jo` students.
- **Approve** (the student's role becomes *Supervisor*, and they are notified) or **Reject** (they are notified). A request can be decided only once.
- Every decision is recorded in the activity log.

## 4.7 Sponsor assignments
From the sponsors area you can explicitly assign a sponsor to a specific project, or remove an assignment. (Sponsors can also self-express interest from their feed — see Manual 3.)

## 4.8 Social links
At **Social** (`/admin/social`) manage the institutional social-media links shown in the site footer: add, edit, reorder, activate/deactivate, or delete links. URLs must be valid (`http(s):`, `mailto:`, `tel:`, or a bare domain).

## 4.9 Activity log
The administrator can review the global, append-only **activity log** — every consequential action (user activation, upgrade-request decisions, guide changes, …) with the actor, the action, the affected entity, and a timestamp. Log entries can never be edited or deleted.

---

# Appendix — Application States (all roles)

| State | Meaning | Who can act |
|---|---|---|
| Draft | Created, not yet submitted | Student (edit / submit / delete) |
| Under review | Submitted, awaiting a supervisor | Supervisor (set to needs-modification / accepted / rejected) |
| Needs modification | Returned for changes | Student (edit and resubmit) |
| Accepted | Approved — final | — (terminal) |
| Rejected | Declined — final | Student (may delete) |
