# CityWatch — Viva Preparation

> Organized by category. Study these before your project viva / external examination.

---

## 1. Project Understanding Questions

### Q: Explain your project in 2 minutes.
**A:** CityWatch is a web-based civic complaint facilitation platform. Citizens report local infrastructure issues — like potholes, garbage, or broken streetlights — with live photos and GPS coordinates. Instead of going directly to the municipal corporation, complaints are validated by field coordinators through a distributed voting system. If the majority agrees the complaint is genuine, it gets assigned to a coordinator with an SLA deadline. The coordinator must physically visit the site to submit geo-verified proof of resolution. Finally, the citizen either confirms or rejects the work. The system tracks everything through an 11-state lifecycle, with automatic escalation, anti-abuse safeguards, and append-only audit logging.

### Q: What problem does CityWatch solve?
**A:** Existing civic complaint systems suffer from four major gaps:
1. **No validation** — anyone can submit fake complaints, wasting resources
2. **No proof of closure** — complaints get marked "resolved" without evidence
3. **No accountability** — no SLA tracking or escalation when deadlines pass
4. **No anti-abuse** — no protection against spam, collusion, or data manipulation
CityWatch addresses all four through coordinator voting, geo-verified proof, SLA monitoring, and multi-layered anti-abuse mechanisms

### Q: Why didn't you integrate with the municipal corporation directly?
**A:** Direct government system integration requires institutional MoUs, API agreements, and legal clearances that are not feasible for a college project. CityWatch operates as an independent facilitation layer. Coordinators work offline with local authorities. This avoids legal risk while still improving transparency.

### Q: What is the scope of your project?
**A:** Scope is defined in our PRD. In scope: 1 city, 4 areas, 5 complaint categories, 3 user roles, complaint lifecycle from submission to closure, SLA tracking, geo-verification, and anti-abuse. Out of scope: mobile apps, AI/ML, government APIs, push notifications, payment, and multi-language support.

---

## 2. Technical Architecture Questions

### Q: Explain your system architecture.
**A:** Three-tier architecture:
- **Frontend:** React SPA served as static files. Communicates with backend via REST API over HTTPS using Axios. Uses WebRTC for camera and browser Geolocation API for GPS.
- **Backend:** Spring Boot (Java 17) with layered architecture — Controllers handle HTTP, Services contain business logic, Repositories handle database access via JPA/Hibernate. Spring Security filter chain handles JWT validation and RBAC.
- **Database:** PostgreSQL 15 with 10 tables, foreign key constraints, indexes on hot columns, and CHECK constraints for enum validation.

### Q: Why React + Spring Boot? Why not MERN stack?
**A:** Spring Boot provides built-in Spring Security for JWT + RBAC (annotation-based, e.g., `@PreAuthorize`), Spring Data JPA for automatic repository generation, and `@Scheduled` for SLA monitoring — all critical for CityWatch. Express.js would require building these from scratch. Java's strong typing also catches status-transition bugs at compile time, which is important for an 11-state machine.

### Q: How does authentication work?
**A:** User logs in with email/password. Password is verified against BCrypt hash stored in DB. On success, the server generates a JWT containing user_id, role, and expiry (24 hours). Frontend stores it in localStorage and sends it in the `Authorization: Bearer <token>` header on every request. Backend's JWT filter validates the token, checks user status (not SUSPENDED), and sets the SecurityContext for role-based access.

### Q: How is authorization implemented?
**A:** Three levels:
1. **Token validation** — JWT filter runs on every request. Invalid/expired token → 401.
2. **Role-based** — Spring `@PreAuthorize("hasRole('ADMIN')")` annotations on controller methods. Citizen cannot access admin endpoints.
3. **Business rules** — Service layer checks: is this coordinator assigned to this complaint? Is this citizen the owner? These are checked in code, not just by role.

---

## 3. Database & Data Questions

### Q: How many tables and what are they?
**A:** 10 tables: `users`, `complaints`, `votes`, `proofs`, `comments`, `notifications`, `areas`, `sla_config`, `escalations`, `audit_logs`. Each with defined relationships, indexes, and constraints.

### Q: Why PostgreSQL over MongoDB?
**A:** CityWatch data is inherently relational — users HAVE complaints, complaints HAVE votes, votes REFERENCE coordinators. Foreign key constraints ensure referential integrity (can't vote on a non-existent complaint). CHECK constraints enforce valid statuses. MongoDB has no FK constraints and would allow orphaned/inconsistent data. Also, ACID transactions are critical — a vote that triggers majority must atomically update both the vote and the complaint status.

### Q: How do you prevent SQL injection?
**A:** Spring Data JPA uses parameterized queries exclusively. We never concatenate user input into SQL strings. Even custom queries use `@Query("SELECT c FROM Complaint c WHERE c.status = :status")` with named parameters, not string concatenation.

### Q: What indexes do you have and why?
**A:** Indexes on: `complaints.status` (filtered queries), `complaints.area_id` (area-based lookups), `complaints.sla_deadline` (SLA scheduler query), `votes.complaint_id + coordinator_id` (UNIQUE, prevents double voting), `notifications.user_id + is_read` (unread count queries). These cover the most frequent query patterns.

---

## 4. Core Feature Questions

### Q: How does the voting system work? How do you prevent manipulation?
**A:** When a complaint is submitted, 3–5 coordinators in the area can independently vote VALID, INVALID, or NEEDS_CLARIFICATION. Votes are hidden until all are cast or timeout (48h) — this prevents herd behavior. A UNIQUE(complaint_id, coordinator_id) constraint prevents double voting. ≥60% majority determines outcome. Tie → admin review. We also track vote patterns — coordinators who rubber-stamp everything (>95% approval rate) or block everything (>80% rejection) get flagged.

### Q: How does geo-verification work?
**A:** When submitting proof, the coordinator's GPS is captured automatically. We calculate the Haversine distance between the proof GPS and the original complaint GPS. The Haversine formula accounts for Earth's curvature: `d = 2r × arcsin(√(sin²(Δlat/2) + cos(lat1)×cos(lat2)×sin²(Δlng/2)))`. If distance ≤ 100m, proof is accepted. If > 100m, it's rejected with the exact distance shown. This ensures the coordinator physically visited the location.

### Q: What is the intensity score?
**A:** It's a formula: `intensity = log(1 + Σ(complaints × trust_weight))` where complaints are similar issues within 500m radius. Trust weights: NORMAL=1.0, UNDER_REVIEW=0.5, RESTRICTED=0.0. This creates dynamic priority: single complaint = Low, cluster of complaints = High/Critical. It's logarithmic to prevent linear gaming.

### Q: How does SLA tracking work?
**A:** Each complaint category has a predefined SLA (e.g., Garbage=72h, Pothole=168h). When a coordinator is assigned, the SLA deadline is calculated: `sla_deadline = NOW() + sla_hours`. A Spring `@Scheduled` job runs every hour, querying complaints where `status IN (ASSIGNED, IN_PROGRESS) AND sla_deadline < NOW()`. Overdue complaints get escalated: Level 1 (0-24h overdue), Level 2 (24-48h), Level 3 (48h+). Admin is notified at each level.

### Q: What happens when a citizen rejects the resolution proof?
**A:** The complaint status changes to REOPENED, `reopen_count++`, `escalation_level++`. The system assigns a DIFFERENT coordinator (the previous one is excluded). This can happen up to 3 times. After 3 rejections, the complaint goes to ADMIN_REVIEW. This prevents infinite reopen loops while giving citizens legitimate recourse.

---

## 5. Security & Edge Case Questions

### Q: What security measures have you implemented?
**A:** Nine layers:
1. BCrypt password hashing (never stored plain text)
2. JWT authentication with 24-hour expiry
3. RBAC on all endpoints (Spring Security)
4. Input validation (backend, not just frontend)
5. SQL injection prevention (JPA parameterized queries)
6. XSS prevention (React auto-escaping + CSP headers)
7. Rate limiting (per-user and per-IP)
8. Append-only audit logging (no delete/update on audit table)
9. HTTPS required in production (for camera/GPS APIs)

### Q: What if someone spoofs their GPS?
**A:** We acknowledge GPS spoofing is technically possible in browsers. Our defense is defense-in-depth: (1) Area bounding box check rejects obviously wrong locations, (2) Coordinator voting validates complaint authenticity through multiple people, (3) Citizen confirmation catches fraudulent proofs, (4) Strike system penalizes citizens with repeated rejected complaints. No system can fully prevent GPS spoofing, but we make it difficult and detectable.

### Q: What if a coordinator is corrupt?
**A:** Multiple safeguards: (1) No single coordinator can approve a complaint alone — ≥60% majority required, (2) Votes are hidden to prevent influence, (3) Random assignment prevents self-selection, (4) Vote pattern monitoring flags suspicious approval/rejection rates, (5) Admin can suspend coordinators, (6) Citizen rejection reopens complaints regardless of coordinator, (7) Audit log captures everything. Collusion among 3+ coordinators remains a theoretical risk, mitigated by random 5% admin audits.

### Q: What if both GPS and camera are denied by the browser?
**A:** The application shows clear error messages with instructions. Without camera, the user cannot capture a photo — this is by design (no file upload fallback). Without GPS, the system cannot assign the complaint to an area. Both are mandatory. We display step-by-step instructions for enabling permissions. On iOS Safari, this requires changing Settings → Safari → Privacy.

---

## 6. Design & Architecture Questions

### Q: What design patterns did you use?
**A:**
1. **MVC (Model-View-Controller)** — Spring Boot's controller-service-repository maps to MVC
2. **Repository Pattern** — Spring Data JPA repositories abstract database access
3. **DTO Pattern** — Separate request/response objects from entity objects
4. **State Machine Pattern** — Complaint status transitions are validated against a defined state diagram
5. **Observer (loose)** — Notification system publishes events on status changes
6. **Filter Chain** — Spring Security's filter pipeline for JWT validation

### Q: How is your code organized?
**A:** Backend follows Spring Boot layered architecture:
- `controller/` — REST endpoints (thin, delegates to services)
- `service/` — Business logic (validation, calculations, state transitions)
- `repository/` — Database access (JPA interfaces, auto-implemented)
- `entity/` — Database table mappings
- `dto/` — Request/response objects
- `config/` — Security, CORS, scheduler configuration
- `exception/` — Custom exceptions + global handler
- `util/` — Haversine calculator, profanity filter, etc.

### Q: What is @Transactional and why do you use it?
**A:** `@Transactional` ensures that a series of database operations either all succeed or all roll back. For example, when a vote triggers majority, we (1) save the vote, (2) update complaint status to APPROVED, (3) calculate intensity, (4) assign coordinator, (5) set SLA deadline, (6) create notifications. If step 4 fails, steps 1-3 would also roll back, preventing inconsistent state.

---

## 7. Tricky / Challenging Questions

### Q: What was the most technically challenging part?
**A:** The voting majority calculation with concurrent coordinators. If 5 coordinators are voting simultaneously, we need to ensure: (1) No double votes (UNIQUE constraint), (2) Accurate count at check time (database-level count, not cached), (3) Atomic status transition on majority (within same transaction). The combination of optimistic locking (`@Version`) and database constraints solved this.

### Q: What would you do differently if you started over?
**A:** Three things: (1) Start with API contract documentation before any code — we had some frontend-backend mismatches early on, (2) Set up automated tests from Week 1 — manual testing became time-consuming later, (3) Use refresh tokens — the current 24-hour JWT with no refresh means users have to re-login daily.

### Q: How would you scale this to handle 10,000 users?
**A:** Because JWT is stateless, we can run multiple backend instances behind a load balancer with zero session synchronization. Database scaling would involve: (1) Connection pooling (HikariCP, already built into Spring Boot), (2) Read replicas for heavy queries (map view, stats), (3) PostGIS for efficient spatial queries replacing Java Haversine, (4) Image storage migrated to AWS S3 instead of local disk, (5) Redis for caching hot data (complaint counts, notification counts).

### Q: What are the limitations of your project?
**A:** Honestly: (1) No automated testing — all testing is manual, (2) JWT in localStorage is vulnerable to XSS — should use HttpOnly cookies in production, (3) No email verification — user email could be fake, (4) No refresh token — users must re-login every 24 hours, (5) Coordinator hiring is an offline process we can't control, (6) GPS can be spoofed — no perfect solution exists in browsers, (7) Image analysis for fake photos is beyond scope — we rely on human validation through the voting system.

---

## 8. Academic & Theory Questions

### Q: What software development model did you follow?
**A:** Agile-adapted with a fixed scope. We used an 8-week sprint-based approach with weekly deliverables, but with a locked feature set (defined in PRD) to prevent scope creep. This is more structured than pure Agile but more flexible than Waterfall.

### Q: What testing methodologies did you use?
**A:** Manual testing across four levels: (1) API-level testing with Postman (every endpoint, success + error cases), (2) UI flow testing (every user journey, every wizard step), (3) Edge case testing (GPS failure, camera denial, rate limits, concurrent votes), (4) Security testing (SQL injection attempts, XSS attempts, unauthorized access, privilege escalation). We have 60+ defined test cases documented in our test plan.

### Q: What is the difference between authentication and authorization?
**A:** Authentication = "Who are you?" (login with email/password → JWT). Authorization = "What can you do?" (RBAC — citizens can submit complaints but NOT access admin panel). In CityWatch, authentication happens once (login), but authorization is checked on every API request via Spring Security annotations.
