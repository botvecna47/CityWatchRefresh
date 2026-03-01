# CityWatch — 8-Week Solo Implementation Plan

**Developer:** Solo (You — Frontend + Backend)
**Hours/Day:** 3–4 hours (~21–28 hrs/week)
**Strategy:** Feature-first. Build each feature fully (backend → frontend → connect) before moving to the next. This avoids context-switching and gives you a working demo at the end of every week.

---

## Week 1 — Environment Setup + Authentication (Days 1–7)

### Goal: Both projects running. Login/Register working end-to-end.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 1 | Setup | Install JDK 17, Node 18, PostgreSQL 15, Git, VS Code | Dev environment ready |
| 1 | Backend | Generate Spring Boot project (Web, Security, JPA, PostgreSQL driver) | `backend/` project |
| 1 | Frontend | Run `npx create-vite@latest frontend -- --template react` | `frontend/` project |
| 2 | Backend | Create PostgreSQL DB `citywatch`. Configure `application.properties` (datasource, JWT secret) | DB connected |
| 2 | Backend | Create `User` entity, `UserRepository`, enums (`Role`, `TrustLevel`, `UserStatus`) | Entity + enum package |
| 3 | Backend | Implement `JwtUtil` (generate, validate, extract), `BCrypt` password hashing | `util/JwtUtil.java` |
| 3 | Backend | Implement `AuthService` (register, login), `AuthController` (POST /auth/register, /auth/login) | Auth API working |
| 4 | Backend | Implement JWT filter chain, `SecurityConfig`, CORS config | Security pipeline complete |
| 4 | Backend | Test auth in Postman (register, login, access protected endpoint) | Auth tested ✅ |
| 5 | Frontend | Set up folder structure: `components/`, `pages/`, `hooks/`, `services/`, `styles/` | Structure ready |
| 5 | Frontend | Create Axios instance with base URL + JWT interceptor | `services/api.js` |
| 5 | Frontend | Build auth hook (store JWT, decode role, logout) | `hooks/useAuth.js` |
| 6 | Frontend | Build Login page (form, validation, error display) | `pages/LoginPage.jsx` |
| 6 | Frontend | Build Register page (form, validation, password strength) | `pages/RegisterPage.jsx` |
| 7 | Frontend | Set up routing: PublicRoute, ProtectedRoute, role-based redirect | `App.jsx` with router |
| 7 | Integration | Connect frontend auth to backend. Test register → login → dashboard redirect | **E2E auth working** |

### Week 1 Checkpoint ✅
```
[ ] PostgreSQL running with citywatch DB
[ ] Backend: POST /auth/register and /auth/login return JWT
[ ] Frontend: Login + Register pages functional
[ ] Integration: Register → Login → redirects to correct dashboard
[ ] JWT stored in localStorage, sent on all API calls
```

### 🎯 You can demo: "User registration and login"

---

## Week 2 — Complaint Submission (Days 8–14)

### Goal: Citizen can submit a complaint with live photo + GPS. Stored in DB.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 8 | Backend | Create `Area` entity + `AreaRepository` + seed 4 areas with bounding boxes | Areas table ready |
| 8 | Backend | Create `Complaint` entity with all fields, `ComplaintRepository` | Complaint entity |
| 9 | Backend | Create `HaversineUtil` for distance calculations | `util/HaversineUtil.java` |
| 9 | Backend | Implement `ComplaintService.create()`: validate trust, rate limit (5/day), assign area from GPS | Service layer |
| 10 | Backend | Implement duplicate detection (100m radius, same category, 7 days) | Duplicate check |
| 10 | Backend | Implement image upload handling (save to disk, validate type/size, strip EXIF) | `util/ImageUtil.java` |
| 10 | Backend | Create `ComplaintController`: POST /complaints, GET /complaints, GET /complaints/{id} | Controller ready |
| 11 | Backend | Add pagination + filtering (status, category, area) to GET endpoint | Filtered queries |
| 11 | Backend | Test all complaint endpoints in Postman | Tested ✅ |
| 12 | Frontend | Build WebRTC camera component | `components/CameraCapture.jsx` |
| 12 | Frontend | Build GPS capture hook + error handling | `hooks/useGeolocation.js` |
| 13 | Frontend | Build Submit Wizard: Step 1 (Category), Step 2 (Description + char counter) | Wizard steps 1-2 |
| 13 | Frontend | Build Submit Wizard: Step 3 (Photo capture), Step 4 (GPS + mini map) | Wizard steps 3-4 |
| 14 | Frontend | Build Submit Wizard: Step 5 (Review + submit). Connect to backend | Full wizard working |
| 14 | Frontend | Build "My Complaints" list page with complaint cards | Complaint list |

### Week 2 Checkpoint ✅
```
[ ] Citizen can submit complaint through 5-step wizard
[ ] Camera captures live photo (no file upload)
[ ] GPS auto-captured and area assigned
[ ] Rate limit (5/day) enforced
[ ] Complaint appears in "My Complaints" list
[ ] Images saved to disk, served via API
```

### 🎯 You can demo: "Complete complaint submission flow"

---

## Week 3 — Voting System + Coordinator Dashboard (Days 15–21)

### Goal: Coordinators can vote on complaints. Majority triggers status change.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 15 | Backend | Create `Vote` entity with UNIQUE(complaint_id, coordinator_id) constraint | Vote table |
| 15 | Backend | Implement `VoteService.castVote()`: check area, check status, check not duplicated | Vote logic |
| 16 | Backend | Implement majority calculation: ≥60% VALID → APPROVED, ≥60% INVALID → REJECTED (strike++) | Majority logic |
| 16 | Backend | Handle tie → auto-escalate to admin. Create `Escalation` entity | Escalation table |
| 17 | Backend | Create `VoteController`: POST /votes, GET /complaints/{id}/votes | Vote API |
| 17 | Backend | Ensure individual vote decisions are hidden (API returns count + own vote only) | Hidden votes |
| 18 | Backend | Test voting scenarios in Postman: valid majority, invalid majority, tie, double-vote, wrong area | Tested ✅ |
| 19 | Frontend | Build Coordinator Dashboard (stats, pending count, assigned count) | `pages/coordinator/Dashboard.jsx` |
| 19 | Frontend | Build "Pending Reviews" list (complaints in coordinator's area) | `pages/coordinator/PendingReviews.jsx` |
| 20 | Frontend | Build Complaint Detail page (photo, description, map, status timeline) | `pages/ComplaintDetail.jsx` |
| 20 | Frontend | Build Vote Panel (Valid/Invalid/Clarify buttons + comment) | `components/VotePanel.jsx` |
| 21 | Frontend | Connect voting to backend. Test full flow: submit complaint → coordinator votes → status changes | **E2E voting working** |

### Week 3 Checkpoint ✅
```
[ ] Coordinator sees pending complaints in their area
[ ] Voting works: 3 options + optional comment
[ ] Majority VALID → APPROVED
[ ] Majority INVALID → REJECTED + citizen strike
[ ] Double-voting blocked (UNIQUE constraint)
[ ] Tie → escalation created
```

### 🎯 You can demo: "Distributed validation system"

---

## Week 4 — Auto-Assignment + SLA Tracking (Days 22–28)

### Goal: Approved complaints auto-assign. SLA timer starts. Overdue = escalation.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 22 | Backend | Create `SlaConfig` entity + seed deadlines (Garbage=72h, Pothole=168h, etc.) | SLA table |
| 22 | Backend | Implement `AssignmentService.autoAssign()`: random coordinator (load-balanced), exclude previous | Auto-assignment |
| 23 | Backend | Calculate SLA deadline on assignment: `NOW() + sla_hours` | Deadline logic |
| 23 | Backend | Implement `@Scheduled` SLA checker (every 60 min): find overdue → DELAYED → escalation | `scheduler/SlaScheduler.java` |
| 24 | Backend | Implement 3-level escalation (Level 1: 0-24h, Level 2: 24-48h, Level 3: 48h+) | Escalation levels |
| 24 | Backend | Create `Notification` entity + `NotificationService` (create, mark read, get unread) | Notification system |
| 25 | Backend | Auto-generate notifications on: status change, assignment, SLA warning | Event notifications |
| 25 | Backend | Test SLA with short deadlines (5 min) in Postman | SLA tested ✅ |
| 26 | Frontend | Build "Assigned Complaints" page for coordinator (with SLA countdown) | `pages/coordinator/AssignedComplaints.jsx` |
| 26 | Frontend | Build SLA countdown timer + warning indicators (green/yellow/red) | SLA visual states |
| 27 | Frontend | Build Notification panel (dropdown, unread badge, mark read) | `components/NotificationPanel.jsx` |
| 27 | Frontend | Build Navbar (role-based links, notification badge, profile) | `components/Navbar.jsx` |
| 28 | Frontend | Connect assignment + notifications to backend. Test flow: vote approve → auto-assign → SLA | **E2E assignment working** |

### Week 4 Checkpoint ✅
```
[ ] Approved complaints auto-assign to random coordinator
[ ] SLA deadline calculated and displayed
[ ] Scheduler detects overdue → creates escalation
[ ] Notifications appear on status changes
[ ] Coordinator sees assigned list with SLA timer
```

### 🎯 You can demo: "SLA tracking and automatic escalation"

---

## Week 5 — Proof Submission + Citizen Confirmation (Days 29–35)

### Goal: Complete complaint lifecycle. Coordinator submits proof → Citizen confirms.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 29 | Backend | Create `Proof` entity + `ProofRepository` | Proof table |
| 29 | Backend | Implement `ProofService.submit()`: check assigned, check status=IN_PROGRESS, Haversine distance ≤ 100m | Proof logic |
| 30 | Backend | On proof accept: status → COMPLETED, notify citizen | Status transition |
| 30 | Backend | Implement citizen confirmation: accept → CLOSED, reject → REOPENED (new coordinator, escalation++) | Confirmation logic |
| 31 | Backend | Max 3 reopens → ADMIN_REVIEW. Auto-close after 7 days no response | Limits + auto-close |
| 31 | Backend | Create `Comment` entity with threading (parent_id), profanity filter | Comment system backend |
| 32 | Backend | Create `CommentController`, `ProofController`. Test in Postman | APIs tested ✅ |
| 33 | Frontend | Build Proof Submission page: camera + GPS + distance display | `pages/coordinator/SubmitProof.jsx` |
| 33 | Frontend | Build Citizen Confirmation view: before/after photos + accept/reject | `components/ConfirmationView.jsx` |
| 34 | Frontend | Build Comment section: list, reply, post | `components/CommentSection.jsx` |
| 34 | Frontend | Build status update button (ASSIGNED → IN_PROGRESS) for coordinator | Progress update UI |
| 35 | Integration | **Full lifecycle test**: submit → vote → assign → in-progress → proof → confirm/reject | **Complete lifecycle working** |

### Week 5 Checkpoint ✅
```
[ ] Coordinator submits proof with geo-verification
[ ] Distance > 100m → rejected
[ ] Citizen accepts → CLOSED
[ ] Citizen rejects → REOPENED + new coordinator
[ ] Max 3 reopens enforced
[ ] Comments with threading work
[ ] Auto-close after 7 days tested
```

### 🎯 You can demo: "Full complaint lifecycle start to finish"

---

## Week 6 — Admin Panel + Security Hardening (Days 36–42)

### Goal: Admin fully functional. All anti-abuse and audit systems active.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 36 | Backend | Create `AuditLog` entity (append-only). `AuditService` logs every state change | Audit system |
| 36 | Backend | Add audit logging to ALL existing services (auth, complaints, votes, proofs, status) | All actions logged |
| 37 | Backend | Create `AdminController`: user CRUD, area CRUD, escalation actions | Admin API |
| 37 | Backend | Block admin self-modification. Restrict audit_logs (no DELETE) | Admin safeguards |
| 38 | Backend | Implement trust level automation (strikes → UNDER_REVIEW → RESTRICTED) | Trust system |
| 38 | Backend | Implement rate limiting across all endpoints + intensity score calculation | Anti-abuse active |
| 39 | Frontend | Build Admin Dashboard (stats cards, category/area charts) | `pages/admin/Dashboard.jsx` |
| 39 | Frontend | Build User Management page (table, filters, create coordinator, actions) | `pages/admin/UserManagement.jsx` |
| 40 | Frontend | Build Escalation panel (sorted by level, detail view, resolve actions) | `pages/admin/Escalations.jsx` |
| 40 | Frontend | Build Audit Log viewer (searchable, filterable, paginated table) | `pages/admin/AuditLogs.jsx` |
| 41 | Frontend | Build Area Management page | `pages/admin/AreaManagement.jsx` |
| 41 | Backend | Security hardening: CSP headers, global error handler (no stack traces), input sanitization | Security layer |
| 42 | Integration | Test admin flows: create coordinator, suspend user, resolve escalation, view audit | **Admin panel working** |

### Week 6 Checkpoint ✅
```
[ ] Admin dashboard with stats
[ ] User management (create/suspend/change trust)
[ ] Escalation review + resolve
[ ] Audit log viewer
[ ] All actions audit-logged
[ ] Rate limiting active
[ ] Security headers configured
```

### 🎯 You can demo: "Admin panel + security features"

---

## Week 7 — Maps, Polish, Testing (Days 43–49)

### Goal: Map view working. All bugs fixed. UI polished.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 43 | Frontend | Build Google Maps integration: setup, markers, color-coding | `components/MapView.jsx` |
| 43 | Frontend | Add marker click → popup → link to complaint detail | Interactive map |
| 44 | Frontend | Build Landing Page (hero section, how-it-works, stats) | `pages/LandingPage.jsx` |
| 44 | Frontend | Add disclaimer, privacy policy, terms of use pages | Legal pages |
| 45 | Full | **Testing Day 1**: Full citizen flow (register → submit → track → confirm) | Flow tested |
| 45 | Full | **Testing Day 1**: Full coordinator flow (login → vote → progress → proof) | Flow tested |
| 46 | Full | **Testing Day 2**: Full admin flow (user mgmt → escalations → audit) | Flow tested |
| 46 | Full | **Testing Day 2**: Edge cases (rate limit, duplicate, GPS denied, camera denied) | Edge cases tested |
| 47 | Full | **Testing Day 3**: Security tests (SQL injection, XSS, unauthorized access, privilege escalation) | Security tested |
| 47 | Full | Fix all bugs found during testing | Bugs fixed |
| 48 | Frontend | UI polish: loading spinners, empty states, error messages, transitions | UX complete |
| 48 | Frontend | Cross-browser testing (Chrome, Firefox, Edge) + mobile device testing | Compatibility verified |
| 49 | Backend | Generate Swagger/SpringDoc API documentation | Auto-docs at /swagger-ui |
| 49 | Backend | Code cleanup: remove debug logs, add comments on complex logic | Clean codebase |

### Week 7 Checkpoint ✅
```
[ ] Map view with complaint markers
[ ] Landing page built
[ ] All 3 user flows tested end-to-end
[ ] Security testing passed
[ ] Cross-browser + mobile tested
[ ] No critical bugs remaining
[ ] API documentation generated
```

### 🎯 You can demo: "Everything — full platform"

---

## Week 8 — Demo Preparation + Final Documentation (Days 50–56)

### Goal: Demo-ready. Documentation complete. Presentation prepared.

| Day | Focus | Task | Deliverable |
|---|---|---|---|
| 50 | Backend | Prepare seed data script: admin account, 3 coordinators, 4 areas, SLA config | `seed.sql` |
| 50 | Backend | Create sample complaints in ALL statuses for demo | Demo data |
| 51 | Full | Final responsive check (mobile, tablet, desktop) | Responsive ✅ |
| 51 | Full | Final production build (`npm run build`) | Production bundle |
| 52 | Full | Test on a different machine (not your dev machine) | Works on fresh setup |
| 53 | Docs | Finalize all documentation. Update diary. Review SRS | All docs final |
| 54 | Presentation | Create presentation slides (problem, solution, architecture, demo, learnings) | Slides ready |
| 55 | Demo | Dry-run demo: practice the walkthrough script from deployment plan | Practice complete |
| 55 | Full | Database backup (`pg_dump citywatch > backup.sql`) | Backup saved |
| 56 | Final | Buffer day: fix any last-minute issues | **PROJECT COMPLETE** |

### Week 8 Final Checkpoint ✅
```
[ ] Demo runs smoothly
[ ] Seed data shows all complaint states
[ ] Works on a machine other than dev machine
[ ] Presentation slides ready
[ ] Database backup exists
[ ] Can explain any part of the project in viva
```

---

## Visual Timeline

```
Week 1  ████████  Auth (backend + frontend + integration)
Week 2  ████████  Complaints (backend + frontend + camera/GPS)
Week 3  ████████  Voting (backend + frontend)
Week 4  ████████  Assignment + SLA + Notifications
Week 5  ████████  Proof + Confirmation + Comments
Week 6  ████████  Admin Panel + Security
Week 7  ████████  Maps + Testing + Polish
Week 8  ████████  Demo Prep + Documentation
```

## Daily Rhythm (Recommended)

```
Morning (2-3 hrs):  Backend work (entity → service → controller → test)
Afternoon (2-3 hrs): Frontend work (component → page → connect to API)
Evening (30 min):    Update Diary, commit to Git, plan next day
```

## Scope Cuts (If Running Behind)

> [!IMPORTANT]
> If you're behind schedule, cut in this order (bottom = cut first):
>
> | Priority | Feature | Cut if Behind By |
> |---|---|---|
> | P3 - Cut first | Marker clustering on map | 2+ days |
> | P3 | Comment threading (keep flat comments) | 2+ days |
> | P3 | Heatmap visualization | 2+ days |
> | P2 | Intensity score (keep manual priority) | 3+ days |
> | P2 | Duplicate detection (simplify) | 3+ days |
> | P2 | Map view entirely | 5+ days |
>
> **Never cut:** Auth, complaint submission, voting, SLA, proof verification, citizen confirmation, admin user management, audit log.
