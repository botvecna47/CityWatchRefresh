-- ═══════════════════════════════════════════════════════════════════════════
--  CityWatch — V3: Frontend Wiring & Fixes
--  Adds missing sequences, user settings, coordinator applications, and spam reports
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Missing sequence for SlaScheduler
CREATE SEQUENCE IF NOT EXISTS cw_escalation_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS cw_application_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS cw_spam_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS cw_settings_seq START 1 INCREMENT 1;

-- 2. User Settings
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(12) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    theme VARCHAR(20) DEFAULT 'system',
    UNIQUE(user_id)
);

-- 3. Coordinator Applications
CREATE TABLE IF NOT EXISTS coordinator_applications (
    id VARCHAR(17) PRIMARY KEY, -- e.g. APP-DDMMYY-123456
    user_id VARCHAR(12) NOT NULL REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    experience TEXT NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Spam Reports
CREATE TABLE IF NOT EXISTS spam_reports (
    id VARCHAR(17) PRIMARY KEY, -- e.g. SPM-DDMMYY-123456
    reporter_id VARCHAR(12) NOT NULL REFERENCES users(id),
    reporter_name VARCHAR(100) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('USER', 'REPORT', 'COMMENT')),
    target_id VARCHAR(17) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMP DEFAULT NOW()
);
