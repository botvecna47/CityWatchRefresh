# CityWatch — Database Schema (Detailed)

## ER Diagram (Text Representation)

```
┌──────────┐     ┌───────────┐     ┌─────────────┐
│  users   │────<│   votes   │>────│ complaints  │
│          │     └───────────┘     │             │
│          │                       │             │
│          │────<┌───────────┐>────│             │
│          │     │ comments  │     │             │
│          │     └───────────┘     │             │
│          │                       │             │
│          │────<┌───────────┐>────│             │
│          │     │  proofs   │     │             │
│          │     └───────────┘     │             │
│          │                       │             │
│          │     ┌───────────┐     │             │
│          │     │   areas   │────>│             │
└──────────┘     └───────────┘     │             │
                                   │             │
                 ┌───────────┐>────│             │
                 │escalations│     └─────────────┘
                 └───────────┘
                 ┌───────────┐
                 │audit_logs │
                 └───────────┘
                 ┌───────────────┐
                 │ notifications │
                 └───────────────┘
```

---

## Table Definitions

### 1. `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Auto-increment user ID |
| `username` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Display name |
| `email` | `VARCHAR(100)` | `UNIQUE NOT NULL` | Login email |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | BCrypt hashed password |
| `phone` | `VARCHAR(15)` | `UNIQUE` | Phone for notifications |
| `role` | `VARCHAR(20)` | `NOT NULL` | Enum: `CITIZEN`, `COORDINATOR`, `ADMIN` |
| `trust_level` | `VARCHAR(20)` | `DEFAULT 'NORMAL'` | Enum: `NORMAL`, `UNDER_REVIEW`, `RESTRICTED` |
| `status` | `VARCHAR(20)` | `DEFAULT 'ACTIVE'` | Enum: `ACTIVE`, `WARNING`, `SUSPENDED` |
| `strike_count` | `INTEGER` | `DEFAULT 0` | For abuse tracking |
| `area_id` | `BIGINT` | `FK → areas.id, NULLABLE` | Assigned area (coordinators only) |
| `city` | `VARCHAR(100)` | `NOT NULL` | City for verification |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Registration time |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Last profile update |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`
- `idx_users_area_id` on `area_id`

---

### 2. `areas`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Auto-increment area ID |
| `name` | `VARCHAR(100)` | `UNIQUE NOT NULL` | Area/zone name |
| `city` | `VARCHAR(100)` | `NOT NULL` | Parent city |
| `boundary_lat_min` | `DOUBLE PRECISION` | | Bounding box south |
| `boundary_lat_max` | `DOUBLE PRECISION` | | Bounding box north |
| `boundary_lng_min` | `DOUBLE PRECISION` | | Bounding box west |
| `boundary_lng_max` | `DOUBLE PRECISION` | | Bounding box east |
| `center_lat` | `DOUBLE PRECISION` | `NOT NULL` | Center latitude |
| `center_lng` | `DOUBLE PRECISION` | `NOT NULL` | Center longitude |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

> [!NOTE]
> For the mini project, a simple bounding-box approach is sufficient. PostGIS `GEOMETRY` columns can be added later for polygon-based zones.

---

### 3. `complaints`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Complaint ID |
| `citizen_id` | `BIGINT` | `FK → users.id, NOT NULL` | Submitter |
| `area_id` | `BIGINT` | `FK → areas.id, NOT NULL` | Auto-assigned from GPS |
| `category` | `VARCHAR(30)` | `NOT NULL` | Enum: `POTHOLE`, `GARBAGE`, `STREETLIGHT`, `DRAINAGE`, `OTHER` |
| `description` | `TEXT` | `NOT NULL, MIN(50 chars)` | Complaint details |
| `image_url` | `VARCHAR(500)` | `NOT NULL` | Live-captured image path |
| `latitude` | `DOUBLE PRECISION` | `NOT NULL` | GPS lat from browser |
| `longitude` | `DOUBLE PRECISION` | `NOT NULL` | GPS lng from browser |
| `status` | `VARCHAR(30)` | `NOT NULL, DEFAULT 'DRAFT'` | See status lifecycle below |
| `intensity_score` | `DOUBLE PRECISION` | `DEFAULT 0.0` | Calculated after approval |
| `priority` | `VARCHAR(10)` | `DEFAULT 'LOW'` | Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `assigned_coordinator_id` | `BIGINT` | `FK → users.id, NULLABLE` | Assigned after approval |
| `sla_deadline` | `TIMESTAMP` | `NULLABLE` | Calculated from category SLA |
| `escalation_level` | `INTEGER` | `DEFAULT 0` | 0–3 |
| `reopen_count` | `INTEGER` | `DEFAULT 0` | Times citizen rejected resolution |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | |
| `closed_at` | `TIMESTAMP` | `NULLABLE` | When finally closed |

**Status enum values:**
```
DRAFT → PENDING_REVIEW → APPROVED → ASSIGNED → IN_PROGRESS →
COMPLETED → CLOSED
                                                 ↓
                                             REOPENED → ASSIGNED (re-cycle)

PENDING_REVIEW → REJECTED

Any non-closed → DELAYED (system) → ESCALATED (system)
```

**Indexes:**
- `idx_complaints_citizen_id` on `citizen_id`
- `idx_complaints_area_id` on `area_id`
- `idx_complaints_status` on `status`
- `idx_complaints_category` on `category`
- `idx_complaints_location` on `(latitude, longitude)` — for radius queries
- `idx_complaints_sla_deadline` on `sla_deadline` — for SLA checker

---

### 4. `votes`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | |
| `complaint_id` | `BIGINT` | `FK → complaints.id, NOT NULL` | |
| `coordinator_id` | `BIGINT` | `FK → users.id, NOT NULL` | |
| `decision` | `VARCHAR(20)` | `NOT NULL` | Enum: `VALID`, `INVALID`, `NEEDS_CLARIFICATION` |
| `comment` | `TEXT` | `NULLABLE` | Optional reason |
| `voted_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

**Constraints:**
- `UNIQUE(complaint_id, coordinator_id)` — one vote per coordinator per complaint

---

### 5. `proofs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | |
| `complaint_id` | `BIGINT` | `FK → complaints.id, NOT NULL` | |
| `coordinator_id` | `BIGINT` | `FK → users.id, NOT NULL` | |
| `image_url` | `VARCHAR(500)` | `NOT NULL` | Live-captured proof image |
| `latitude` | `DOUBLE PRECISION` | `NOT NULL` | GPS at proof time |
| `longitude` | `DOUBLE PRECISION` | `NOT NULL` | GPS at proof time |
| `distance_from_complaint` | `DOUBLE PRECISION` | | Calculated by backend (meters) |
| `is_location_valid` | `BOOLEAN` | `DEFAULT FALSE` | TRUE if within allowed radius |
| `submitted_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

**Validation rule:** `distance_from_complaint <= 100 meters` (configurable)

---

### 6. `comments`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | |
| `complaint_id` | `BIGINT` | `FK → complaints.id, NOT NULL` | |
| `user_id` | `BIGINT` | `FK → users.id, NOT NULL` | |
| `content` | `TEXT` | `NOT NULL, MIN(5 chars)` | Comment text |
| `parent_id` | `BIGINT` | `FK → comments.id, NULLABLE` | For threaded replies |
| `is_moderated` | `BOOLEAN` | `DEFAULT FALSE` | Admin moderation flag |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

---

### 7. `escalations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | |
| `complaint_id` | `BIGINT` | `FK → complaints.id, NOT NULL` | |
| `level` | `INTEGER` | `NOT NULL` | 1=Admin notified, 2=High attention, 3=Review required |
| `reason` | `VARCHAR(50)` | `NOT NULL` | Enum: `SLA_EXCEEDED`, `CITIZEN_REJECTION`, `ADMIN_TRIGGER` |
| `notes` | `TEXT` | `NULLABLE` | Admin notes |
| `resolved` | `BOOLEAN` | `DEFAULT FALSE` | |
| `triggered_at` | `TIMESTAMP` | `DEFAULT NOW()` | |
| `resolved_at` | `TIMESTAMP` | `NULLABLE` | |

---

### 8. `notifications`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | |
| `user_id` | `BIGINT` | `FK → users.id, NOT NULL` | Recipient |
| `title` | `VARCHAR(200)` | `NOT NULL` | Short title |
| `message` | `TEXT` | `NOT NULL` | Full message |
| `type` | `VARCHAR(30)` | `NOT NULL` | Enum: `COMPLAINT_UPDATE`, `VOTE_REQUIRED`, `SLA_WARNING`, `ESCALATION`, `SYSTEM` |
| `reference_id` | `BIGINT` | `NULLABLE` | Complaint ID or Escalation ID |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

**Index:** `idx_notifications_user_unread` on `(user_id, is_read)`

---

### 9. `audit_logs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | |
| `user_id` | `BIGINT` | `FK → users.id, NULLABLE` | Actor (NULL for system actions) |
| `action` | `VARCHAR(50)` | `NOT NULL` | e.g., `COMPLAINT_CREATED`, `VOTE_CAST`, `STATUS_CHANGED` |
| `entity_type` | `VARCHAR(30)` | `NOT NULL` | e.g., `COMPLAINT`, `USER`, `VOTE` |
| `entity_id` | `BIGINT` | `NOT NULL` | ID of affected entity |
| `old_value` | `TEXT` | `NULLABLE` | Previous state (JSON) |
| `new_value` | `TEXT` | `NULLABLE` | New state (JSON) |
| `ip_address` | `VARCHAR(45)` | `NULLABLE` | Client IP |
| `timestamp` | `TIMESTAMP` | `DEFAULT NOW()` | |

> [!IMPORTANT]
> Audit logs must be **append-only**. No UPDATE or DELETE operations should be allowed on this table. Enforce via database permissions or application logic.

---

### 10. `sla_config` (Reference Table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | |
| `category` | `VARCHAR(30)` | `UNIQUE NOT NULL` | Complaint category |
| `sla_hours` | `INTEGER` | `NOT NULL` | Deadline in hours |
| `created_by` | `BIGINT` | `FK → users.id` | Admin who set it |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

**Default seed data:**

| Category | SLA (hours) |
|---|---|
| GARBAGE | 72 |
| POTHOLE | 168 |
| STREETLIGHT | 96 |
| DRAINAGE | 96 |
| OTHER | 168 |

---

## SQL: Complete Schema Creation Script

```sql
-- Enable PostGIS (optional, run only if needed)
-- CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE areas (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    city        VARCHAR(100) NOT NULL,
    boundary_lat_min DOUBLE PRECISION,
    boundary_lat_max DOUBLE PRECISION,
    boundary_lng_min DOUBLE PRECISION,
    boundary_lng_max DOUBLE PRECISION,
    center_lat  DOUBLE PRECISION NOT NULL,
    center_lng  DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(50) UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(15) UNIQUE,
    role           VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN', 'COORDINATOR', 'ADMIN')),
    trust_level    VARCHAR(20) DEFAULT 'NORMAL' CHECK (trust_level IN ('NORMAL', 'UNDER_REVIEW', 'RESTRICTED')),
    status         VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WARNING', 'SUSPENDED')),
    strike_count   INTEGER DEFAULT 0,
    area_id        BIGINT REFERENCES areas(id),
    city           VARCHAR(100) NOT NULL,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE complaints (
    id                      BIGSERIAL PRIMARY KEY,
    citizen_id              BIGINT NOT NULL REFERENCES users(id),
    area_id                 BIGINT NOT NULL REFERENCES areas(id),
    category                VARCHAR(30) NOT NULL CHECK (category IN ('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'DRAINAGE', 'OTHER')),
    description             TEXT NOT NULL,
    image_url               VARCHAR(500) NOT NULL,
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED',
                                              'ASSIGNED', 'IN_PROGRESS', 'DELAYED', 'COMPLETED',
                                              'CLOSED', 'REOPENED', 'ESCALATED')),
    intensity_score         DOUBLE PRECISION DEFAULT 0.0,
    priority                VARCHAR(10) DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_coordinator_id BIGINT REFERENCES users(id),
    sla_deadline            TIMESTAMP,
    escalation_level        INTEGER DEFAULT 0,
    reopen_count            INTEGER DEFAULT 0,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW(),
    closed_at               TIMESTAMP
);

CREATE TABLE votes (
    id              BIGSERIAL PRIMARY KEY,
    complaint_id    BIGINT NOT NULL REFERENCES complaints(id),
    coordinator_id  BIGINT NOT NULL REFERENCES users(id),
    decision        VARCHAR(20) NOT NULL CHECK (decision IN ('VALID', 'INVALID', 'NEEDS_CLARIFICATION')),
    comment         TEXT,
    voted_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(complaint_id, coordinator_id)
);

CREATE TABLE proofs (
    id                       BIGSERIAL PRIMARY KEY,
    complaint_id             BIGINT NOT NULL REFERENCES complaints(id),
    coordinator_id           BIGINT NOT NULL REFERENCES users(id),
    image_url                VARCHAR(500) NOT NULL,
    latitude                 DOUBLE PRECISION NOT NULL,
    longitude                DOUBLE PRECISION NOT NULL,
    distance_from_complaint  DOUBLE PRECISION,
    is_location_valid        BOOLEAN DEFAULT FALSE,
    submitted_at             TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
    id            BIGSERIAL PRIMARY KEY,
    complaint_id  BIGINT NOT NULL REFERENCES complaints(id),
    user_id       BIGINT NOT NULL REFERENCES users(id),
    content       TEXT NOT NULL,
    parent_id     BIGINT REFERENCES comments(id),
    is_moderated  BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE escalations (
    id            BIGSERIAL PRIMARY KEY,
    complaint_id  BIGINT NOT NULL REFERENCES complaints(id),
    level         INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    reason        VARCHAR(50) NOT NULL CHECK (reason IN ('SLA_EXCEEDED', 'CITIZEN_REJECTION', 'ADMIN_TRIGGER')),
    notes         TEXT,
    resolved      BOOLEAN DEFAULT FALSE,
    triggered_at  TIMESTAMP DEFAULT NOW(),
    resolved_at   TIMESTAMP
);

CREATE TABLE notifications (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    title        VARCHAR(200) NOT NULL,
    message      TEXT NOT NULL,
    type         VARCHAR(30) NOT NULL CHECK (type IN ('COMPLAINT_UPDATE', 'VOTE_REQUIRED', 'SLA_WARNING', 'ESCALATION', 'SYSTEM')),
    reference_id BIGINT,
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id   BIGINT NOT NULL,
    old_value   TEXT,
    new_value   TEXT,
    ip_address  VARCHAR(45),
    timestamp   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sla_config (
    id         BIGSERIAL PRIMARY KEY,
    category   VARCHAR(30) UNIQUE NOT NULL,
    sla_hours  INTEGER NOT NULL,
    created_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_area_id ON users(area_id);
CREATE INDEX idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX idx_complaints_area_id ON complaints(area_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_location ON complaints(latitude, longitude);
CREATE INDEX idx_complaints_sla_deadline ON complaints(sla_deadline);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Seed: SLA defaults
INSERT INTO sla_config (category, sla_hours) VALUES
    ('GARBAGE', 72),
    ('POTHOLE', 168),
    ('STREETLIGHT', 96),
    ('DRAINAGE', 96),
    ('OTHER', 168);
```

---

## Key Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| `users` → `areas` | Many-to-One | Coordinators are assigned to exactly one area |
| `complaints` → `users` | Many-to-One | Each complaint has one citizen |
| `complaints` → `areas` | Many-to-One | Each complaint belongs to one area |
| `complaints` → `users (coordinator)` | Many-to-One | Assigned coordinator (nullable) |
| `votes` → `complaints` | Many-to-One | Multiple votes per complaint |
| `votes` → `users` | Many-to-One | Each vote by one coordinator |
| `proofs` → `complaints` | Many-to-One | One or more proofs per complaint |
| `comments` → `complaints` | Many-to-One | Multiple comments per complaint |
| `comments` → `comments (self)` | Many-to-One | Threaded replies |
| `escalations` → `complaints` | Many-to-One | Multiple escalations possible |
| `notifications` → `users` | Many-to-One | Each notification for one user |
