# CityWatch — System Architecture Document

---

## 1. Architecture Overview

CityWatch follows a **3-Tier Client-Server Architecture** with strict layer separation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TIER 1: PRESENTATION                            │
│                                                                         │
│   Browser (Chrome / Firefox / Safari / Edge)                           │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                     React SPA (Vite)                            │  │
│   │                                                                 │  │
│   │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │  │
│   │  │  Pages   │  │Components│  │   Hooks   │  │   Services   │  │  │
│   │  │(by role) │──│(reusable)│──│(state/API)│──│ (Axios HTTP) │  │  │
│   │  └──────────┘  └──────────┘  └───────────┘  └──────┬───────┘  │  │
│   │                                                     │          │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │          │  │
│   │  │ Context  │  │  Routes  │  │  Utils   │         │          │  │
│   │  │(Auth,Ntf)│  │(guards)  │  │(helpers) │         │          │  │
│   │  └──────────┘  └──────────┘  └──────────┘         │          │  │
│   │                                                     │          │  │
│   │  ┌──────────────────────┐  ┌──────────────────┐   │          │  │
│   │  │  WebRTC Camera API   │  │  Geolocation API │   │          │  │
│   │  │  (getUserMedia)      │  │  (getCurrentPos)  │   │          │  │
│   │  └──────────────────────┘  └──────────────────┘   │          │  │
│   └───────────────────────────────────────────────────┼──────────┘  │
│                                                        │             │
└────────────────────────────────────────────────────────┼─────────────┘
                                                         │
                                            HTTPS / REST / JSON
                                            Authorization: Bearer <JWT>
                                                         │
┌────────────────────────────────────────────────────────┼─────────────┐
│                         TIER 2: APPLICATION                          │
│                                                                      │
│   Spring Boot 3.x (Java 17) — Embedded Tomcat                      │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                    SECURITY FILTER CHAIN                     │  │
│   │                                                              │  │
│   │   Request ──► CorsFilter ──► JwtAuthFilter ──► RoleCheck    │  │
│   │                                   │                          │  │
│   │                            Invalid token?                    │  │
│   │                            ──► 401 Unauthorized              │  │
│   │                            Wrong role?                       │  │
│   │                            ──► 403 Forbidden                 │  │
│   └──────────────────────────────────┼───────────────────────────┘  │
│                                      │ Authenticated request       │
│   ┌──────────────────────────────────▼───────────────────────────┐  │
│   │                    CONTROLLER LAYER (REST)                   │  │
│   │                                                              │  │
│   │  AuthController    ComplaintController   VoteController      │  │
│   │  ProofController   CommentController     AdminController     │  │
│   │  NotificationController   MapController                      │  │
│   │                                                              │  │
│   │  Responsibility: Parse request → call service → return JSON  │  │
│   │  Rule: NO business logic here. Thin layer only.              │  │
│   └──────────────────────────────────┼───────────────────────────┘  │
│                                      │                              │
│   ┌──────────────────────────────────▼───────────────────────────┐  │
│   │                    SERVICE LAYER (Business Logic)             │  │
│   │                                                              │  │
│   │  AuthService       ComplaintService     VoteService          │  │
│   │  AssignmentService ProofService         SlaService           │  │
│   │  NotificationService  CommentService    AdminService         │  │
│   │  AuditService      IntensityService                          │  │
│   │                                                              │  │
│   │  Responsibility: ALL validation, rules, state transitions    │  │
│   │  Rule: This is the brain. All decisions happen here.         │  │
│   └──────────────────────────────────┼───────────────────────────┘  │
│                                      │                              │
│   ┌──────────────────────────────────▼───────────────────────────┐  │
│   │                    REPOSITORY LAYER (Data Access)             │  │
│   │                                                              │  │
│   │  UserRepository      ComplaintRepository   VoteRepository    │  │
│   │  ProofRepository     CommentRepository     AreaRepository    │  │
│   │  NotificationRepo    SlaConfigRepository   EscalationRepo   │  │
│   │  AuditLogRepository                                          │  │
│   │                                                              │  │
│   │  Responsibility: SQL queries via JPA/Hibernate               │  │
│   │  Rule: NO logic. Only data in, data out.                     │  │
│   └──────────────────────────────────┼───────────────────────────┘  │
│                                      │                              │
│   ┌──────────────────────────────────┼───────────────────────────┐  │
│   │  SCHEDULER          EXCEPTION HANDLER       UTILITIES        │  │
│   │  SlaScheduler       GlobalExceptionHandler  JwtUtil          │  │
│   │  AutoCloseScheduler (no stack traces out)    HaversineUtil   │  │
│   │  (runs hourly)                               ImageUtil       │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────┼───────────────────────────────┘
                                       │
                                  JDBC (TCP:5432)
                                  HikariCP Connection Pool
                                       │
┌──────────────────────────────────────┼───────────────────────────────┐
│                         TIER 3: DATA                                 │
│                                                                      │
│   PostgreSQL 15                                                      │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  TABLES (10)                                                 │  │
│   │                                                              │  │
│   │  users ◄──── complaints ◄──── votes                          │  │
│   │    │              │              │                            │  │
│   │    │              ├──── proofs   │                            │  │
│   │    │              ├──── comments │                            │  │
│   │    │              └──── escalations                           │  │
│   │    │                                                         │  │
│   │    ├──── notifications                                       │  │
│   │    └──── audit_logs                                          │  │
│   │                                                              │  │
│   │  areas ◄──── complaints                                     │  │
│   │  sla_config (lookup table)                                   │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  CONSTRAINTS                                                 │  │
│   │  • FK constraints on all relationships                       │  │
│   │  • UNIQUE(email) on users                                    │  │
│   │  • UNIQUE(complaint_id, coordinator_id) on votes             │  │
│   │  • CHECK constraints on all enum columns                     │  │
│   │  • NOT NULL on required columns                              │  │
│   │  • Indexes on: status, area_id, sla_deadline, user_id       │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  SECURITY                                                    │  │
│   │  • audit_logs: NO UPDATE, NO DELETE permissions              │  │
│   │  • Passwords stored as BCrypt hashes only                    │  │
│   │  • All queries via JPA (parameterized — SQL injection safe)  │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  FILE STORAGE                                                │  │
│   │  ./uploads/                                                  │  │
│   │    ├── complaints/    complaint photos                       │  │
│   │    └── proofs/        resolution proof photos                │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

External:
┌──────────────────────┐
│  Google Maps JS API  │  ← Called by frontend only (map, markers, heatmap)
│  (HTTPS, API Key)    │     Backend never calls Google Maps directly.
└──────────────────────┘
```

---

## 2. Request Lifecycle — What Happens on Every API Call

```
User clicks something in browser
        │
        ▼
[1] React component calls service function
        │  e.g., complaintService.create(data)
        ▼
[2] Axios sends HTTP request
        │  POST http://localhost:8080/api/complaints
        │  Headers: { Authorization: "Bearer eyJhb..." }
        │  Body: { category, description, image, lat, lng }
        ▼
[3] Spring Security — CorsFilter
        │  Is origin allowed? (localhost:5173)
        │  Yes → continue. No → 403.
        ▼
[4] Spring Security — JwtAuthFilter
        │  Extract token from Authorization header
        │  Validate signature + expiry
        │  Load user from DB (check not SUSPENDED)
        │  Set SecurityContext (userId, role)
        │  Invalid? → 401 Unauthorized
        ▼
[5] Spring Security — Authorization Check
        │  Does user's role match @PreAuthorize on endpoint?
        │  e.g., @PreAuthorize("hasRole('CITIZEN')")
        │  No match? → 403 Forbidden
        ▼
[6] Controller receives request
        │  Parses request body → DTO
        │  Gets authenticated user from SecurityContext
        │  Calls service method
        ▼
[7] Service Layer executes business logic
        │  Validates input
        │  Checks business rules (rate limit, trust, etc.)
        │  Calls repository for DB operations
        │  Triggers side effects (notifications, audit log)
        │  Returns result or throws exception
        ▼
[8] Repository executes SQL
        │  JPA generates parameterized SQL
        │  HikariCP provides DB connection
        │  PostgreSQL executes and returns result
        ▼
[9] Response flows back
        │  Service → Controller → JSON response
        │  HTTP 200/201/400/401/403/404/409/429
        ▼
[10] GlobalExceptionHandler (if error)
        │  Catches any exception
        │  Returns standardized ErrorResponse JSON
        │  NEVER exposes stack traces
        ▼
[11] Axios receives response in frontend
        │  Success? → Update React state
        │  Error? → Show user-friendly error message
        ▼
[12] React re-renders with new data
```

---

## 3. Security Architecture — Complete Pipeline

```
                        FRONTEND SECURITY
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  [Auth Guard] ──► Is JWT in localStorage?                 │
│                   No → redirect to /login                  │
│                   Yes → decode role → check route access   │
│                                                            │
│  [Axios Interceptor] ──► Attach JWT to every request      │
│                          401 response → clear JWT → login  │
│                                                            │
│  [React Auto-Escaping] ──► Prevents XSS in rendered HTML  │
│                                                            │
│  [WebRTC Only] ──► No <input type="file"> anywhere        │
│                    Prevents old/downloaded photo uploads    │
│                                                            │
│  [Input Validation] ──► Client-side for UX only           │
│                         Never trusted by backend           │
│                                                            │
└────────────────────────────────────────────────────────────┘

                        BACKEND SECURITY
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  LAYER 1: Network                                         │
│  ├── CORS: Only frontend origin allowed                   │
│  ├── HTTPS: Required in production (for GPS + camera)     │
│  └── Rate Limiting: Per-IP and per-user limits            │
│                                                            │
│  LAYER 2: Authentication                                  │
│  ├── JwtAuthFilter: Validates token signature + expiry    │
│  ├── User status check: SUSPENDED users blocked           │
│  └── BCrypt password verification (cost factor 12)        │
│                                                            │
│  LAYER 3: Authorization                                   │
│  ├── @PreAuthorize: Role checked on every endpoint        │
│  ├── Business rules: Is this YOUR complaint? YOUR area?   │
│  └── Resource ownership: Can't modify others' data        │
│                                                            │
│  LAYER 4: Input Validation                                │
│  ├── DTO validation: @NotBlank, @Size, @Email             │
│  ├── Business validation: trust level, rate limit, state  │
│  ├── Image validation: magic bytes (JPEG/PNG only)        │
│  └── SQL injection: JPA parameterized queries only        │
│                                                            │
│  LAYER 5: Output Sanitization                             │
│  ├── No stack traces in responses                         │
│  ├── Generic "Invalid credentials" (no email enumeration) │
│  └── CSP + X-Frame-Options + X-Content-Type headers       │
│                                                            │
│  LAYER 6: Audit & Accountability                          │
│  ├── Every state change logged (who, what, when, IP)      │
│  ├── Audit table is append-only (no DELETE/UPDATE)        │
│  └── Citizen trust system (strikes → RESTRICTED)          │
│                                                            │
└────────────────────────────────────────────────────────────┘

                        DATABASE SECURITY
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ├── FK constraints prevent orphaned records              │
│  ├── UNIQUE constraints prevent duplicate votes           │
│  ├── CHECK constraints validate enum values               │
│  ├── BCrypt hashes (passwords never in plain text)        │
│  ├── audit_logs: DB user has INSERT-only permission       │
│  └── EXIF metadata stripped from stored images            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Data Flow Between Components

### 4.1 Frontend Internal Data Flow

```
User Action (click, type, submit)
        │
        ▼
    [Page Component]
        │  uses hooks for state
        ▼
    [Custom Hook] (useAuth, useComplaints, useGeolocation)
        │  manages state + calls service
        ▼
    [Service Layer] (complaintService.js)
        │  calls Axios with correct endpoint + auth header
        ▼
    [Axios Instance] (api.js)
        │  adds JWT automatically via interceptor
        │  sends HTTP request
        ▼
    Backend API ──► response ──► hook updates state ──► component re-renders
```

### 4.2 Backend Internal Data Flow

```
HTTP Request arrives
        │
        ▼
    [Security Filter Chain]
        │  CORS → JWT → Role check
        ▼
    [Controller]
        │  @PostMapping("/api/complaints")
        │  Parse DTO, get authenticated user
        │  Call: complaintService.create(request, userId)
        ▼
    [Service]
        │  1. userRepo.findById(userId) → check trust level
        │  2. complaintRepo.countTodayByUser(userId) → rate limit
        │  3. complaintRepo.findNearby(lat, lng, category) → duplicates
        │  4. areaRepo.findByCoordinates(lat, lng) → assign area
        │  5. imageUtil.save(photo) → save to disk
        │  6. complaintRepo.save(complaint) → persist
        │  7. notificationService.notifyCoordinators(areaId) → side effect
        │  8. auditService.log("COMPLAINT_CREATED", ...) → audit
        ▼
    [Repository] ──► JPA ──► Hibernate ──► JDBC ──► PostgreSQL
        │
        ▼
    Return ComplaintResponse DTO → Controller → JSON → Frontend
```

### 4.3 Scheduled Tasks Data Flow

```
Every 60 minutes (Spring @Scheduled)
        │
        ▼
    [SlaScheduler.checkDeadlines()]
        │
        │  SQL: SELECT * FROM complaints
        │       WHERE status IN ('ASSIGNED', 'IN_PROGRESS')
        │       AND sla_deadline < NOW()
        │
        ▼
    For each overdue complaint:
        │
        ├── Calculate overdue_hours = NOW() - sla_deadline
        │
        ├── Determine escalation level:
        │   0-24h  → Level 1
        │   24-48h → Level 2
        │   48h+   → Level 3
        │
        ├── Update complaint.status → DELAYED (if not already)
        ├── Create/update escalation record
        ├── Create notification for admin
        └── auditService.log("SLA_VIOLATION", ...)
```

---

## 5. Cross-Cutting Concerns

### 5.1 Error Handling Strategy

```
┌──────────────────────────────────────────────────────────────────────┐
│  Exception Type              │ HTTP Code │ User Sees                 │
├──────────────────────────────┼───────────┼───────────────────────────┤
│ Validation error (@Valid)    │ 400       │ "Description min 50 chars"│
│ ResourceNotFoundException    │ 404       │ "Complaint #42 not found" │
│ DuplicateResourceException   │ 409       │ "Similar complaint exists"│
│ UnauthorizedException        │ 401       │ "Please login again"      │
│ AccessDeniedException        │ 403       │ "Not authorized"          │
│ RateLimitExceededException   │ 429       │ "Max 5/day. Try tomorrow" │
│ InvalidStatusTransition      │ 400       │ "Cannot change status"    │
│ Any unexpected exception     │ 500       │ "Something went wrong"    │
│                              │           │ (NO stack trace)          │
└──────────────────────────────┴───────────┴───────────────────────────┘

Backend GlobalExceptionHandler catches ALL exceptions and returns:
{
  "status": 400,
  "error": "Bad Request",
  "message": "Description must be at least 50 characters. You have 23.",
  "timestamp": "2026-03-01T22:10:00",
  "path": "/api/complaints"
}
```

### 5.2 Logging & Audit Strategy

```
Two separate logging systems:

1. APPLICATION LOGS (console/file — for debugging)
   └── Spring Boot default logger (Logback)
   └── Log levels: ERROR (production), DEBUG (development)
   └── Logs: request URLs, execution times, errors
   └── NOT shown to users. NOT stored in DB.

2. AUDIT LOGS (database — for accountability)
   └── Stored in audit_logs table
   └── Captures: who did what, when, what changed, from where
   └── Append-only. Cannot be modified or deleted.
   └── Visible to admins only via Audit Log page.
   └── Example entry:
       {
         actor_id: 5,
         action: "COMPLAINT_STATUS_CHANGE",
         entity_type: "COMPLAINT",
         entity_id: 42,
         old_value: "PENDING_REVIEW",
         new_value: "APPROVED",
         ip_address: "192.168.1.100",
         created_at: "2026-03-01 22:10:00"
       }
```

### 5.3 Transaction Boundaries

```
Every service method that modifies data uses @Transactional:

@Transactional
public void castVote(VoteRequest request, Long userId) {
    // 1. Save vote               ← DB write #1
    // 2. Check majority           ← DB read
    // 3. If majority:
    //    a. Update complaint status ← DB write #2
    //    b. Calculate intensity     ← DB read + write #3
    //    c. Auto-assign coordinator ← DB write #4
    //    d. Set SLA deadline        ← DB write #5
    //    e. Create notifications    ← DB write #6
    //    f. Log to audit            ← DB write #7
    //
    // If ANY step fails → ALL writes roll back
    // If ALL succeed → ALL writes commit atomically
}

This prevents states like:
"Vote was saved but complaint status wasn't updated"
"Complaint was approved but no coordinator was assigned"
```

---

## 6. API Architecture

### 6.1 URL Structure Convention

```
/api/auth/*              ← Public (no JWT required)
/api/complaints/*        ← Role-specific access per endpoint
/api/votes/*             ← Coordinator only
/api/proofs/*            ← Coordinator only
/api/comments/*          ← Any authenticated user
/api/notifications/*     ← Any authenticated user (own only)
/api/admin/*             ← Admin only
/api/map/*               ← Any authenticated user
```

### 6.2 Request/Response Convention

Every request body is a DTO:
```java
// Incoming
public class ComplaintRequest {
    @NotBlank String category;
    @Size(min=50, max=1000) String description;
    @NotNull String imageBase64;
    @NotNull Double latitude;
    @NotNull Double longitude;
    Double gpsAccuracy;
}
```

Every response body is a DTO:
```java
// Outgoing
public class ComplaintResponse {
    Long id;
    String category;
    String description;
    String imageUrl;
    Double latitude;
    Double longitude;
    String status;
    String priority;
    String areaName;
    String citizenName;
    String assignedCoordinatorName;  // null if not assigned
    LocalDateTime slaDeadline;       // null if not set
    LocalDateTime createdAt;
    Integer voteCount;
    Integer reopenCount;
}
```

### 6.3 Pagination Convention

All list endpoints return paginated responses:
```json
{
  "content": [ ... ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 47,
  "totalPages": 5,
  "last": false
}
```
