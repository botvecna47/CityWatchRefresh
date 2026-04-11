-- ═══════════════════════════════════════════════════════════════════════════
--  CityWatch — MASTER SETUP (Clean Slate)
--  Includes: Schema Creation + Nanded Seed Data
--  
--  ID Formats:
--    users        : {STATE}{RTO}{TYPE}{7-seq}       = 12 chars  e.g. MH16C0000001
--    complaints   : CMP-{DDMMYY}-{6-seq}            = 17 chars  e.g. CMP-090426-000001
--    areas        : BIGSERIAL (kept as numbers for simplicity)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. DROP EVERYTHING ──────────────────────────────────────────────────────
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

-- ─── 2. CREATE SEQUENCES ─────────────────────────────────────────────────────
CREATE SEQUENCE cw_user_c_seq      START 1 INCREMENT 1;
CREATE SEQUENCE cw_user_m_seq      START 1 INCREMENT 1;
CREATE SEQUENCE cw_user_a_seq      START 1 INCREMENT 1;
CREATE SEQUENCE cw_complaint_seq   START 1 INCREMENT 1;
CREATE SEQUENCE cw_vote_seq        START 1 INCREMENT 1;
CREATE SEQUENCE cw_comment_seq     START 1 INCREMENT 1;
CREATE SEQUENCE cw_proof_seq       START 1 INCREMENT 1;
CREATE SEQUENCE cw_escalation_seq  START 1 INCREMENT 1;
CREATE SEQUENCE cw_notification_seq START 1 INCREMENT 1;
CREATE SEQUENCE cw_audit_seq       START 1 INCREMENT 1;

-- ─── 3. CREATE SCHEMA ────────────────────────────────────────────────────────
CREATE TABLE areas (
    id               BIGSERIAL      PRIMARY KEY,
    name             VARCHAR(100)   UNIQUE NOT NULL,
    city             VARCHAR(100)   NOT NULL,
    boundary_lat_min DOUBLE PRECISION, boundary_lat_max DOUBLE PRECISION,
    boundary_lng_min DOUBLE PRECISION, boundary_lng_max DOUBLE PRECISION,
    center_lat       DOUBLE PRECISION NOT NULL,
    center_lng       DOUBLE PRECISION NOT NULL,
    created_at       TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE users (
    id             VARCHAR(12)  PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(15)  UNIQUE,
    role           VARCHAR(20)  NOT NULL CHECK (role IN ('CITIZEN', 'COORDINATOR', 'ADMIN')),
    trust_level    VARCHAR(20)  DEFAULT 'NORMAL' CHECK (trust_level IN ('NORMAL', 'UNDER_REVIEW', 'RESTRICTED')),
    status         VARCHAR(20)  DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WARNING', 'SUSPENDED')),
    strike_count   INTEGER      DEFAULT 0,
    area_id        BIGINT       REFERENCES areas(id),
    city           VARCHAR(100) NOT NULL,
    state_code     VARCHAR(2),
    rto_code       VARCHAR(2),
    created_at     TIMESTAMP    DEFAULT NOW(),
    updated_at     TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE sla_config (
    id         BIGSERIAL    PRIMARY KEY,
    category   VARCHAR(30)  UNIQUE NOT NULL CHECK (category IN ('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'DRAINAGE', 'OTHER')),
    sla_hours  INTEGER      NOT NULL,
    created_by VARCHAR(12)  REFERENCES users(id),
    updated_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE complaints (
    id                      VARCHAR(17)  PRIMARY KEY,
    citizen_id              VARCHAR(12)  NOT NULL REFERENCES users(id),
    area_id                 BIGINT       NOT NULL REFERENCES areas(id),
    category                VARCHAR(30)  NOT NULL CHECK (category IN ('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'DRAINAGE', 'OTHER')),
    description             TEXT         NOT NULL,
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    status                  VARCHAR(30)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS', 'DELAYED', 'COMPLETED', 'CLOSED', 'REOPENED', 'ESCALATED')),
    intensity_score         DOUBLE PRECISION DEFAULT 0.0,
    priority                VARCHAR(10)  DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_coordinator_id VARCHAR(12)  REFERENCES users(id),
    sla_deadline            TIMESTAMP,
    escalation_level        INTEGER      DEFAULT 0,
    reopen_count            INTEGER      DEFAULT 0,
    created_at              TIMESTAMP    DEFAULT NOW(),
    updated_at              TIMESTAMP    DEFAULT NOW(),
    closed_at               TIMESTAMP
);

CREATE TABLE complaint_images (
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    image_url    VARCHAR(500) NOT NULL
);

CREATE TABLE complaint_upvotes (
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id   VARCHAR(12)  NOT NULL
);

CREATE TABLE votes (
    id             VARCHAR(17)  PRIMARY KEY,
    complaint_id   VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    coordinator_id VARCHAR(12)  NOT NULL REFERENCES users(id),
    decision       VARCHAR(20)  NOT NULL CHECK (decision IN ('VALID', 'INVALID', 'NEEDS_CLARIFICATION')),
    comment        TEXT,
    voted_at       TIMESTAMP    DEFAULT NOW(),
    UNIQUE(complaint_id, coordinator_id)
);

CREATE TABLE proofs (
    id                      VARCHAR(17)  PRIMARY KEY,
    complaint_id            VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    coordinator_id          VARCHAR(12)  NOT NULL REFERENCES users(id),
    image_url               VARCHAR(500) NOT NULL,
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    distance_from_complaint DOUBLE PRECISION,
    is_location_valid       BOOLEAN      DEFAULT FALSE,
    submitted_at            TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE comments (
    id           VARCHAR(17)  PRIMARY KEY,
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    user_id      VARCHAR(12)  NOT NULL REFERENCES users(id),
    content      TEXT         NOT NULL,
    parent_id    VARCHAR(17)  REFERENCES comments(id),
    is_moderated BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE escalations (
    id           VARCHAR(17)  PRIMARY KEY,
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id),
    level        INTEGER      NOT NULL CHECK (level BETWEEN 1 AND 3),
    reason       VARCHAR(50)  NOT NULL CHECK (reason IN ('SLA_EXCEEDED', 'CITIZEN_REJECTION', 'ADMIN_TRIGGER')),
    notes        TEXT,
    is_resolved  BOOLEAN      DEFAULT FALSE,
    triggered_at TIMESTAMP    DEFAULT NOW(),
    resolved_at  TIMESTAMP
);

CREATE TABLE notifications (
    id           VARCHAR(17)  PRIMARY KEY,
    user_id      VARCHAR(12)  NOT NULL REFERENCES users(id),
    title        VARCHAR(200) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(30)  NOT NULL CHECK (type IN ('COMPLAINT_UPDATE', 'VOTE_REQUIRED', 'SLA_WARNING', 'ESCALATION', 'SYSTEM')),
    reference_id VARCHAR(17),
    is_read      BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id          VARCHAR(17)  PRIMARY KEY,
    user_id     VARCHAR(12)  REFERENCES users(id),
    action      VARCHAR(50)  NOT NULL,
    entity_type VARCHAR(30)  NOT NULL,
    entity_id   VARCHAR(17)  NOT NULL,
    old_value   TEXT,
    new_value   TEXT,
    ip_address  VARCHAR(45),
    timestamp   TIMESTAMP    DEFAULT NOW()
);

-- ─── 4. SEED DATA ────────────────────────────────────────────────────────────

-- Areas (Nanded)
INSERT INTO areas (name, city, center_lat, center_lng) VALUES
    ('Shivajinagar', 'Nanded', 19.155, 77.307), ('CIDCO Colony', 'Nanded', 19.145, 77.325),
    ('Vazirabad', 'Nanded', 19.165, 77.335),    ('Asarjan', 'Nanded', 19.140, 77.295),
    ('Vishnupuri', 'Nanded', 19.170, 77.355),   ('Naganpura', 'Nanded', 19.132, 77.312),
    ('New Nanded', 'Nanded', 19.185, 77.310),    ('Degloor Naka', 'Nanded', 19.150, 77.370),
    ('Kasba', 'Nanded', 19.160, 77.297),         ('Huzur', 'Nanded', 19.175, 77.325);

-- Admin (Seed with password hash for Admin@123)
INSERT INTO users (id, username, email, password_hash, role, city, state_code, rto_code)
VALUES ('MH16A0000001', 'admin', 'admin@citywatch.in', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'ADMIN', 'Nanded', 'MH', '16');

-- SLA Config (Fixed: INSERT with created_by directly)
INSERT INTO sla_config (category, sla_hours, created_by) VALUES
    ('GARBAGE', 72, 'MH16A0000001'), ('POTHOLE', 168, 'MH16A0000001'),
    ('STREETLIGHT', 96, 'MH16A0000001'), ('DRAINAGE', 96, 'MH16A0000001'), ('OTHER', 168, 'MH16A0000001');

-- Coordinators
INSERT INTO users (id, username, email, password_hash, role, city, state_code, rto_code, area_id) VALUES
    ('MH16M0000001', 'ravi_p', 'ravi@citywatch.in', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'COORDINATOR', 'Nanded', 'MH', '16', 1),
    ('MH16M0000002', 'sunita_d', 'sunita@citywatch.in', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'COORDINATOR', 'Nanded', 'MH', '16', 2);

-- Citizens
INSERT INTO users (id, username, email, password_hash, role, city, state_code, rto_code) VALUES
    ('MH16C0000001', 'citizen1', 'c1@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000002', 'citizen2', 'c2@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000003', 'citizen3', 'c3@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000004', 'citizen4', 'c4@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000005', 'citizen5', 'c5@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16');

-- Complaints (10 Vazirabad Specific Issues)
-- Vazirabad Area ID is 3
INSERT INTO complaints (id, citizen_id, area_id, category, description, latitude, longitude, status, priority, created_at) VALUES
    ('CMP-100426-000001', 'MH16C0000001', 3, 'POTHOLE', 'Large pothole emerging near Vazirabad Square, dangerous for two-wheelers.', 19.165, 77.335, 'PENDING_REVIEW', 'HIGH', NOW() - INTERVAL '1 hour'),
    ('CMP-100426-000002', 'MH16C0000002', 3, 'GARBAGE', 'Overflowing community bins near the market area in Vazirabad.', 19.166, 77.336, 'PENDING_REVIEW', 'MEDIUM', NOW() - INTERVAL '3 hours'),
    ('CMP-100426-000003', 'MH16C0000003', 3, 'STREETLIGHT', 'Entire lane behind the main complex has no working streetlights.', 19.164, 77.334, 'PENDING_REVIEW', 'HIGH', NOW() - INTERVAL '5 hours'),
    ('CMP-100426-000004', 'MH16C0000004', 3, 'DRAINAGE', 'Clogged drainage causing water logging near the hospital road.', 19.167, 77.337, 'PENDING_REVIEW', 'CRITICAL', NOW() - INTERVAL '8 hours'),
    ('CMP-100426-000005', 'MH16C0000005', 3, 'GARBAGE', 'Illegal dumping of construction waste on the sidewalk.', 19.163, 77.333, 'PENDING_REVIEW', 'LOW', NOW() - INTERVAL '12 hours'),
    ('CMP-100426-000006', 'MH16C0000001', 3, 'POTHOLE', 'Series of small potholes making the commute very bumpy near Vazirabad Naka.', 19.165, 77.338, 'PENDING_REVIEW', 'MEDIUM', NOW() - INTERVAL '1 day'),
    ('CMP-100426-000007', 'MH16C0000002', 3, 'STREETLIGHT', 'Blinking streetlight at the intersection is very distracting at night.', 19.162, 77.332, 'PENDING_REVIEW', 'LOW', NOW() - INTERVAL '1.5 days'),
    ('CMP-100426-000008', 'MH16C0000003', 3, 'DRAINAGE', 'Foul smell coming from the open drain near the residential colony.', 19.168, 77.339, 'PENDING_REVIEW', 'MEDIUM', NOW() - INTERVAL '2 days'),
    ('CMP-100426-000009', 'MH16C0000004', 3, 'POTHOLE', 'Deep crater formed after recent heavy pipeline work.', 19.164, 77.335, 'PENDING_REVIEW', 'CRITICAL', NOW() - INTERVAL '3 days'),
    ('CMP-100426-000010', 'MH16C0000005', 3, 'OTHER', 'Unauthorised parking blocking the main entry gate of the area.', 19.165, 77.334, 'PENDING_REVIEW', 'LOW', NOW() - INTERVAL '4 days');

-- Images for Vazirabad Complaints
INSERT INTO complaint_images (complaint_id, image_url) VALUES
    ('CMP-100426-000001', 'https://images.unsplash.com/photo-1549413215-673e4b097205?q=80&w=800'),
    ('CMP-100426-000002', 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=800'),
    ('CMP-100426-000004', 'https://images.unsplash.com/photo-1546198632-9ef6368bef12?q=80&w=800'),
    ('CMP-100426-000006', 'https://images.unsplash.com/photo-1667317980667-9d5ed99f829e?q=80&w=800'),
    ('CMP-100426-000009', 'https://images.unsplash.com/photo-1515162816999-a0ca6751f2a3?q=80&w=800');

-- Fast-forward Sequences
SELECT setval('cw_user_c_seq', 5); SELECT setval('cw_user_m_seq', 2); SELECT setval('cw_user_a_seq', 1); SELECT setval('cw_complaint_seq', 10);
