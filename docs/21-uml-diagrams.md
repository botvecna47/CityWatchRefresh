# CityWatch — UML & System Diagrams

---

## 1. Data Flow Diagram (DFD)

### Level 0 — Context Diagram

```
                    ┌─────────────┐
   Complaints,      │             │     Reports,
   Confirmations ──►│  CITYWATCH  │◄─── Votes, Proofs
   (Citizen)        │   SYSTEM    │     (Coordinator)
                    │             │
                    └──────┬──────┘
                           │
                    User Mgmt, Config,
                    Audit Logs
                    (Admin)
```

### Level 1 — Major Processes

```
┌──────────┐                                          ┌──────────────┐
│          │──── Register/Login ──────►[1.0 Auth]─────►│              │
│          │                           │  Process │    │              │
│          │◄── JWT Token ────────────┘           │    │   DATABASE   │
│          │                                      │    │              │
│  CITIZEN │──── Complaint Data ─────►[2.0 Complaint]──►│  users       │
│          │                           │  Process │    │  complaints  │
│          │◄── Confirmation ─────────┘           │    │  votes       │
│          │                                      │    │  proofs      │
│          │──── Accept/Reject ──────►[3.0 Confirm]────►│  comments    │
│          │                           │  Process │    │  notifications│
└──────────┘                          └───────────┘    │  audit_logs  │
                                                       │  areas       │
┌──────────────┐                                      │  sla_config  │
│              │──── Vote ───────────►[4.0 Vote]───────►│  escalations │
│ COORDINATOR  │                       │ Process │     │              │
│              │──── Proof ──────────►[5.0 Proof]──────►│              │
│              │                       │ Process │     │              │
└──────────────┘                      └──────────┘     │              │
                                                       │              │
┌──────────────┐                                      │              │
│    ADMIN     │──── User Actions ───►[6.0 Admin]──────►│              │
│              │◄── Reports ──────────│ Process │      │              │
└──────────────┘                      └──────────┘     │              │
                                                       │              │
┌──────────────┐                                      │              │
│   SCHEDULER  │──── Time Trigger ───►[7.0 SLA]────────►│              │
│   (System)   │                       │ Check  │      │              │
└──────────────┘                      └──────────┘     └──────────────┘
```

### Level 2 — Process 2.0 (Complaint Submission — Expanded)

```
Citizen Input                                        Database
     │                                                  │
     ├── Category ──────┐                               │
     ├── Description ───┤                               │
     ├── Photo ─────────┤                               │
     ├── GPS ───────────┤                               │
     │                  ▼                               │
     │         [2.1 Validate Input]                     │
     │                  │                               │
     │                  ├── Invalid ──► Error Response   │
     │                  │                               │
     │                  ▼                               │
     │         [2.2 Check Rate Limit] ◄─── complaints   │
     │                  │                               │
     │                  ├── Exceeded ──► 429 Error       │
     │                  │                               │
     │                  ▼                               │
     │         [2.3 Check Duplicate] ◄──── complaints   │
     │                  │                               │
     │                  ├── Duplicate ──► 409 + link     │
     │                  │                               │
     │                  ▼                               │
     │         [2.4 Assign Area] ◄──────── areas        │
     │                  │                               │
     │                  ├── Outside ──► 400 Error        │
     │                  │                               │
     │                  ▼                               │
     │         [2.5 Save Complaint] ───────► complaints  │
     │                  │                               │
     │                  ▼                               │
     │         [2.6 Notify Coordinators] ──► notifications│
     │                  │                               │
     │                  ▼                               │
     │         Response: Complaint #ID                  │
```

---

## 2. Sequence Diagrams

### 2.1 Complaint Submission

```
Citizen          Frontend         Backend          Database
  │                │                │                │
  │ Fill Form      │                │                │
  │───────────────►│                │                │
  │                │ POST /complaints│               │
  │                │───────────────►│                │
  │                │                │ Check trust     │
  │                │                │───────────────►│
  │                │                │◄───────────────│ trust=NORMAL
  │                │                │ Check rate limit│
  │                │                │───────────────►│
  │                │                │◄───────────────│ count=3 (OK)
  │                │                │ Check duplicate │
  │                │                │───────────────►│
  │                │                │◄───────────────│ none found
  │                │                │ Find area       │
  │                │                │───────────────►│
  │                │                │◄───────────────│ area_id=1
  │                │                │ Save complaint  │
  │                │                │───────────────►│
  │                │                │◄───────────────│ id=42
  │                │                │ Notify coords   │
  │                │                │───────────────►│
  │                │ 201 Created    │                │
  │                │◄───────────────│                │
  │ Show confirm   │                │                │
  │◄───────────────│                │                │
```

### 2.2 Voting & Majority Decision

```
Coordinator      Frontend         Backend          Database
  │                │                │                │
  │ Click "Valid"  │                │                │
  │───────────────►│                │                │
  │                │ POST /votes    │                │
  │                │───────────────►│                │
  │                │                │ Check area match│
  │                │                │───────────────►│
  │                │                │◄───────────────│ OK
  │                │                │ Check duplicate │
  │                │                │───────────────►│
  │                │                │◄───────────────│ not voted
  │                │                │ Save vote       │
  │                │                │───────────────►│
  │                │                │◄───────────────│ saved
  │                │                │ Count votes     │
  │                │                │───────────────►│
  │                │                │◄───────────────│ 3/5 valid
  │                │                │                │
  │                │                │ ▼ MAJORITY! (≥60%)
  │                │                │                │
  │                │                │ Update status   │
  │                │                │───────────────►│APPROVED
  │                │                │ Calc intensity  │
  │                │                │───────────────►│
  │                │                │ Auto-assign     │
  │                │                │───────────────►│coordinator
  │                │                │ Set SLA         │
  │                │                │───────────────►│deadline
  │                │                │ Notify all      │
  │                │                │───────────────►│
  │                │ 200 OK         │                │
  │                │◄───────────────│                │
  │ "Vote recorded"│                │                │
  │◄───────────────│                │                │
```

### 2.3 Proof Submission & Verification

```
Coordinator      Frontend         Backend          Database
  │                │                │                │
  │ Capture Photo  │                │                │
  │ + GPS auto     │                │                │
  │───────────────►│                │                │
  │                │ POST /proofs   │                │
  │                │ (photo, gps)   │                │
  │                │───────────────►│                │
  │                │                │ Check assigned  │
  │                │                │───────────────►│
  │                │                │◄───────────────│ OK
  │                │                │ Check status    │
  │                │                │───────────────►│
  │                │                │◄───────────────│ IN_PROGRESS
  │                │                │                │
  │                │                │ Haversine(      │
  │                │                │   complaint.gps,│
  │                │                │   proof.gps)    │
  │                │                │ = 45m ✅        │
  │                │                │                │
  │                │                │ Save proof      │
  │                │                │───────────────►│
  │                │                │ Status→COMPLETED│
  │                │                │───────────────►│
  │                │                │ Notify citizen  │
  │                │                │───────────────►│
  │                │ 201 Created    │                │
  │                │◄───────────────│                │
  │ "Proof accepted│                │                │
  │  (45m away)"   │                │                │
  │◄───────────────│                │                │
```

---

## 3. Class Diagram (Backend)

```
┌──────────────────────────────────┐
│           User (Entity)          │
├──────────────────────────────────┤
│ - id: Long                       │
│ - username: String               │
│ - email: String                  │
│ - passwordHash: String           │
│ - role: Role (CITIZEN/COORD/ADM) │
│ - city: String                   │
│ - phone: String                  │
│ - trustLevel: TrustLevel         │
│ - status: UserStatus             │
│ - createdAt: LocalDateTime       │
├──────────────────────────────────┤
│ + getComplaints(): List          │
│ + getVotes(): List               │
└─────────┬────────────────────────┘
          │ 1:N
          ▼
┌──────────────────────────────────┐
│        Complaint (Entity)        │
├──────────────────────────────────┤
│ - id: Long                       │
│ - citizen: User (FK)             │
│ - category: Category             │
│ - description: String            │
│ - imagePath: String              │
│ - latitude: Double               │
│ - longitude: Double              │
│ - gpsAccuracy: Double            │
│ - status: ComplaintStatus        │
│ - priority: Priority             │
│ - intensityScore: Double         │
│ - area: Area (FK)                │
│ - assignedCoordinator: User (FK) │
│ - slaDeadline: LocalDateTime     │
│ - reopenCount: Integer           │
│ - escalationLevel: Integer       │
│ - createdAt: LocalDateTime       │
│ - closedAt: LocalDateTime        │
├──────────────────────────────────┤
│ + getVotes(): List<Vote>         │
│ + getProofs(): List<Proof>       │
│ + getComments(): List<Comment>   │
└─────────┬────────┬───────────────┘
          │ 1:N    │ 1:N
    ┌─────┘        └──────┐
    ▼                     ▼
┌───────────────┐  ┌────────────────┐
│  Vote (Entity)│  │ Proof (Entity) │
├───────────────┤  ├────────────────┤
│- id: Long     │  │- id: Long      │
│- complaint: FK│  │- complaint: FK │
│- coordinator: │  │- coordinator:FK│
│  User (FK)    │  │- imagePath     │
│- decision:    │  │- latitude      │
│  VoteDecision │  │- longitude     │
│- comment      │  │- distance: Dbl │
│- createdAt    │  │- createdAt     │
└───────────────┘  └────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  Comment (Entity)│  │Notification(Ent) │
├──────────────────┤  ├──────────────────┤
│- id: Long        │  │- id: Long        │
│- complaint: FK   │  │- user: FK        │
│- author: User FK │  │- type: NotifType │
│- content: String │  │- message: String │
│- parentId: Long  │  │- complaintId:Long│
│- isDeleted: Bool │  │- isRead: Boolean │
│- createdAt       │  │- createdAt       │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│   Area (Entity)  │  │ SlaConfig(Entity)│
├──────────────────┤  ├──────────────────┤
│- id: Long        │  │- id: Long        │
│- name: String    │  │- category:Categry│
│- city: String    │  │- slaHours: Int   │
│- centerLat: Dbl  │  └──────────────────┘
│- centerLng: Dbl  │
│- boundaryLatMin  │  ┌──────────────────┐
│- boundaryLatMax  │  │AuditLog (Entity) │
│- boundaryLngMin  │  ├──────────────────┤
│- boundaryLngMax  │  │- id: Long        │
└──────────────────┘  │- actor: User FK  │
                      │- action: String  │
┌──────────────────┐  │- entityType      │
│Escalation(Entity)│  │- entityId: Long  │
├──────────────────┤  │- oldValue        │
│- id: Long        │  │- newValue        │
│- complaint: FK   │  │- ipAddress       │
│- level: Integer  │  │- createdAt       │
│- reason: String  │  └──────────────────┘
│- status: EscStat │
│- adminNote       │
│- createdAt       │
└──────────────────┘
```

### Service Layer Classes

```
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AuthService                 ComplaintService               │
│  ├─ register(dto): User      ├─ create(dto): Complaint     │
│  ├─ login(dto): TokenResponse├─ getById(id): Complaint     │
│  └─ validateToken(token)     ├─ getFiltered(filters): Page │
│                              ├─ checkRateLimit(userId)     │
│  VoteService                 ├─ checkDuplicate(lat,lng,cat)│
│  ├─ castVote(dto): Vote      └─ assignArea(lat,lng): Area  │
│  ├─ checkMajority(cId)                                     │
│  └─ getVoteCount(cId)        ProofService                  │
│                              ├─ submit(dto): Proof         │
│  SlaService                  ├─ verifyDistance(p,c): Double│
│  ├─ checkDeadlines()         └─ validateAssignment(uid,cid)│
│  ├─ escalate(complaint)                                     │
│  └─ calculateDeadline(cat)   NotificationService           │
│                              ├─ create(type,userId,msg)    │
│  AdminService                ├─ markRead(id)               │
│  ├─ createCoordinator(dto)   └─ getUnread(userId): List    │
│  ├─ updateUserStatus(id,st)                                 │
│  ├─ updateTrustLevel(id,tl)  AuditService                  │
│  └─ getAuditLogs(filters)   ├─ log(action,entity,old,new) │
│                              └─ getByFilters(f): Page      │
└─────────────────────────────────────────────────────────────┘
```

### Controller Layer

```
┌─────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER (REST)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AuthController          → /api/auth/*                      │
│  ComplaintController     → /api/complaints/*                │
│  VoteController          → /api/votes/*                     │
│  ProofController         → /api/proofs/*                    │
│  CommentController       → /api/comments/*                  │
│  NotificationController  → /api/notifications/*             │
│  AdminController         → /api/admin/*                     │
│  MapController           → /api/map/*                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. State Transition Diagram (Complaint Status Machine)

```
                    ┌────────┐
           ┌───────│  DRAFT │───────┐
           │       └────┬───┘       │
           │            │           │
      (citizen edits)   │ Submit    │ (citizen deletes)
           │            ▼           │
           │   ┌────────────────┐   │
           └──►│ PENDING_REVIEW │   │
               └───────┬────────┘   │
                       │            │
            Voting     │            │
          ┌────────────┼────────────┤
          │            │            │
          ▼            ▼            ▼
   ┌──────────┐  ┌──────────┐  ┌──────────────┐
   │ APPROVED │  │ REJECTED │  │NEEDS_CLARIFY │
   └────┬─────┘  └──────────┘  └──────────────┘
        │
        │ Auto-assign
        ▼
   ┌──────────┐
   │ ASSIGNED │
   └────┬─────┘
        │
        │ Coordinator marks
        ▼
   ┌─────────────┐
   │ IN_PROGRESS │
   └────┬────────┘
        │
        ├──── SLA exceeded ─────┐
        │                       ▼
        │               ┌───────────┐
        │               │  DELAYED  │
        │               └─────┬─────┘
        │                     │
        │◄────────────────────┘
        │    (still submits proof)
        │
        │ Submit proof (geo-verified)
        ▼
   ┌───────────┐
   │ COMPLETED │
   └─────┬─────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ CLOSED │ │ REOPENED │──── back to ASSIGNED
└────────┘ └──────────┘    (new coordinator)

   ┌──────────────┐
   │ AUTO_CLOSED  │ (7 days no citizen response)
   └──────────────┘

   ┌──────────────────┐
   │ ADMIN_REVIEW     │ (vote tie, max reopens, manual)
   └──────────────────┘
```

### Allowed Transitions Table

| From | To | Trigger | Actor |
|---|---|---|---|
| — | DRAFT | Citizen starts form | Citizen |
| DRAFT | PENDING_REVIEW | Citizen submits | Citizen |
| DRAFT | (deleted) | Citizen deletes draft | Citizen |
| PENDING_REVIEW | APPROVED | ≥60% VALID votes | System |
| PENDING_REVIEW | REJECTED | ≥60% INVALID votes | System |
| PENDING_REVIEW | NEEDS_CLARIFICATION | Majority request | System |
| PENDING_REVIEW | ADMIN_REVIEW | Vote tie / timeout | System |
| APPROVED | ASSIGNED | Auto-assignment | System |
| ASSIGNED | IN_PROGRESS | Acknowledges | Coordinator |
| IN_PROGRESS | COMPLETED | Geo-verified proof | Coordinator |
| IN_PROGRESS | DELAYED | SLA exceeded | System |
| DELAYED | COMPLETED | Proof (late resolution) | Coordinator |
| COMPLETED | CLOSED | Citizen accepts | Citizen |
| COMPLETED | REOPENED | Citizen rejects | Citizen |
| COMPLETED | AUTO_CLOSED | 7-day timeout | System |
| REOPENED | ASSIGNED | Reassignment | System |
| ADMIN_REVIEW | APPROVED | Admin decides | Admin |
| ADMIN_REVIEW | REJECTED | Admin decides | Admin |
| ADMIN_REVIEW | CLOSED | Admin force-close | Admin |

### Invalid Transitions (BLOCKED)

| From | To | Why |
|---|---|---|
| DRAFT | APPROVED | Must go through voting |
| DRAFT | CLOSED | Cannot close without lifecycle |
| PENDING_REVIEW | IN_PROGRESS | Must be assigned first |
| ASSIGNED | COMPLETED | Must go through IN_PROGRESS |
| REJECTED | ASSIGNED | Rejected is terminal |
| CLOSED | REOPENED | Closed is terminal |

---

## 5. Activity Diagram — Full Complaint Lifecycle

```
(Start)
   │
   ▼
[Citizen submits complaint]
   │
   ▼
<Trust level OK?> ──No──► [Error: Restricted] ──► (End)
   │ Yes
   ▼
<Rate limit OK?> ──No──► [Error: Max reached] ──► (End)
   │ Yes
   ▼
<Duplicate?> ──Yes──► [Error: Similar exists] ──► (End)
   │ No
   ▼
<GPS in coverage?> ──No──► [Error: Outside area] ──► (End)
   │ Yes
   ▼
[Save complaint as PENDING_REVIEW]
   │
   ▼
[Notify coordinators in area]
   │
   ▼
═══════════════════════════════
  PARALLEL: Coordinators vote
═══════════════════════════════
   │
   ▼
<Majority?> ──Tie──► [Escalate to admin] ──► (Admin Review)
   │
   ├── ≥60% INVALID ──► [Status: REJECTED, Citizen strike++] ──► (End)
   │
   ├── ≥60% VALID
   │
   ▼
[Status: APPROVED]
   │
   ▼
[Calculate intensity score]
   │
   ▼
[Auto-assign coordinator (random, load-balanced)]
   │
   ▼
[Status: ASSIGNED, SLA timer starts]
   │
   ▼
[Coordinator marks IN_PROGRESS]
   │
   ▼                          ┌──────────────────────────┐
[Working on resolution]       │ SLA SCHEDULER (parallel) │
   │                          │                          │
   │                          │ Check every hour:        │
   │                          │ If SLA exceeded →        │
   │                          │   Status: DELAYED        │
   │                          │   Escalation created     │
   │                          └──────────────────────────┘
   │
   ▼
[Coordinator goes to site]
   │
   ▼
[Capture photo + GPS]
   │
   ▼
<Distance ≤ 100m?> ──No──► [Error: Too far] ──► (Retry)
   │ Yes
   ▼
[Save proof, Status: COMPLETED]
   │
   ▼
[Notify citizen]
   │
   ▼
<Citizen response?>
   │
   ├── Accept ──► [Status: CLOSED] ──► (End) ✅
   │
   ├── Reject
   │     │
   │     ▼
   │   <Reopen count < 3?> ──No──► [Admin Review] ──► (End)
   │     │ Yes
   │     ▼
   │   [Status: REOPENED]
   │   [Assign NEW coordinator]
   │   [Back to ASSIGNED] ──────────────────► (Loop back)
   │
   └── No response (7 days) ──► [Status: AUTO_CLOSED] ──► (End)
```

---

## 6. Component Diagram (System Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐ │
│  │ React SPA  │  │   Axios    │  │  Router  │  │ React State│ │
│  │ Components │──│  (HTTP)    │──│  (SPA)   │──│  (Hooks)   │ │
│  └────────────┘  └──────┬─────┘  └──────────┘  └────────────┘ │
│                         │                                       │
│  ┌────────────┐  ┌──────┴─────┐                                │
│  │  WebRTC    │  │ Geolocation│                                │
│  │  Camera    │  │    API     │                                │
│  └────────────┘  └────────────┘                                │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTPS / REST / JSON
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Spring Boot)                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  SECURITY FILTER CHAIN                     │ │
│  │  JWT Filter → Role Check → Rate Limit → Controller        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ Controllers  │──│   Services   │──│  Repositories    │     │
│  │ (REST API)   │  │ (Business)   │  │  (JPA/Hibernate) │     │
│  └──────────────┘  └──────────────┘  └────────┬─────────┘     │
│                                                │               │
│  ┌──────────────┐  ┌──────────────┐           │               │
│  │  Scheduler   │  │ Audit Logger │           │               │
│  │  (SLA Check) │  │ (All actions)│           │               │
│  └──────────────┘  └──────────────┘           │               │
└────────────────────────────────────────────────┼───────────────┘
                                                 │ JDBC
                                                 ▼
                                    ┌────────────────────┐
                                    │    PostgreSQL 15    │
                                    │                    │
                                    │  10 tables         │
                                    │  Indexes           │
                                    │  FK constraints    │
                                    │  CHECK constraints │
                                    └────────────────────┘
```
