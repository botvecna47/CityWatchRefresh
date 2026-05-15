-- CityWatch Schema Migration — Add missing columns that exist in Java entities but not in Supabase DB
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/zutdbxtzwaktrrfjtetg/sql
-- 
-- ROOT CAUSE: spring.jpa.hibernate.ddl-auto=update failed to add new columns to existing tables
-- in Supabase because Supabase restricts DDL mutations via the connection pooler.

-- ─── 1. complaints.deleted (soft-delete flag) ─────────────────────────────────
-- This is the PRIMARY crash cause: @SQLRestriction("deleted = false") on Complaint entity
-- makes Hibernate append WHERE deleted = false to EVERY complaint query.
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT false;

-- ─── 2. complaints.title (nullable) ───────────────────────────────────────────
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS title VARCHAR(100);

-- ─── 3. complaints.intensity_score ────────────────────────────────────────────
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS intensity_score DOUBLE PRECISION DEFAULT 0.0;

-- ─── 4. complaints.escalation_level ───────────────────────────────────────────
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;

-- ─── 5. complaints.reopen_count ───────────────────────────────────────────────
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reopen_count INTEGER DEFAULT 0;

-- ─── 6. complaints.closed_at ──────────────────────────────────────────────────
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;

-- ─── 7. complaint_images (ElementCollection table for imageUrls) ──────────────
CREATE TABLE IF NOT EXISTS complaint_images (
    complaint_id VARCHAR(17) NOT NULL REFERENCES complaints(id),
    image_url VARCHAR(500) NOT NULL
);

-- ─── 8. complaint_upvotes (ElementCollection table for upvotedCitizenIds) ─────
CREATE TABLE IF NOT EXISTS complaint_upvotes (
    complaint_id VARCHAR(17) NOT NULL REFERENCES complaints(id),
    citizen_id VARCHAR(12) NOT NULL
);

-- ─── 9. users.city (was nullable but entity marks it NOT NULL) ─────────────────
-- If this column exists already, this is a no-op:
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
-- Make sure existing rows don't violate NOT NULL (set to 'Nanded' as default):
UPDATE users SET city = 'Nanded' WHERE city IS NULL;

-- ─── 10. users.state_code and rto_code ────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS state_code VARCHAR(2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rto_code VARCHAR(2);

-- ─── Verify critical column exists ────────────────────────────────────────────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'complaints'
  AND column_name = 'deleted';
-- Expected result: deleted | boolean | NO | false
