-- ═══════════════════════════════════════════════════════════════════════════
--  CityWatch — V1: Initial Schema Migration
--  Run this in Supabase SQL Editor ONCE before starting the backend.
--  After running: set spring.jpa.hibernate.ddl-auto=validate
--
--  ID Formats:
--    users        : {STATE}{RTO}{TYPE}{7-seq}       = 12 chars  e.g. GJ05C0000001
--    complaints   : CMP-{DDMMYY}-{6-seq}            = 17 chars  e.g. CMP-090426-000001
--    votes        : VOT-{DDMMYY}-{6-seq}            = 17 chars
--    comments     : CMT-{DDMMYY}-{6-seq}            = 17 chars
--    proofs       : PRF-{DDMMYY}-{6-seq}            = 17 chars
--    escalations  : ESC-{DDMMYY}-{6-seq}            = 17 chars
--    notifications: NTF-{DDMMYY}-{6-seq}            = 17 chars
--    audit_logs   : AUD-{DDMMYY}-{6-seq}            = 17 chars
--    areas        : BIGSERIAL (plain integer, kept simple)
--    sla_config   : BIGSERIAL (config table, only 5 rows)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── SAFETY: Drop all existing tables (order matters — FK dependencies) ────
DROP TABLE IF EXISTS audit_logs        CASCADE;
DROP TABLE IF EXISTS notifications     CASCADE;
DROP TABLE IF EXISTS escalations       CASCADE;
DROP TABLE IF EXISTS complaint_upvotes CASCADE;
DROP TABLE IF EXISTS complaint_images  CASCADE;
DROP TABLE IF EXISTS proofs            CASCADE;
DROP TABLE IF EXISTS comments          CASCADE;
DROP TABLE IF EXISTS votes             CASCADE;
DROP TABLE IF EXISTS complaints        CASCADE;
DROP TABLE IF EXISTS sla_config        CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
DROP TABLE IF EXISTS areas             CASCADE;

-- ─── SAFETY: Drop all sequences ─────────────────────────────────────────────
DROP SEQUENCE IF EXISTS cw_user_c_seq;
DROP SEQUENCE IF EXISTS cw_user_m_seq;
DROP SEQUENCE IF EXISTS cw_user_a_seq;
DROP SEQUENCE IF EXISTS cw_complaint_seq;
DROP SEQUENCE IF EXISTS cw_vote_seq;
DROP SEQUENCE IF EXISTS cw_comment_seq;
DROP SEQUENCE IF EXISTS cw_proof_seq;
DROP SEQUENCE IF EXISTS cw_escalation_seq;
DROP SEQUENCE IF EXISTS cw_notification_seq;
DROP SEQUENCE IF EXISTS cw_audit_seq;

-- ════════════════════════════════════════════════════════════════════════════
--  SEQUENCES (one per entity type that uses custom IDs)
-- ════════════════════════════════════════════════════════════════════════════
CREATE SEQUENCE cw_user_c_seq      START 1 INCREMENT 1;  -- Citizens
CREATE SEQUENCE cw_user_m_seq      START 1 INCREMENT 1;  -- Moderators/Coordinators
CREATE SEQUENCE cw_user_a_seq      START 1 INCREMENT 1;  -- Admins
CREATE SEQUENCE cw_complaint_seq   START 1 INCREMENT 1;
CREATE SEQUENCE cw_vote_seq        START 1 INCREMENT 1;
CREATE SEQUENCE cw_comment_seq     START 1 INCREMENT 1;
CREATE SEQUENCE cw_proof_seq       START 1 INCREMENT 1;
CREATE SEQUENCE cw_escalation_seq  START 1 INCREMENT 1;
CREATE SEQUENCE cw_notification_seq START 1 INCREMENT 1;
CREATE SEQUENCE cw_audit_seq       START 1 INCREMENT 1;

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 1: areas  (BIGSERIAL — simple, never user-facing as a reference)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE areas (
    id               BIGSERIAL      PRIMARY KEY,
    name             VARCHAR(100)   UNIQUE NOT NULL,
    city             VARCHAR(100)   NOT NULL,
    boundary_lat_min DOUBLE PRECISION,
    boundary_lat_max DOUBLE PRECISION,
    boundary_lng_min DOUBLE PRECISION,
    boundary_lng_max DOUBLE PRECISION,
    center_lat       DOUBLE PRECISION NOT NULL,
    center_lng       DOUBLE PRECISION NOT NULL,
    deleted          BOOLEAN        DEFAULT FALSE,
    created_at       TIMESTAMP      DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 2: users  (12-char structured ID)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE users (
    id             VARCHAR(12)  PRIMARY KEY,   -- e.g. GJ05C0000001
    username       VARCHAR(50)  UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(15)  UNIQUE,
    role           VARCHAR(20)  NOT NULL CHECK (role IN ('CITIZEN', 'COORDINATOR', 'ADMIN')),
    trust_level    VARCHAR(20)  DEFAULT 'NORMAL'  CHECK (trust_level IN ('NORMAL', 'UNDER_REVIEW', 'RESTRICTED')),
    status         VARCHAR(20)  DEFAULT 'ACTIVE'  CHECK (status IN ('ACTIVE', 'WARNING', 'SUSPENDED')),
    strike_count   INTEGER      DEFAULT 0,
    area_id        BIGINT       REFERENCES areas(id),        -- nullable (coordinators only)
    city           VARCHAR(100) NOT NULL,
    state_code     VARCHAR(2),                               -- stored for reference (e.g. GJ)
    rto_code       VARCHAR(2),                               -- stored for reference (e.g. 05)
    created_at     TIMESTAMP    DEFAULT NOW(),
    updated_at     TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_area_id ON users(area_id);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 3: sla_config (BIGSERIAL — only 5 rows, admin config, not user-facing)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE sla_config (
    id         BIGSERIAL    PRIMARY KEY,
    category   VARCHAR(30)  UNIQUE NOT NULL
                            CHECK (category IN ('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'DRAINAGE', 'OTHER')),
    sla_hours  INTEGER      NOT NULL,
    deleted    BOOLEAN      DEFAULT FALSE,
    created_by VARCHAR(12)  REFERENCES users(id),   -- admin who set it (nullable)
    updated_at TIMESTAMP    DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 4: complaints (17-char CMP- ID)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE complaints (
    id                      VARCHAR(17)  PRIMARY KEY,  -- e.g. CMP-090426-000001
    citizen_id              VARCHAR(12)  NOT NULL REFERENCES users(id),
    area_id                 BIGINT       NOT NULL REFERENCES areas(id),
    category                VARCHAR(30)  NOT NULL
                            CHECK (category IN ('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'DRAINAGE', 'OTHER')),
    description             TEXT         NOT NULL,
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    status                  VARCHAR(30)  NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED',
                                              'ASSIGNED', 'IN_PROGRESS', 'DELAYED', 'COMPLETED',
                                              'CLOSED', 'REOPENED', 'ESCALATED')),
    intensity_score         DOUBLE PRECISION DEFAULT 0.0,
    priority                VARCHAR(10)  DEFAULT 'LOW'
                            CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_coordinator_id VARCHAR(12)  REFERENCES users(id),  -- nullable
    sla_deadline            TIMESTAMP,
    escalation_level        INTEGER      DEFAULT 0,
    reopen_count            INTEGER      DEFAULT 0,
    deleted                 BOOLEAN      DEFAULT FALSE,
    created_at              TIMESTAMP    DEFAULT NOW(),
    updated_at              TIMESTAMP    DEFAULT NOW(),
    closed_at               TIMESTAMP
);

CREATE INDEX idx_complaint_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaint_area    ON complaints(area_id);
CREATE INDEX idx_complaint_status  ON complaints(status);
CREATE INDEX idx_complaint_category ON complaints(category);
CREATE INDEX idx_complaint_location ON complaints(latitude, longitude);
CREATE INDEX idx_complaint_sla      ON complaints(sla_deadline) WHERE sla_deadline IS NOT NULL;

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 5: complaint_images (@ElementCollection — JPA-managed join table)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE complaint_images (
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    image_url    VARCHAR(500) NOT NULL
);

CREATE INDEX idx_complaint_images_cid ON complaint_images(complaint_id);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 6: complaint_upvotes (@ElementCollection — citizen upvotes)
--  NOTE: citizen_id is VARCHAR(12) to match users.id, but no FK enforced
--        (JPA ElementCollection limitation). Orphan IDs are possible if user is deleted.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE complaint_upvotes (
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id   VARCHAR(12)  NOT NULL  -- no FK — @ElementCollection limitation
);

CREATE UNIQUE INDEX idx_upvote_unique ON complaint_upvotes(complaint_id, citizen_id);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 7: votes (17-char VOT- ID)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE votes (
    id             VARCHAR(17)  PRIMARY KEY,  -- e.g. VOT-090426-000001
    complaint_id   VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    coordinator_id VARCHAR(12)  NOT NULL REFERENCES users(id),
    decision       VARCHAR(20)  NOT NULL
                   CHECK (decision IN ('VALID', 'INVALID', 'NEEDS_CLARIFICATION')),
    comment        TEXT,
    voted_at       TIMESTAMP    DEFAULT NOW(),
    UNIQUE(complaint_id, coordinator_id)      -- one vote per coordinator per complaint
);

CREATE INDEX idx_votes_complaint ON votes(complaint_id);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 8: proofs (17-char PRF- ID)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE proofs (
    id                      VARCHAR(17)  PRIMARY KEY,  -- e.g. PRF-090426-000001
    complaint_id            VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    coordinator_id          VARCHAR(12)  NOT NULL REFERENCES users(id),
    image_url               VARCHAR(500) NOT NULL,
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    distance_from_complaint DOUBLE PRECISION,
    is_location_valid       BOOLEAN      DEFAULT FALSE,
    submitted_at            TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_proofs_complaint ON proofs(complaint_id);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 9: comments (17-char CMT- ID, self-referential for threads)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE comments (
    id           VARCHAR(17)  PRIMARY KEY,  -- e.g. CMT-090426-000001
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    user_id      VARCHAR(12)  NOT NULL REFERENCES users(id),
    content      TEXT         NOT NULL,
    parent_id    VARCHAR(17)  REFERENCES comments(id),   -- null = top-level, else threaded
    is_moderated BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_comments_complaint ON comments(complaint_id);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 10: escalations (17-char ESC- ID)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE escalations (
    id           VARCHAR(17)  PRIMARY KEY,  -- e.g. ESC-090426-000001
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    level        INTEGER      NOT NULL CHECK (level BETWEEN 1 AND 3),
    reason       VARCHAR(50)  NOT NULL
                 CHECK (reason IN ('SLA_EXCEEDED', 'CITIZEN_REJECTION', 'ADMIN_TRIGGER')),
    notes        TEXT,
    is_resolved  BOOLEAN      DEFAULT FALSE,
    triggered_at TIMESTAMP    DEFAULT NOW(),
    resolved_at  TIMESTAMP
);

CREATE INDEX idx_escalations_complaint ON escalations(complaint_id);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 11: notifications (17-char NTF- ID)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id           VARCHAR(17)  PRIMARY KEY,  -- e.g. NTF-090426-000001
    user_id      VARCHAR(12)  NOT NULL REFERENCES users(id),
    title        VARCHAR(200) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(30)  NOT NULL
                 CHECK (type IN ('COMPLAINT_UPDATE', 'VOTE_REQUIRED', 'SLA_WARNING', 'ESCALATION', 'SYSTEM')),
    reference_id VARCHAR(17),               -- loose pointer: complaint or escalation ID (no FK intentional)
    is_read      BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- ════════════════════════════════════════════════════════════════════════════
--  TABLE 12: audit_logs (17-char AUD- ID, append-only)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
    id          VARCHAR(17)  PRIMARY KEY,  -- e.g. AUD-090426-000001
    user_id     VARCHAR(12)  REFERENCES users(id),   -- nullable = system action
    action      VARCHAR(50)  NOT NULL,
    entity_type VARCHAR(30)  NOT NULL,
    entity_id   VARCHAR(17)  NOT NULL,    -- generic reference (complaint, user, vote IDs)
    old_value   TEXT,
    new_value   TEXT,
    ip_address  VARCHAR(45),
    timestamp   TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_audit_entity   ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
