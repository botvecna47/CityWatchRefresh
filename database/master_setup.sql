-- ═══════════════════════════════════════════════════════════════════════════
--  CityWatch — MASTER SETUP (Clean Slate)
--  Run this ONCE in psql to reset the DB to a clean state.
--  The DataSeeder will repopulate staff accounts and demo data on startup.
--
--  Schema is the single source of truth — matches all 14 JPA entity classes.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. DROP ALL TABLES (dependency order) ──────────────────────────────────
DROP TABLE IF EXISTS audit_logs              CASCADE;
DROP TABLE IF EXISTS notifications           CASCADE;
DROP TABLE IF EXISTS escalations             CASCADE;
DROP TABLE IF EXISTS spam_reports            CASCADE;
DROP TABLE IF EXISTS coordinator_applications CASCADE;
DROP TABLE IF EXISTS user_settings           CASCADE;
DROP TABLE IF EXISTS complaint_upvotes       CASCADE;
DROP TABLE IF EXISTS complaint_images        CASCADE;
DROP TABLE IF EXISTS proofs                  CASCADE;
DROP TABLE IF EXISTS comments                CASCADE;
DROP TABLE IF EXISTS votes                   CASCADE;
DROP TABLE IF EXISTS complaints              CASCADE;
DROP TABLE IF EXISTS categories              CASCADE;
DROP TABLE IF EXISTS sla_config              CASCADE;
DROP TABLE IF EXISTS users                   CASCADE;
DROP TABLE IF EXISTS areas                   CASCADE;

-- ─── 2. DROP ALL SEQUENCES ──────────────────────────────────────────────────
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
DROP SEQUENCE IF EXISTS cw_application_seq;
DROP SEQUENCE IF EXISTS cw_spam_seq;

-- ─── 3. CREATE SEQUENCES ────────────────────────────────────────────────────
CREATE SEQUENCE cw_user_c_seq       START 1 INCREMENT 1;  -- Citizens
CREATE SEQUENCE cw_user_m_seq       START 1 INCREMENT 1;  -- Coordinators
CREATE SEQUENCE cw_user_a_seq       START 1 INCREMENT 1;  -- Admins
CREATE SEQUENCE cw_complaint_seq    START 1 INCREMENT 1;
CREATE SEQUENCE cw_vote_seq         START 1 INCREMENT 1;
CREATE SEQUENCE cw_comment_seq      START 1 INCREMENT 1;
CREATE SEQUENCE cw_proof_seq        START 1 INCREMENT 1;
CREATE SEQUENCE cw_escalation_seq   START 1 INCREMENT 1;
CREATE SEQUENCE cw_notification_seq START 1 INCREMENT 1;
CREATE SEQUENCE cw_audit_seq        START 1 INCREMENT 1;
CREATE SEQUENCE cw_application_seq  START 1 INCREMENT 1;
CREATE SEQUENCE cw_spam_seq         START 1 INCREMENT 1;

-- ─── 4. CREATE TABLES ───────────────────────────────────────────────────────

-- TABLE: areas  (Entity: Area.java)
CREATE TABLE areas (
    id               BIGSERIAL        PRIMARY KEY,
    name             VARCHAR(100)     UNIQUE NOT NULL,
    city             VARCHAR(100)     NOT NULL,
    boundary_lat_min DOUBLE PRECISION,
    boundary_lat_max DOUBLE PRECISION,
    boundary_lng_min DOUBLE PRECISION,
    boundary_lng_max DOUBLE PRECISION,
    center_lat       DOUBLE PRECISION NOT NULL,
    center_lng       DOUBLE PRECISION NOT NULL,
    deleted          BOOLEAN          DEFAULT FALSE,
    created_at       TIMESTAMP        DEFAULT NOW()
);

-- TABLE: users  (Entity: User.java)
CREATE TABLE users (
    id             VARCHAR(12)  PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(15)  UNIQUE,
    role           VARCHAR(20)  NOT NULL CHECK (role IN ('CITIZEN','COORDINATOR','ADMIN')),
    trust_level    VARCHAR(20)  DEFAULT 'NORMAL'  CHECK (trust_level IN ('NORMAL','UNDER_REVIEW','RESTRICTED')),
    status         VARCHAR(20)  DEFAULT 'ACTIVE'  CHECK (status IN ('ACTIVE','WARNING','SUSPENDED')),
    strike_count   INTEGER      DEFAULT 0,
    area_id        BIGINT       REFERENCES areas(id),
    city           VARCHAR(100) NOT NULL,
    state_code     VARCHAR(2),
    rto_code       VARCHAR(2),
    created_at     TIMESTAMP    DEFAULT NOW(),
    updated_at     TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_status   ON users(status);

-- TABLE: user_settings  (Entity: UserSettings.java)
CREATE TABLE user_settings (
    id                  BIGSERIAL    PRIMARY KEY,
    user_id             VARCHAR(12)  NOT NULL UNIQUE REFERENCES users(id),
    email_notifications BOOLEAN      DEFAULT TRUE,
    sms_notifications   BOOLEAN      DEFAULT FALSE,
    theme               VARCHAR(20)  DEFAULT 'system'
);

-- TABLE: categories  (Entity: Category.java)
CREATE TABLE categories (
    id                BIGSERIAL    PRIMARY KEY,
    name              VARCHAR(100) UNIQUE NOT NULL,
    description       VARCHAR(255),
    default_sla_hours INTEGER      NOT NULL DEFAULT 120,
    deleted           BOOLEAN      DEFAULT FALSE,
    created_at        TIMESTAMP    DEFAULT NOW()
);

-- TABLE: sla_config  (Entity: SlaConfig.java)
CREATE TABLE sla_config (
    id         BIGSERIAL   PRIMARY KEY,
    category   VARCHAR(30) UNIQUE NOT NULL CHECK (category IN ('POTHOLE','GARBAGE','STREETLIGHT','DRAINAGE','OTHER')),
    sla_hours  INTEGER     NOT NULL,
    deleted    BOOLEAN     DEFAULT FALSE,
    created_by VARCHAR(12) REFERENCES users(id),
    updated_at TIMESTAMP   DEFAULT NOW()
);

-- TABLE: complaints  (Entity: Complaint.java)
CREATE TABLE complaints (
    id                      VARCHAR(17)      PRIMARY KEY,
    citizen_id              VARCHAR(12)      NOT NULL REFERENCES users(id),
    area_id                 BIGINT           NOT NULL REFERENCES areas(id),
    category_id             BIGINT           NOT NULL REFERENCES categories(id),
    title                   VARCHAR(100),
    description             TEXT             NOT NULL,
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    status                  VARCHAR(30)      NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT','PENDING_REVIEW','APPROVED','REJECTED',
                                              'ASSIGNED','IN_PROGRESS','DELAYED','COMPLETED',
                                              'CLOSED','REOPENED','ESCALATED')),
    intensity_score         DOUBLE PRECISION DEFAULT 0.0,
    priority                VARCHAR(10)      DEFAULT 'LOW'
                            CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    assigned_coordinator_id VARCHAR(12)      REFERENCES users(id),
    sla_deadline            TIMESTAMP,
    escalation_level        INTEGER          DEFAULT 0,
    reopen_count            INTEGER          DEFAULT 0,
    deleted                 BOOLEAN          DEFAULT FALSE,
    created_at              TIMESTAMP        DEFAULT NOW(),
    updated_at              TIMESTAMP        DEFAULT NOW(),
    closed_at               TIMESTAMP
);

CREATE INDEX idx_complaint_citizen  ON complaints(citizen_id);
CREATE INDEX idx_complaint_area     ON complaints(area_id);
CREATE INDEX idx_complaint_status   ON complaints(status);
CREATE INDEX idx_complaint_cat      ON complaints(category_id);
CREATE INDEX idx_complaint_priority ON complaints(priority);
CREATE INDEX idx_complaint_sla      ON complaints(sla_deadline) WHERE sla_deadline IS NOT NULL;

-- TABLE: complaint_images  (JPA @ElementCollection)
CREATE TABLE complaint_images (
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    image_url    VARCHAR(500) NOT NULL
);
CREATE INDEX idx_complaint_images_cid ON complaint_images(complaint_id);

-- TABLE: complaint_upvotes  (JPA @ElementCollection)
CREATE TABLE complaint_upvotes (
    complaint_id VARCHAR(17)  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id   VARCHAR(12)  NOT NULL
);
CREATE UNIQUE INDEX idx_upvote_unique ON complaint_upvotes(complaint_id, citizen_id);

-- TABLE: votes  (Entity: Vote.java)
CREATE TABLE votes (
    id             VARCHAR(17) PRIMARY KEY,
    complaint_id   VARCHAR(17) NOT NULL REFERENCES complaints(id),
    coordinator_id VARCHAR(12) NOT NULL REFERENCES users(id),
    decision       VARCHAR(20) NOT NULL CHECK (decision IN ('VALID','INVALID','NEEDS_CLARIFICATION')),
    comment        TEXT,
    voted_at       TIMESTAMP   DEFAULT NOW(),
    UNIQUE(complaint_id, coordinator_id)
);
CREATE INDEX idx_votes_complaint ON votes(complaint_id);

-- TABLE: proofs  (Entity: Proof.java)
CREATE TABLE proofs (
    id                      VARCHAR(17)      PRIMARY KEY,
    complaint_id            VARCHAR(17)      NOT NULL REFERENCES complaints(id),
    coordinator_id          VARCHAR(12)      NOT NULL REFERENCES users(id),
    image_url               VARCHAR(500)     NOT NULL,
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    distance_from_complaint DOUBLE PRECISION,
    is_location_valid       BOOLEAN          DEFAULT FALSE,
    submitted_at            TIMESTAMP        DEFAULT NOW()
);
CREATE INDEX idx_proofs_complaint ON proofs(complaint_id);

-- TABLE: comments  (Entity: Comment.java)
CREATE TABLE comments (
    id           VARCHAR(17) PRIMARY KEY,
    complaint_id VARCHAR(17) NOT NULL REFERENCES complaints(id),
    user_id      VARCHAR(12) NOT NULL REFERENCES users(id),
    content      TEXT        NOT NULL,
    parent_id    VARCHAR(17) REFERENCES comments(id),
    is_moderated BOOLEAN     DEFAULT FALSE,
    created_at   TIMESTAMP   DEFAULT NOW()
);
CREATE INDEX idx_comments_complaint ON comments(complaint_id);

-- TABLE: escalations  (Entity: Escalation.java)
CREATE TABLE escalations (
    id           VARCHAR(17) PRIMARY KEY,
    complaint_id VARCHAR(17) NOT NULL REFERENCES complaints(id),
    level        INTEGER     NOT NULL CHECK (level BETWEEN 1 AND 3),
    reason       VARCHAR(50) NOT NULL CHECK (reason IN ('SLA_EXCEEDED','CITIZEN_REJECTION','ADMIN_TRIGGER')),
    notes        TEXT,
    is_resolved  BOOLEAN     DEFAULT FALSE,
    triggered_at TIMESTAMP   DEFAULT NOW(),
    resolved_at  TIMESTAMP
);
CREATE INDEX idx_escalations_complaint ON escalations(complaint_id);

-- TABLE: notifications  (Entity: Notification.java)
CREATE TABLE notifications (
    id           VARCHAR(17)  PRIMARY KEY,
    user_id      VARCHAR(12)  NOT NULL REFERENCES users(id),
    title        VARCHAR(200) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(30)  NOT NULL
                 CHECK (type IN ('COMPLAINT_UPDATE','VOTE_REQUIRED','SLA_WARNING','ESCALATION','SYSTEM')),
    reference_id VARCHAR(17),
    is_read      BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- TABLE: audit_logs  (Entity: AuditLog.java)
CREATE TABLE audit_logs (
    id          VARCHAR(17) PRIMARY KEY,
    user_id     VARCHAR(12) REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id   VARCHAR(17) NOT NULL,
    old_value   TEXT,
    new_value   TEXT,
    ip_address  VARCHAR(45),
    timestamp   TIMESTAMP   DEFAULT NOW()
);
CREATE INDEX idx_audit_entity    ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- TABLE: coordinator_applications  (Entity: CoordinatorApplication.java)
CREATE TABLE coordinator_applications (
    id         VARCHAR(17)  PRIMARY KEY,
    user_id    VARCHAR(12)  NOT NULL REFERENCES users(id),
    user_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL,
    phone      VARCHAR(20)  NOT NULL,
    address    TEXT         NOT NULL,
    experience TEXT         NOT NULL,
    message    TEXT,
    status     VARCHAR(20)  DEFAULT 'PENDING',
    created_at TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX idx_applications_user   ON coordinator_applications(user_id);
CREATE INDEX idx_applications_status ON coordinator_applications(status);

-- TABLE: spam_reports  (Entity: SpamReport.java)
CREATE TABLE spam_reports (
    id            VARCHAR(17)  PRIMARY KEY,
    reporter_id   VARCHAR(12)  NOT NULL REFERENCES users(id),
    reporter_name VARCHAR(100) NOT NULL,
    target_type   VARCHAR(20)  NOT NULL,
    target_id     VARCHAR(17)  NOT NULL,
    reason        TEXT         NOT NULL,
    status        VARCHAR(20)  DEFAULT 'PENDING',
    created_at    TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX idx_spam_reporter ON spam_reports(reporter_id);
CREATE INDEX idx_spam_status   ON spam_reports(status);

-- ─── 5. SEED DEMO DATA ──────────────────────────────────────────────────────
-- NOTE: DataSeeder.java will also re-seed this on every startup (idempotent).
-- This seed data is here so the DB is usable even before first boot.

-- Areas (Nanded)
INSERT INTO areas (name, city, center_lat, center_lng) VALUES
    ('Shivajinagar', 'Nanded', 19.165, 77.305),
    ('CIDCO Colony',  'Nanded', 19.125, 77.325),
    ('Vazirabad',     'Nanded', 19.1538, 77.3130),
    ('Asarjan',       'Nanded', 19.124, 77.285),
    ('Vishnupuri',    'Nanded', 19.112, 77.289),
    ('Naganpura',     'Nanded', 19.085, 77.321),
    ('New Nanded',    'Nanded', 19.182, 77.312),
    ('Degloor Naka',  'Nanded', 19.145, 77.340),
    ('Kasba',         'Nanded', 19.162, 77.302),
    ('Huzur',         'Nanded', 19.172, 77.315);

-- Categories (matches Category enum: GARBAGE, POTHOLE, DRAINAGE, STREETLIGHT, OTHER)
INSERT INTO categories (name, description, default_sla_hours) VALUES
    ('GARBAGE',      'Waste and garbage-related issues',  72),
    ('POTHOLE',      'Road and pothole issues',           168),
    ('DRAINAGE',     'Drainage and waterlogging issues',  96),
    ('STREETLIGHT',  'Street lighting issues',            48),
    ('OTHER',        'Other civic issues',                120);

-- Admin (password = Admin@123)
INSERT INTO users (id, username, email, password_hash, role, city, state_code, rto_code)
VALUES ('MH16A0000001', 'admin', 'admin@citywatch.in',
        '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
        'ADMIN', 'Nanded', 'MH', '16');

-- Coordinators (Shivajinagar = area 1, CIDCO Colony = area 2)
INSERT INTO users (id, username, email, password_hash, role, city, state_code, rto_code, area_id) VALUES
    ('MH16M0000001', 'ravi_p',   'ravi@citywatch.in',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'COORDINATOR', 'Nanded', 'MH', '16', 1),
    ('MH16M0000002', 'sunita_d', 'sunita@citywatch.in',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'COORDINATOR', 'Nanded', 'MH', '16', 2);

-- Citizens
INSERT INTO users (id, username, email, password_hash, role, city, state_code, rto_code) VALUES
    ('MH16C0000001', 'citizen1', 'c1@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000002', 'citizen2', 'c2@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000003', 'citizen3', 'c3@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000004', 'citizen4', 'c4@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16'),
    ('MH16C0000005', 'citizen5', 'c5@gmail.com', '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi', 'CITIZEN', 'Nanded', 'MH', '16');

-- Complaints (Vazirabad = area 3, Shivajinagar = area 1)
-- Category IDs: GARBAGE=1, POTHOLE=2, DRAINAGE=3, STREETLIGHT=4, OTHER=5
INSERT INTO complaints (id, citizen_id, area_id, category_id, title, description, latitude, longitude, status, priority, assigned_coordinator_id, intensity_score, sla_deadline) VALUES
    ('CMP-100426-000001', 'MH16C0000001', 3, 2,
     'Large pothole in Vazirabad Market',
     'Large pothole near Vazirabad main market has caused two motorcycle accidents this week.',
     19.1535, 77.3128, 'IN_PROGRESS', 'HIGH', 'MH16M0000001', 3.5,
     NOW() + INTERVAL '5 days'),
    ('CMP-100426-000002', 'MH16C0000002', 3, 1,
     'Overflowing garbage at Vazirabad Square',
     'Garbage pile-up near Vazirabad Square main gate — bins not cleared for 6 days.',
     19.1542, 77.3140, 'ASSIGNED', 'HIGH', 'MH16M0000002', 3.5,
     NOW() + INTERVAL '3 days'),
    ('CMP-100426-000003', 'MH16C0000003', 3, 4,
     'Broken streetlights in residential lane',
     'Entire lane behind the main residential complex has no working streetlights.',
     19.1528, 77.3145, 'PENDING_REVIEW', 'MEDIUM', NULL, 1.5,
     NOW() + INTERVAL '2 days'),
    ('CMP-100426-000004', 'MH16C0000001', 3, 3,
     'Blocked storm drain near Post Office',
     'Blocked storm drain near Vazirabad Post Office — stagnant water overflowing onto road.',
     19.1550, 77.3115, 'ASSIGNED', 'HIGH', 'MH16M0000001', 3.5,
     NOW() + INTERVAL '4 days'),
    ('CMP-100426-000005', 'MH16C0000001', 1, 5,
     'Local Image Test Issue',
     'This complaint uses the local favicon to test if local image loading works correctly.',
     19.1555, 77.3075, 'PENDING_REVIEW', 'LOW', NULL, 0.5,
     NOW() + INTERVAL '5 days');

-- Images
INSERT INTO complaint_images (complaint_id, image_url) VALUES
    ('CMP-100426-000001', 'https://images.unsplash.com/photo-1594495024543-7496797a396e?w=600'),
    ('CMP-100426-000002', 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600'),
    ('CMP-100426-000003', 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=600'),
    ('CMP-100426-000004', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'),
    ('CMP-100426-000005', '/favicon.png');

-- Demo comment
INSERT INTO comments (id, complaint_id, user_id, content) VALUES
    ('CMT-100426-000001', 'CMP-100426-000001', 'MH16M0000001',
     'Team dispatched to assess road damage. Repair work begins tomorrow morning.');

-- SLA Config
INSERT INTO sla_config (category, sla_hours, created_by) VALUES
    ('GARBAGE',     72,  'MH16A0000001'),
    ('POTHOLE',     168, 'MH16A0000001'),
    ('STREETLIGHT', 96,  'MH16A0000001'),
    ('DRAINAGE',    96,  'MH16A0000001'),
    ('OTHER',       168, 'MH16A0000001');

-- ─── 6. ADVANCE SEQUENCES ───────────────────────────────────────────────────
SELECT setval('cw_user_c_seq',       5);
SELECT setval('cw_user_m_seq',       2);
SELECT setval('cw_user_a_seq',       1);
SELECT setval('cw_complaint_seq',    5);
SELECT setval('cw_comment_seq',      1);
SELECT setval('cw_notification_seq', 1);
SELECT setval('cw_audit_seq',        1);
SELECT setval('cw_application_seq',  1);
SELECT setval('cw_spam_seq',         1);
