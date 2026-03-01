# CityWatch — Technology Justification

---

## 1. Overview

This document justifies each technology choice in the CityWatch stack by comparing alternatives, listing pros/cons, and explaining why the chosen option best fits a college mini project.

---

## 2. Frontend: React.js

### Alternatives Considered

| Framework | Pros | Cons |
|---|---|---|
| **React.js** ✅ | Largest community, most tutorials, component-based, hooks, excellent tooling | JSX learning curve, "just a library" (needs router, state mgmt) |
| Angular | Full framework (router, forms, HTTP built-in), TypeScript by default | Steep learning curve, heavy for mini project, complex concepts (modules, DI, RxJS) |
| Vue.js | Easier to learn, good docs, less boilerplate | Smaller ecosystem than React, fewer job-market resources in India |
| Vanilla JS/HTML | No framework overhead | Unscalable, no component reuse, manual DOM management |

### Why React?

1. **Largest ecosystem** — Most tutorials, StackOverflow answers, and community support available. Easier to debug when stuck.
2. **Component-based architecture** — Maps naturally to CityWatch's UI (ComplaintCard, VotePanel, CameraCapture are all reusable components).
3. **React Router** — Clean client-side routing for role-based dashboards.
4. **Hooks** — Modern state management without class complexity.
5. **Academic value** — React is the most demanded frontend skill in the Indian job market.
6. **Vite** — Fast dev server with hot module replacement, easy setup via `npx create-vite`.

### Why NOT Angular?
- Angular's steep learning curve (modules, dependency injection, RxJS observables) would consume 2+ weeks of the 8-week timeline just for learning.
- Overkill for a project of this size.

---

## 3. Backend: Spring Boot (Java)

### Alternatives Considered

| Framework | Pros | Cons |
|---|---|---|
| **Spring Boot (Java)** ✅ | Enterprise standard, strong typing, built-in security, JPA/Hibernate, scheduler | Verbose syntax, slower development speed vs Node |
| Node.js + Express | Fast development, JavaScript everywhere, lightweight | Weak typing (unless TypeScript), less structured, security needs manual setup |
| Django (Python) | Batteries-included, ORM, admin panel built-in | Python backend less common in Indian enterprise, ORM less flexible than JPA |
| Flask (Python) | Lightweight, easy to learn | Too minimal, no built-in ORM/auth/scheduler |
| ASP.NET (C#) | Strong typing, good tooling | Microsoft ecosystem, less common in Indian academia |

### Why Spring Boot?

1. **Spring Security** — Built-in JWT authentication, role-based access control, CSRF protection, filter chains. CityWatch's complex RBAC maps directly to Spring Security annotations (`@PreAuthorize`).
2. **Spring Data JPA** — Automatic repository generation from entity classes. Database queries without writing SQL for most operations.
3. **@Scheduled** — Built-in task scheduler for SLA deadline checking and auto-escalation. No external cron job needed.
4. **Strong typing** — Java's type system catches errors at compile time. Critical for a system with 11 complaint states and strict transition rules.
5. **Academic value** — Java/Spring Boot is taught in most Indian engineering colleges. Understanding enterprise architecture is valuable for placements.
6. **Structured architecture** — Controller → Service → Repository layering enforces clean separation of concerns.

### Why NOT Node.js/Express?
- JavaScript's weak typing and lack of built-in structure would make it harder to enforce the strict status machine and RBAC rules.
- Spring Security's annotation-based access control is significantly easier than building equivalent middleware in Express.
- The `@Scheduled` annotation eliminates the need for external tools (cron, Bull queues) for SLA monitoring.

---

## 4. Database: PostgreSQL

### Alternatives Considered

| Database | Pros | Cons |
|---|---|---|
| **PostgreSQL** ✅ | Relational, ACID-compliant, PostGIS, JSON support, free | Slightly more setup than SQLite |
| MySQL | Popular, simple, widely taught | No native spatial queries, fewer advanced features |
| MongoDB | Flexible schema, JSON-native | No relational integrity (FK constraints), harder to enforce data consistency, bad fit for structured workflows |
| SQLite | Zero setup, file-based | No multi-user concurrency, no network access, not production-ready |
| H2 | In-memory, zero setup, great for testing | Not persistent, not production-ready |

### Why PostgreSQL?

1. **Relational structure** — CityWatch has clear relationships: Users → Complaints → Votes → Proofs → Comments. A relational database with foreign keys and constraints is the natural fit.
2. **ACID compliance** — Status transitions and vote counting must be transactional. If a vote triggers a majority decision, the vote save and status change must be atomic. PostgreSQL guarantees this.
3. **CHECK constraints** — Enum-like validation at the database level (e.g., `status IN ('DRAFT', 'PENDING_REVIEW', ...)`). Prevents bad data even if application logic has a bug.
4. **PostGIS (optional)** — If spatial queries are needed at scale, PostGIS provides `ST_DWithin()` for efficient radius search. No other relational DB has this built-in.
5. **Indexing** — B-tree indexes on status, category, area_id, and sla_deadline make filtered queries fast.
6. **Free and open-source** — No licensing cost. Available on all platforms.
7. **Academic value** — PostgreSQL is considered the most advanced open-source RDBMS, demonstrating strong database knowledge.

### Why NOT MongoDB?
- MongoDB has no foreign key constraints. A complaint could reference a non-existent user, area, or coordinator — the database would not prevent this.
- MongoDB's flexible schema is a disadvantage for CityWatch, where data structure is strict and well-defined.
- Transactions across multiple collections in MongoDB are complex and recent (v4.0+). PostgreSQL has had this for decades.
- CityWatch's data is inherently relational (Users *have* Complaints, Complaints *have* Votes), not document-oriented.

---

## 5. Authentication: JWT

### Alternatives Considered

| Method | Pros | Cons |
|---|---|---|
| **JWT** ✅ | Stateless, scalable, works with SPA, role in token | Cannot invalidate individual tokens; localStorage XSS risk |
| Session-based (cookies) | Server controls sessions, easy invalidation | Stateful (needs session storage), CSRF risk, doesn't scale horizontally |
| OAuth2 (Google/GitHub login) | Convenient for users, no password management | External dependency, no custom roles, more complex setup |

### Why JWT?
1. **Stateless** — Backend doesn't need to store sessions. Each request is self-contained.
2. **SPA-friendly** — React can easily store and send JWT in headers.
3. **Role-based** — Role is encoded in the token payload, enabling quick authorization checks.
4. **Scalable** — If multiple backend instances are needed, no session synchronization required.

---

## 6. Maps: Google Maps JavaScript API

### Alternatives Considered

| API | Pros | Cons |
|---|---|---|
| **Google Maps** ✅ | Best documentation, most features, marker clustering, heatmap, free tier | API key required, usage limits |
| OpenStreetMap + Leaflet | Fully free, open-source, no API key | Less polished, fewer features, more setup |
| Mapbox | Good design, customizable | Paid beyond free tier, less known |

### Why Google Maps?
1. **Free tier** — 28,000 loads/month + $200 monthly credit = more than sufficient for mini project.
2. **Marker clustering** — Built-in library for grouping hundreds of markers.
3. **Heatmap visualization** — Built-in library for intensity display.
4. **Best documentation** — Extensive examples and guides.

---

## 7. Camera: WebRTC (getUserMedia)

### Why Not File Upload?
CityWatch deliberately avoids `<input type="file">` for complaint photos and proof. Reasons:

1. **Prevents old photos** — Live capture increases the likelihood that the photo is taken at the time and place of submission.
2. **Prevents downloaded images** — Users cannot submit a Google image of a pothole.
3. **GPS correlation** — Photo is captured while GPS is active, linking time and location.
4. **Sufficient for mini project** — While not foolproof (screen recording could bypass), it raises the bar significantly compared to file upload.

---

## 8. Build Tools & DevOps

| Tool | Purpose | Why |
|---|---|---|
| **Vite** | Frontend dev server & bundler | Fastest React dev experience, HMR, easy config |
| **Maven** | Backend dependency management | Standard for Spring Boot, integrates with IDEs |
| **Git + GitHub** | Version control | Required for duo collaboration, easy branching |
| **Postman / Swagger** | API testing & documentation | Postman for manual testing, Swagger for auto-generated docs |

---

## 9. Summary Table

| Layer | Choice | Primary Reason |
|---|---|---|
| Frontend | React.js 18 + Vite | Largest ecosystem, component model fits CityWatch UI |
| Backend | Spring Boot 3 (Java 17) | Built-in security, JPA, scheduler; enterprise-grade architecture |
| Database | PostgreSQL 15 | Relational integrity, ACID, CHECK constraints, PostGIS option |
| Auth | JWT + BCrypt | Stateless, SPA-friendly, role-based |
| Maps | Google Maps JS API | Best features, free tier, marker clustering + heatmap |
| Camera | WebRTC (getUserMedia) | Live-only capture, prevents file upload bypass |
| Version Control | Git + GitHub | Standard collaboration tool |
