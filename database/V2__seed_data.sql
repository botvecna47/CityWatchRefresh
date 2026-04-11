-- ═══════════════════════════════════════════════════════════════════════════
--  CityWatch — V2: Seed Data (Nanded, Maharashtra)
--  Run AFTER V1__initial_schema.sql
--
--  Seeded users:  1 admin + 2 coordinators + 5 citizens  = 8 users
--  Seeded areas:  10 Nanded localities
--  Seeded complaints: 10 realistic civic issues
--
--  All passwords: Admin@123
--  Hash below ($2a$12$) is BCrypt-12 of "Admin@123"
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── SLA Configuration ────────────────────────────────────────────────────────
INSERT INTO sla_config (category, sla_hours) VALUES
    ('GARBAGE',      72),
    ('POTHOLE',     168),
    ('STREETLIGHT',  96),
    ('DRAINAGE',     96),
    ('OTHER',       168);

-- ─── Areas: Nanded City Localities ───────────────────────────────────────────
-- Nanded, Maharashtra — RTO code 16
INSERT INTO areas (name, city, boundary_lat_min, boundary_lat_max, boundary_lng_min, boundary_lng_max, center_lat, center_lng) VALUES
    ('Shivajinagar', 'Nanded', 19.145, 19.165, 77.295, 77.320, 19.155, 77.307),
    ('CIDCO Colony',  'Nanded', 19.135, 19.155, 77.310, 77.340, 19.145, 77.325),
    ('Vazirabad',     'Nanded', 19.155, 19.175, 77.320, 77.350, 19.165, 77.335),
    ('Asarjan',       'Nanded', 19.130, 19.150, 77.280, 77.310, 19.140, 77.295),
    ('Vishnupuri',    'Nanded', 19.160, 19.180, 77.340, 77.370, 19.170, 77.355),
    ('Naganpura',     'Nanded', 19.120, 19.145, 77.300, 77.325, 19.132, 77.312),
    ('New Nanded',    'Nanded', 19.175, 19.195, 77.295, 77.325, 19.185, 77.310),
    ('Degloor Naka',  'Nanded', 19.140, 19.160, 77.355, 77.385, 19.150, 77.370),
    ('Kasba',         'Nanded', 19.150, 19.170, 77.285, 77.310, 19.160, 77.297),
    ('Huzur',         'Nanded', 19.165, 19.185, 77.310, 77.340, 19.175, 77.325);

-- ─── Users: Admin ─────────────────────────────────────────────────────────────
-- ID: MH16A0000001 — Maharashtra, RTO-16 Nanded, Admin, seq #1
-- Password: Admin@123  (BCrypt $2a$12$ hash)
-- ⚠ CHANGE PASSWORD IMMEDIATELY after first login!
INSERT INTO users (id, username, email, password_hash, role, trust_level, status, city, state_code, rto_code)
VALUES (
    'MH16A0000001',
    'admin',
    'admin@citywatch.in',
    '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
    'ADMIN', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16'
);

UPDATE sla_config SET created_by = 'MH16A0000001';

-- ─── Users: Coordinators ──────────────────────────────────────────────────────
-- ID: MH16M0000001, MH16M0000002
INSERT INTO users (id, username, email, password_hash, role, trust_level, status, city, state_code, rto_code, area_id)
VALUES
    ('MH16M0000001', 'ravi_p',  'ravi@citywatch.in',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'COORDINATOR', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16',
     (SELECT id FROM areas WHERE name = 'Shivajinagar')),
    ('MH16M0000002', 'sunita_d', 'sunita@citywatch.in',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'COORDINATOR', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16',
     (SELECT id FROM areas WHERE name = 'CIDCO Colony'));

-- ─── Users: Citizens ──────────────────────────────────────────────────────────
-- IDs: MH16C0000001 → MH16C0000005
INSERT INTO users (id, username, email, password_hash, role, trust_level, status, city, state_code, rto_code)
VALUES
    ('MH16C0000001', 'citizen1', 'c1@gmail.com',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'CITIZEN', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16'),
    ('MH16C0000002', 'citizen2', 'c2@gmail.com',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'CITIZEN', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16'),
    ('MH16C0000003', 'citizen3', 'c3@gmail.com',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'CITIZEN', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16'),
    ('MH16C0000004', 'citizen4', 'c4@gmail.com',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'CITIZEN', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16'),
    ('MH16C0000005', 'citizen5', 'c5@gmail.com',
     '$2a$10$0xzTY2Kcx3zz27kQPhs8MeIllKqtRsR0HSlR5XwxERfxgaKag3Qvi',
     'CITIZEN', 'NORMAL', 'ACTIVE', 'Nanded', 'MH', '16');

-- ─── Fast-forward sequences past seeded values ────────────────────────────────
-- Users (each role has its own seq; we inserted 5C, 2M, 1A so set accordingly)
SELECT setval('cw_user_c_seq', 5);
SELECT setval('cw_user_m_seq', 2);
SELECT setval('cw_user_a_seq', 1);
-- Complaints: we'll insert 10, so next live one will be #11
SELECT setval('cw_complaint_seq', 10);

-- ─── Complaints: 10 realistic Nanded civic issues ────────────────────────────
-- Date prefix: 090426 (09 Apr 2026)
-- Format: CMP-090426-000001 through CMP-090426-000010
INSERT INTO complaints (id, citizen_id, area_id, category, description, latitude, longitude, status, intensity_score, priority, assigned_coordinator_id, sla_deadline, escalation_level, reopen_count, created_at)
VALUES
    (
        'CMP-090426-000001',
        'MH16C0000001',
        (SELECT id FROM areas WHERE name = 'Shivajinagar'),
        'POTHOLE',
        'Large pothole near Shivajinagar bus stop has caused two motorcycle accidents this week. The road is completely broken with exposed rebar.',
        19.155, 77.307, 'ASSIGNED', 3.2, 'HIGH',
        'MH16M0000001',
        NOW() + INTERVAL '5 days',
        0, 0,
        NOW() - INTERVAL '3 days'
    ),
    (
        'CMP-090426-000002',
        'MH16C0000002',
        (SELECT id FROM areas WHERE name = 'CIDCO Colony'),
        'GARBAGE',
        'Garbage pile-up near CIDCO Colony main gate — bins have not been cleared for 6 days. Strong foul smell affecting the entire block.',
        19.145, 77.325, 'IN_PROGRESS', 2.8, 'HIGH',
        'MH16M0000002',
        NOW() + INTERVAL '2 days',
        0, 0,
        NOW() - INTERVAL '5 days'
    ),
    (
        'CMP-090426-000003',
        'MH16C0000003',
        (SELECT id FROM areas WHERE name = 'Vazirabad'),
        'STREETLIGHT',
        'Entire stretch of Vazirabad Road between Post Office and Masjid Road has been without streetlights for 2 weeks. Night walking is dangerous.',
        19.165, 77.335, 'PENDING_REVIEW', 1.5, 'MEDIUM',
        NULL, NULL, 0, 0,
        NOW() - INTERVAL '1 day'
    ),
    (
        'CMP-090426-000004',
        'MH16C0000004',
        (SELECT id FROM areas WHERE name = 'Asarjan'),
        'DRAINAGE',
        'Blocked storm drain near Asarjan naka — stagnant water overflowing onto the footpath. Children from nearby school have to wade through it every morning.',
        19.140, 77.295, 'ASSIGNED', 2.1, 'HIGH',
        'MH16M0000001',
        NOW() + INTERVAL '3 days',
        0, 0,
        NOW() - INTERVAL '4 days'
    ),
    (
        'CMP-090426-000005',
        'MH16C0000005',
        (SELECT id FROM areas WHERE name = 'Vishnupuri'),
        'POTHOLE',
        'Vishnupuri road near water tank has multiple potholes forming. After recent rain they have deepened significantly — water logging during rain.',
        19.170, 77.355, 'PENDING_REVIEW', 0.9, 'LOW',
        NULL, NULL, 0, 0,
        NOW() - INTERVAL '2 hours'
    ),
    (
        'CMP-090426-000006',
        'MH16C0000001',
        (SELECT id FROM areas WHERE name = 'Naganpura'),
        'GARBAGE',
        'Naganpura ward garbage truck has been skipping Tuesday and Friday rounds. Residents are forced to dump waste on the roadside creating an overflowing heap.',
        19.132, 77.312, 'CLOSED', 4.0, 'CRITICAL',
        'MH16M0000002',
        NOW() - INTERVAL '1 day',
        1, 1,
        NOW() - INTERVAL '10 days'
    ),
    (
        'CMP-090426-000007',
        'MH16C0000002',
        (SELECT id FROM areas WHERE name = 'New Nanded'),
        'STREETLIGHT',
        'New Nanded sector 5 — 4 consecutive streetlights are out. Area is completely dark from 8 PM causing safety concerns, especially for women returning from work.',
        19.185, 77.310, 'IN_PROGRESS', 1.8, 'MEDIUM',
        'MH16M0000001',
        NOW() + INTERVAL '4 days',
        0, 0,
        NOW() - INTERVAL '6 days'
    ),
    (
        'CMP-090426-000008',
        'MH16C0000003',
        (SELECT id FROM areas WHERE name = 'Degloor Naka'),
        'DRAINAGE',
        'Degloor Naka junction drain is overflowing and blocking traffic during peak hours. The drain cover is broken and poses a risk to two-wheelers.',
        19.150, 77.370, 'PENDING_REVIEW', 0.5, 'LOW',
        NULL, NULL, 0, 0,
        NOW() - INTERVAL '12 hours'
    ),
    (
        'CMP-090426-000009',
        'MH16C0000004',
        (SELECT id FROM areas WHERE name = 'Kasba'),
        'OTHER',
        'Public drinking water tap at Kasba chowk has been leaking for 10 days, wasting hundreds of litres daily. Multiple complaints to NMC office have gone unanswered.',
        19.160, 77.297, 'ESCALATED', 3.5, 'CRITICAL',
        'MH16M0000002',
        NOW() - INTERVAL '2 days',
        2, 0,
        NOW() - INTERVAL '12 days'
    ),
    (
        'CMP-090426-000010',
        'MH16C0000005',
        (SELECT id FROM areas WHERE name = 'Huzur'),
        'POTHOLE',
        'Huzur area main road has a cluster of 3 potholes near the vegetable market. A cyclist fell yesterday. The potholes are about 8-10 inches deep.',
        19.175, 77.325, 'ASSIGNED', 1.2, 'MEDIUM',
        'MH16M0000001',
        NOW() + INTERVAL '6 days',
        0, 0,
        NOW() - INTERVAL '2 days'
    );

-- ─── Upvotes on some complaints ─────────────────────────────────────────────
INSERT INTO complaint_upvotes (complaint_id, citizen_id) VALUES
    ('CMP-090426-000001', 'MH16C0000002'),
    ('CMP-090426-000001', 'MH16C0000003'),
    ('CMP-090426-000001', 'MH16C0000004'),
    ('CMP-090426-000002', 'MH16C0000001'),
    ('CMP-090426-000002', 'MH16C0000005'),
    ('CMP-090426-000006', 'MH16C0000002'),
    ('CMP-090426-000006', 'MH16C0000003'),
    ('CMP-090426-000006', 'MH16C0000004'),
    ('CMP-090426-000006', 'MH16C0000005'),
    ('CMP-090426-000009', 'MH16C0000001'),
    ('CMP-090426-000009', 'MH16C0000002'),
    ('CMP-090426-000009', 'MH16C0000003');

-- ─── Escalation record for complaint #9 ────────────────────────────────────
SELECT setval('cw_escalation_seq', 1);
INSERT INTO escalations (id, complaint_id, level, reason, notes, is_resolved, triggered_at)
VALUES (
    'ESC-090426-000001',
    'CMP-090426-000009',
    2,
    'SLA_EXCEEDED',
    'SLA deadline exceeded twice. NMC has not responded. Escalated to Admin for direct intervention.',
    FALSE,
    NOW() - INTERVAL '2 days'
);

-- ─── Audit log entries ───────────────────────────────────────────────────────
SELECT setval('cw_audit_seq', 5);
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp) VALUES
    ('AUD-090426-000001', 'MH16M0000001', 'STATUS_CHANGED', 'COMPLAINT', 'CMP-090426-000001', 'ASSIGNED', NOW() - INTERVAL '3 days'),
    ('AUD-090426-000002', 'MH16M0000002', 'STATUS_CHANGED', 'COMPLAINT', 'CMP-090426-000002', 'IN_PROGRESS', NOW() - INTERVAL '4 days'),
    ('AUD-090426-000003', 'MH16M0000002', 'STATUS_CHANGED', 'COMPLAINT', 'CMP-090426-000006', 'CLOSED', NOW() - INTERVAL '1 day'),
    ('AUD-090426-000004', 'MH16A0000001', 'STATUS_CHANGED', 'COMPLAINT', 'CMP-090426-000009', 'ESCALATED', NOW() - INTERVAL '2 days'),
    ('AUD-090426-000005', 'MH16M0000001', 'STATUS_CHANGED', 'COMPLAINT', 'CMP-090426-000007', 'IN_PROGRESS', NOW() - INTERVAL '5 days');
